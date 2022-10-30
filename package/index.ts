import {useEffect, createElement, ComponentClass, FunctionComponent} from 'react';
import {useSyncExternalStore} from 'use-sync-external-store/shim';
import type { Args, ArgsHoc, ExtraFn, Hoc, Listener, ListenersObj, Params, ReducerFn, Result, Store, Subscription, Validator } from './types';

let MODE_GET = 1;
let MODE_USE = 2;
let MODE_WITH = 3;
let MODE_SET = 4;
let DOT = '.';
let extras: ExtraFn<Store>[] = [];

export default function createStore<S extends Store>(
  initial: S = {} as S, 
  storeCallback?: Listener<S>
) {
  // For extra functions
  let subscription = createSubscription<S>();

  // For useSyncExternalStore
  const listeners = new Set<() => void>();

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  function notifyListeners() {
    listeners.forEach((listener) => listener());
  }

  // Initialize the store and callbacks
  let allStore = initial;

  /**
   * Proxy validator that implements:
   * - useStore hook proxy
   * - getStore helper proxy
   * - setStore helper proxy
   * - withStore HoC proxy
   */
  let validator: Validator<S> = {
    _path: [] as string[],
    _getHoC<S extends Store>(
      Comp: ComponentClass<Hoc<S>>, 
      path: string[], 
      initValue: S, 
      callback?:  Listener<S>
    ) {
      let componentName = Comp.displayName || Comp.name;
      let WithStore: FunctionComponent = (props) => {
        let last = path.length - 1;
        let store = path.length ? path.reduce(
            (a: Store, c: string, index) => index === last 
              ? a[c](initValue, callback) 
              : a[c],
            useStore,
        ) : useStore(initValue, callback);
        return createElement<Hoc<S>>(
          Comp, {...props, store}
        );
      };
      WithStore.displayName = `withStore(${componentName})`;
      return WithStore;
    },
    get(target: () => number, path: string) {
      this._path.push(path);
      return path === 'prototype' ? {} : new Proxy(target, validator);
    },
    apply(getMode: () => number, _: unknown, args: Args<S> | ArgsHoc<S>) {
      let mode = getMode();
      let param = args[0];
      let proxyCallback = args[1] as Listener<S> | undefined;
      let path = this._path.slice();
      this._path = [];

      // MODE_WITH: withStore(Component)
      // MODE_WITH: withStore.cart.price(Component, 0)
      if (mode === MODE_WITH) {
        return this._getHoC(args[0], path, args[1], args[2]);
      }

      // ALL STORE (unfragmented):
      //
      // MODE_GET: let [store, update] = useStore()
      // MODE_USE: let [store, update] = getStore()
      // MODE_SET: setStore({ newStore: true })
      if (!path.length) {
        let updateAll = updateField('', proxyCallback);
        if (mode === MODE_USE) {
          const current = useSyncExternalStore(
            subscribe,
            () => allStore,
          );
          return [current, updateAll];
        }
        if (mode === MODE_SET) return updateAll(param);
        return [allStore, updateAll];
      }

      // .................
      // FRAGMENTED STORE:
      // .................
      let prop = path.join(DOT);
      let update = updateField(prop, proxyCallback);
      let value = getField(prop);
      let initializeValue = param !== undefined && !existProperty(path);

      // MODE_SET: setStore.cart.price(10)
      if (mode === MODE_SET) return update(param);

      if (initializeValue) {
        value = param;
        const prevStore = allStore;
        allStore = setField(allStore, path, value);

        if (proxyCallback) {
          proxyCallback({ prevStore, store: allStore });
        }
        if (storeCallback) {
          storeCallback({ prevStore, store: allStore });
        }
      }

      // subscribe to the fragmented store
      if (mode === MODE_USE) {
        value = useSyncExternalStore(
          subscribe,
          () => getField(prop),
        );

        useEffect(() => {
          if (initializeValue) update(value);
        }, []);
      }

      // MODE_GET: let [price, setPrice] = useStore.cart.price()
      // MODE_USE: let [price, setPrice] = getStore.cart.price()
      return [value, update];
    },
  };
  let createProxy = (mode: number) => new Proxy(() => mode, validator);
  let useStore = createProxy(MODE_USE);
  let getStore = createProxy(MODE_GET);
  let withStore = createProxy(MODE_WITH);
  let setStore = createProxy(MODE_SET);

  /**
   * 1. Updates any field of the store
   * 2. Notifies to all the involved subscribers
   * @param {string} path
   * @param {function} after
   * @return {function} update
   */
  function updateField(path = '', after?: (params: Params<S>) => void) {
    let fieldPath = Array.isArray(path) ? path : path.split(DOT);

    return (newValue: unknown) => {
      let prevStore = allStore;
      let value = newValue;

      if (typeof newValue === 'function') {
        value = newValue(getField(path));
      }

      allStore = path ?
        // Update a field
        setField(allStore, fieldPath, value) :
        // Update all the store
        value;

      // Notify extra functions
      subscription._notify(DOT + path, {
        prevStore,
        store: allStore,
      });

      if (after) {
        after({ prevStore, store: allStore });
      }
      if (storeCallback) {
        storeCallback({ prevStore, store: allStore });
      }

      notifyListeners();
    };
  }

  function getField(
    path?: string[] | string, 
    fn: ReducerFn = (a, c) => a?.[c]
  ) {
    if (!path) return allStore;
    return (Array.isArray(path) ? path : path.split(DOT))
      .reduce(fn, allStore);
  }

  function setField(store: Store, [prop, ...rest]: string[], value: any) {
    let newObj: any = Array.isArray(store) ? [...store] : {...store};
    newObj[prop] = rest.length ? setField(store[prop], rest, value) : value;
    return newObj;
  }

  function existProperty(path: string[] | string) {
    return getField(path, (a = {}, c, index, arr) => {
      if (index === (arr as string[]).length - 1) return c in a;
      return a[c];
    });
  }

  let result = extras.reduce((res, fn) => {
    let newRes = fn(res, subscription);
    return typeof newRes === 'object' ? {...res, ...newRes} : res;
  }, {useStore, getStore, withStore, setStore} as Result<Store>);

  /**
   * createStore function returns:
   * - useStore hook
   * - getStore helper
   * - setStore helper
   * - withStore HoC
   * - extras that 3rd party can add
   * @returns {object}
   */
  return result as Result<S>;
}

createStore.ext = (extra: ExtraFn<Store>) => extras.push(extra);

// Exists just for extra functions
function createSubscription<S extends Store>(): Subscription<S> {
  let listeners: ListenersObj<S> = {};

  return {
    // Renamed to "s" after build to minify code
    _subscribe(path, listener) {
      if (typeof listener === 'function') {
        if (!listeners[path]) listeners[path] = new Set();
        listeners[path].add(listener);
      }
    },
    // Renamed to "n" after build to minify code
    _notify(path, params) {
      Object.keys(listeners).forEach((listenerKey) => {
        if (path.startsWith(listenerKey) || listenerKey.startsWith(path)) {
          listeners[listenerKey].forEach((listener) => listener(params));
        }
      });
    },
    // Renamed to "u" after build to minify code
    _unsubscribe(path, listener) {
      if (typeof listener === 'function') {
        listeners[path].delete(listener);
        if (listeners[path].size === 0) delete listeners[path];
      }
    },
  };
}
