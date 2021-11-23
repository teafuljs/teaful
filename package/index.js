import {useEffect, useReducer, createElement} from 'react';

let MODE_GET = 1;
let MODE_USE = 2;
let MODE_WITH = 3;
let DOT = '.';
let extras = [];

export default function createStore(defaultStore = {}, callback) {
  let subscription = createSubscription();

  // Initialize the store and callbacks
  let allStore = defaultStore;

  // Add callback subscription
  subscription._subscribe(DOT, callback);

  /**
   * Proxy validator that implements:
   * - useStore hook proxy
   * - getStore helper proxy
   * - withStore HoC proxy
   */
  let validator = {
    _path: [],
    _getHoC(Comp, path, initValue, callback) {
      let componentName = Comp.displayName || Comp.name || 'Component';
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
      if (!path.length) {
        let updateAll = updateField();
        if (mode === MODE_USE) useSubscription(DOT, callback);
        return [allStore, updateAll];
      }

      // .................
      // FRAGMENTED STORE:
      // .................
      let prop = path.join(DOT);
      let update = updateField(prop);
      let value = getField(prop);
      let initializeValue = param !== undefined && !existProperty(path);

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
  let useStore = new Proxy(() => MODE_USE, validator);
  let getStore = new Proxy(() => MODE_GET, validator);
  let withStore = new Proxy(() => MODE_WITH, validator);

  /**
   * Hook to register a listener to force a render when the
   * subscribed field changes.
   * @param {string} path
   * @param {function} callback
   */
  function useSubscription(path, callback) {
    let forceRender = useReducer(() => ({}), 0)[1];

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

      // Notifying to all subscribers
      subscription._notify(DOT+path, {
        prevStore,
        store: allStore,
      });
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
  }, {useStore, getStore, withStore});

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

function createSubscription() {
  let listeners = {};

  return {
    // Renamed to "s" after build to minify code
    _subscribe(path, listener) {
      if (typeof listener !== 'function') return;
      if (!listeners[path]) listeners[path] = new Set();
      listeners[path].add(listener);
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
      if (typeof listener !== 'function') return;
      listeners[path].delete(listener);
      if (listeners[path].size === 0) delete listeners[path];
    },
  };
}
