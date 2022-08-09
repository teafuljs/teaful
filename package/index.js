import {useEffect, createElement} from 'react';
import {useSyncExternalStore} from 'use-sync-external-store/shim';

let MODE_GET = 1;
let MODE_USE = 2;
let MODE_WITH = 3;
let MODE_SET = 4;
let DOT = '.';
let extras = [];

export default function createStore(defaultStore = {}, storeCallback) {
  const listeners = new Set();
  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  function notifyListeners() {
    listeners.forEach((l) => l());
  }

  // Initialize the store and callbacks
  let allStore = defaultStore;

  /**
   * Proxy validator that implements:
   * - useStore hook proxy
   * - getStore helper proxy
   * - withStore HoC proxy
   */
  let validator = {
    _path: [],
    _getHoC(Comp, path, initValue, callback) {
      let componentName = Comp.displayName || Comp.name || '';
      let WithStore = (props) => {
        let last = path.length - 1;
        let store = path.length ? path.reduce(
            (a, c, index) => index === last ? a[c](initValue, callback) : a[c],
            useStore,
        ) : useStore(initValue, callback);
        return createElement(Comp, {...props, store});
      };
      WithStore.displayName = `withStore(${componentName})`;
      return WithStore;
    },
    get(target, path) {
      if (path === 'prototype') return {};
      this._path.push(path);
      return new Proxy(target, validator);
    },
    apply(getMode, _, args) {
      let mode = getMode();
      let param = args[0];
      let proxyCallback = args[1];
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
  let createProxy = (mode) => new Proxy(() => mode, validator);
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
  function updateField(path = '', after) {
    let fieldPath = Array.isArray(path) ? path : path.split(DOT);

    return (newValue) => {
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

      if (after) {
        after({ prevStore, store: allStore });
      }
      if (storeCallback) {
        storeCallback({ prevStore, store: allStore });
      }
      
      notifyListeners();
    };
  }

  function getField(path, fn = (a, c) => a?.[c]) {
    if (!path) return allStore;
    return (Array.isArray(path) ? path : path.split(DOT)).reduce(fn, allStore);
  }

  function setField(store, [prop, ...rest], value) {
    let newObj = Array.isArray(store) ? [...store] : {...store};
    newObj[prop] = rest.length ? setField(store[prop], rest, value) : value;
    return newObj;
  }

  function existProperty(path) {
    return getField(path, (a, c, index, arr) => {
      if (index === arr.length - 1) return c in (a || {});
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
   * - withStore HoC
   * - extras that 3rd party can add
   * @returns {object}
   */
  return result;
}

createStore.ext = (extra) => typeof extra === 'function' && extras.push(extra);
