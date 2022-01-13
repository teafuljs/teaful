// @ts-nocheck
import React, {useEffect, useReducer, createElement} from 'react';

let MODE_GET = 1;
let MODE_USE = 2;
let MODE_WITH = 3;
let MODE_SET = 4;
let DOT = '.';
let extras: Function[] = [];

export default function createStore<S extends Store>(initial: S = {} as S, callback?: afterCallbackType<S>) {
  let subscription = createSubscription<S>();

  // Initialize the store and callbacks
  let allStore = initial;

  // Add callback subscription
  subscription._subscribe(DOT, callback);

  /**
   * Proxy validator that implements:
   * - useStore hook proxy
   * - getStore helper proxy
   * - withStore HoC proxy
   */
  let validator: Validator = {
    _path: [] as string[],
    _getHoC<S extends Store>(Comp: React.ComponentClass, path: string[], initValue: S, callback?:  afterCallbackType<S>) {
      let componentName = Comp.displayName || Comp.name || '';
      let WithStore: React.FunctionComponent = (props) => {
        let last = path.length - 1;
        let store = path.length ? path.reduce(
            (a: Store, c: string, index) => index === last ? a[c](initValue, callback) : a[c],
            useStore,
        ) : useStore(initValue, callback);
        return createElement(Comp, {...props, store});
      };
      WithStore.displayName = `withStore(${componentName})`;
      return WithStore;
    },
    get(target: Function, path: string) {
      if (path === 'prototype') return {};
      this._path.push(path);
      return new Proxy(target, validator);
    },
    apply(getMode: Function, _: any, args: any[]) {
      let mode = getMode();
      let param = args[0];
      let callback = args[1];
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
        let updateAll = updateField();
        if (mode === MODE_USE) useSubscription(DOT, callback);
        if (mode === MODE_SET) return updateAll(param);
        return [allStore, updateAll];
      }

      // .................
      // FRAGMENTED STORE:
      // .................
      let prop = path.join(DOT);
      let update = updateField(prop);
      let value = getField(prop);
      let initializeValue = param !== undefined && !existProperty(path);

      // MODE_SET: setStore.cart.price(10)
      if (mode === MODE_SET) return update(param);

      if (initializeValue) {
        value = param;
        allStore = setField(allStore, path, value);
      }

      // subscribe to the fragmented store
      if (mode === MODE_USE) {
        useEffect(() => {
          if (initializeValue) update(value);
        }, []);
        useSubscription(DOT+prop, callback);
      }

      // MODE_GET: let [price, setPrice] = useStore.cart.price()
      // MODE_USE: let [price, setPrice] = getStore.cart.price()
      return [value, update];
    },
  };
  let createProxy = (mode: Number) => new Proxy(() => mode, validator);
  let useStore = createProxy(MODE_USE);
  let getStore = createProxy(MODE_GET);
  let withStore = createProxy(MODE_WITH);
  let setStore = createProxy(MODE_SET);

  /**
   * Hook to register a listener to force a render when the
   * subscribed field changes.
   * @param {string} path
   * @param {function} callback
   */
  function useSubscription(path: string, callback?: Function) {
    let forceRender = (useReducer as Function)(() => [])[1];

    useEffect(() => {
      subscription._subscribe(path, forceRender);
      subscription._subscribe(DOT, callback);
      return () => {
        subscription._unsubscribe(path, forceRender);
        subscription._unsubscribe(DOT, callback);
      };
    }, [path]);
  }

  /**
   * 1. Updates any field of the store
   * 2. Notifies to all the involved subscribers
   * @param {string} path
   * @return {function} update
   */
  function updateField(path = '') {
    let fieldPath = Array.isArray(path) ? path : path.split(DOT);

    return (newValue: any) => {
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

      // Notifying to all subscribers
      subscription._notify(DOT+path, {
        prevStore,
        store: allStore,
      });
    };
  }

  function getField(path?: string[] | string, fn: ReducerFn = (a, c) => a?.[c]) {
    if (!path) return allStore;
    return (Array.isArray(path) ? path : path.split(DOT)).reduce(fn, allStore);
  }

  function setField(store: Store, [prop, ...rest]: string[], value: any) {
    let newObj: any = Array.isArray(store) ? [...store] : {...store};
    newObj[prop] = rest.length ? setField(store[prop], rest, value) : value;
    return newObj;
  }

  function existProperty(path: string[] | string) {
    return getField(path, (a, c, index, arr) => {
      if (index === arr!.length - 1) return c in (a || {});
      return a?.[c];
    });
  }

  let result = extras.reduce((res, fn) => {
    let newRes = fn(res, subscription);
    return typeof newRes === 'object' ? {...res, ...newRes} : res;
  }, {useStore, getStore, withStore, setStore});

  /**
   * createStore function returns:
   * - useStore hook
   * - getStore helper
   * - setStore helper
   * - withStore HoC
   * - extras that 3rd party can add
   * @returns {object}
   */
  return result as {
    getStore: HookDry<S> & getStoreType<S>;
    useStore: Hook<S> & useStoreType<S>;
    withStore: HocFunc<S> & withStoreType<S>;
    setStore: Setter<S> & setStoreType<S>;
  } & Extra;
}

createStore.ext = (extra: Function) => extras.push(extra);

function createSubscription<S extends Store>() {
  let listeners: { [key: string]: Set<Function> } = {};

  return {
    // Renamed to "s" after build to minify code
    _subscribe(path: string, listener?: Function) {
      if (typeof listener !== 'function') return;
      if (!listeners[path]) listeners[path] = new Set();
      listeners[path].add(listener);
    },
    // Renamed to "n" after build to minify code
    _notify(path: string, params: Params<S>) {
      Object.keys(listeners).forEach((listenerKey) => {
        if (path.startsWith(listenerKey) || listenerKey.startsWith(path)) {
          listeners[listenerKey].forEach((listener) => listener(params));
        }
      });
    },
    // Renamed to "u" after build to minify code
    _unsubscribe(path: string, listener?: Function) {
      if (typeof listener !== 'function') return;
      listeners[path].delete(listener);
      if (listeners[path].size === 0) delete listeners[path];
    },
  };
}

/**
 * TypeScript types
 */
type Setter<T> = (value?: T | ((value: T) => T | undefined | null) ) => void;
type HookReturn<T> = [T, Setter<T>];
type Store = Record<string, any>;
type ReducerFn = (a: Store, c: string, index?: Number, arr?: string[]) => any

type Extra = {
  [key: string]: any;
}

type Validator =  ProxyHandler<Function> & Extra

type Hook<S> = (
  initial?: S,
  onAfterUpdate?: afterCallbackType<S>
) => HookReturn<S>;

type HookDry<S> = (initial?: S) => HookReturn<S>;

export type Hoc<S> = { store: HookReturn<S> };

type HocFunc<S, R extends React.ComponentClass = React.ComponentClass> = (
  component: R,
  initial?: S,
  onAfterUpdate?: afterCallbackType<S>
) => R & { store: useStoreType<S> };

type Params<S extends Store> = {store: S, prevStore: S };

type afterCallbackType<S extends Store> = (param: Params<S>) => void;

type getStoreType<S extends Store> = {
  [key in keyof S]: S[key] extends Store
    ? useStoreType<S[key]> & HookDry<S[key]> : HookDry<S[key]>;
};

type setStoreType<S extends Store> = {
  [key in keyof S]: S[key] extends Store
    ? setStoreType<S[key]> & Setter<S[key]> : Setter<S[key]>;
};

type useStoreType<S extends Store> = {
  [key in keyof S]: S[key] extends Store
    ? useStoreType<S[key]> & Hook<S[key]> : Hook<S[key]>;
};

type withStoreType<S extends Store> = {
  [key in keyof S]: S[key] extends Store
    ? withStoreType<S[key]> & HocFunc<S[key]>
    : HocFunc<S[key]>;
};
