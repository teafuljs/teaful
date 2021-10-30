import {useEffect, useReducer} from 'react';

let MODE_GET = 1;
let MODE_USE = 2;
let MODE_WITH = 3;
let DOT = '.';

export default function createStore(defaultStore = {}, callback) {
  let subscription = createSubscription();

  // Initialize the store and callbacks
  let allStore = defaultStore;
  let initialStore = defaultStore;

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
    _getHoC(Comp, path, initValue) {
      let componentName = Comp.displayName || Comp.name || 'Component';
      let WithStore = (props) => {
        let last = path.length - 1;
        let store = path.length ? path.reduce(
            (a, c, index) => index === last ? a[c](initValue) : a[c],
            useStore,
        ) : useStore(initValue);
        return <Comp {...props} store={store} />;
      };
      WithStore.displayName = `withStore(${componentName})`;
      return WithStore;
    },
    get(target, path) {
      if (path === 'prototype') return;
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
      // MODE_GET: let [store, update, reset] = useStore()
      // MODE_USE: let [store, update, reset] = getStore()
      if (!path.length) {
        let updateAll = updateField();
        if (mode === MODE_USE) useSubscription(DOT, callback);
        return [allStore, updateAll, resetField()];
      }

      // .................
      // FRAGMENTED STORE:
      // .................
      let prop = path.join(DOT);
      let update = updateField(prop);
      let reset = resetField(prop);
      let value = getField(allStore, prop);

      let initializeValue =
        param !== undefined &&
        value === undefined &&
        getField(initialStore, prop) === undefined;

      // Initialize the value if is not defined
      if (initializeValue) {
        value = param;
        initialStore = setField(initialStore, path, value);
        allStore = setField(allStore, path, value);
      }

      // subscribe to the fragmented store
      if (mode === MODE_USE) {
        useEffect(() => initializeValue && update(value), []);
        useSubscription(DOT+prop, callback);
      }

      // MODE_GET: let [price, setPrice] = useStore.cart.price()
      // MODE_USE: let [price, setPrice] = getStore.cart.price()
      return [value, update, reset];
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
    let listener = useReducer(() => ({}), 0)[1];

    useEffect(() => {
      subscription._subscribe(path, listener);
      subscription._subscribe(path, callback);
      return () => {
        subscription._unsubscribe(path, listener);
        subscription._unsubscribe(path, callback);
      };
    }, []);
  }

  /**
   * 1. Updates any field of the store
   * 2. Notifies to all the involved subscribers
   * @param {string} path
   * @return {function} update
   */
  function updateField(path = '') {
    let fieldPath = Array.isArray(path) ? path : path.split(DOT);
    let prevValue = getField(allStore, fieldPath);

    return (newValue) => {
      let value = newValue;

      if (typeof newValue === 'function') {
        value = newValue(getField(allStore, path));
      }

      allStore = path ?
       // Update a field
       setField(allStore, fieldPath, value) :
       // Update all the store
       {...allStore, ...value};

      // Notifying to all subscribers
      subscription._notify(DOT+path, {
        path: fieldPath.join(DOT),
        value,
        prevValue,
        getStore,
      });
    };
  }

  /**
   * Reset a field of the store
   *
   * When resetField(path) is called, the field of the store is
   * reset to the initial value.
   * @param {string} path
   * @return {function}
   */
  function resetField(path) {
    return () => updateField(path)(getField(initialStore, path));
  }

  /**
   * createStore function returns:
   * - useStore hook
   * - getStore helper
   * - withStore HoC
   * @returns {object}
   */
  return {useStore, getStore, withStore};
}

// ##########################################################
// ######################  Helpers  #########################
// ##########################################################

function getField(store, path) {
  if (!path) return store;
  return (Array.isArray(path) ? path : path.split(DOT)).reduce(
      (a, c) => a?.[c],
      store,
  );
}

function setField(store = {}, [prop, ...rest], value) {
  let newObj = Array.isArray(store) ? [...store] : {...store};
  newObj[prop] = rest.length ? setField(store[prop], rest, value) : value;
  return newObj;
}

function createSubscription() {
  let listeners = {};

  return {
    _subscribe(path, listener) {
      if (typeof listener !== 'function') return;
      if (!listeners[path]) listeners[path] = new Set();
      listeners[path].add(listener);
    },
    _notify(path, param) {
      Object.keys(listeners).forEach((listenersKey) => {
        if (path.startsWith(listenersKey) || listenersKey.startsWith(path)) {
          listeners[listenersKey].forEach((listener) => listener(param));
        }
      });
    },
    _unsubscribe(path, listener) {
      if (typeof listener !== 'function') return;
      listeners[path].delete(listener);
      if (listeners[path].size === 0) delete listeners[path];
    },
  };
}
