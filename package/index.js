import {useEffect, useReducer, useRef} from 'react';

let MODE_GET = 1;
let MODE_USE = 2;
let MODE_WITH = 3;

export default function createStore(defaultStore = {}, defaultCallbacks = {}) {
  let subscription = createSubscription();

  // Initialize the store and callbacks
  let allStore = defaultStore;
  let initialStore = defaultStore;
  let allCallbacks = defaultCallbacks;

  /**
   * Store of the store
   *
   * @example
   *
   * // Default usage
   * let { Store } = createStore({ count: 0 })
   * // ...
   * <Store>{children}</Store>
   *
   * // Creating the default store in the Store
   * let { Store } = createStore()
   * // ...
   * <Store store={{ count: 0 }}>{children}</Store>
   *
   * // Defining callbacks
   * let { Store } = createStore({ count: 0 })
   * // ...
   * <Store callbacks={{ count: (v) => console.log(v) }}>
   *  {children}
   * </Store>
   * @return {React.ReactNode} children
   */
  function Store({store = {}, callbacks = {}, children}) {
    let initialized = useRef();

    if (!initialized.current) {
      initialStore = allStore = {...allStore, ...store};
      allCallbacks = {...allCallbacks, ...callbacks};
    }

    useEffect(() => {
      if (!initialized.current) return (initialized.current = true);
      allCallbacks = {...allCallbacks, ...callbacks};
      updateAllStore(store);
    }, [store, callbacks]);

    return children;
  }

  /**
   * Proxy validator that implements:
   * - useStore hook proxy
   * - getStore helper proxy
   * - withStore HoC proxy
   */
  let validator = {
    path: [],
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
      if (path === 'isReactComponent') return;
      this.path.push(path);
      return new Proxy(target, validator);
    },
    apply(getMode, _, args) {
      let mode = getMode();
      let param = args[0];
      let path = this.path.slice();
      this.path = [];

      // MODE_WITH: withStore(Component)
      // MODE_WITH: withStore.cart.price(Component, 0)
      if (mode === MODE_WITH) {
        return this._getHoC(args[0], path, args[1]);
      }

      // ALL STORE (unfragmented):
      //
      // MODE_GET: let [store, update, reset] = useStore()
      // MODE_USE: let [store, update, reset] = getStore()
      if (!path.length) {
        if (mode === MODE_USE) useSubscription('store');
        return [allStore, updateAllStore, resetAllStore];
      }

      // .................
      // FRAGMENTED STORE:
      // .................
      let prop = path.join('.');
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
        useSubscription(`store.${prop}`);
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
   * @param {string} key
   */
  function useSubscription(key) {
    let [, forceRender] = useReducer((v) => v + 1, 0);

    useEffect(() => {
      subscription._subscribe(key, forceRender);
      return () => subscription._unsubscribe(key, forceRender);
    }, []);
  }

  /**
   * Update all store and notifies to all fields
   *
   * This way, if updateAllStore({ name: 'John' }) is called,
   * the other fields of the store doesn't need to be notified.
   * @param {any} newStore
   */
  function updateAllStore(newStore) {
    let fields = newStore;

    if (typeof newStore === 'function') fields = newStore(allStore);

    allStore = {...allStore, ...fields};
    Object.keys(fields).forEach((field) =>
      subscription._notify(`store.${field}`),
    );
  }

  /**
   * Reset all store and notifies to all fields
   *
   * When resetAllStore() is called, all fields of the store
   * are reset to the initial value.
   */
  function resetAllStore() {
    updateAllStore(initialStore);
  }

  /**
   * 1. Updates any field of the store
   * 2. Notifies to all the involved subscribers
   * 3. Calls the callback if defined
   * @param {string} path
   * @param {boolean} callCallback
   * @return {any}
   */
  function updateField(path, callCallback = true) {
    let fieldPath = Array.isArray(path) ? path : path.split('.');
    let [firstKey] = fieldPath;
    let isCb = callCallback && typeof allCallbacks[firstKey] === 'function';
    let prevValue = isCb ? getField(allStore, fieldPath) : undefined;

    return (newValue) => {
      let value = newValue;

      if (typeof newValue === 'function') {
        value = newValue(getField(allStore, path));
      }

      allStore = setField(allStore, fieldPath, value);
      subscription._notify(`store.${path}`);

      if (isCb) {
        allCallbacks[firstKey]({
          path: fieldPath.join('.'),
          value,
          prevValue,
          updateValue: updateField(path, false),
        });
      }
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
   * createStore function returns the Store component with:
   * - Store component
   * - useStore hook
   * - getStore helper
   * - withStore HoC
   * @returns {object}
   */
  return {Store, useStore, getStore, withStore};
}

// ##########################################################
// ######################  Helpers  #########################
// ##########################################################

function getField(store, path) {
  return (Array.isArray(path) ? path : path.split('.')).reduce(
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
    _subscribe(key, listener) {
      if (!listeners[key]) listeners[key] = new Set();
      listeners[key].add(listener);
    },
    _notify(key) {
      Object.keys(listeners).forEach((listenersKey) => {
        if (key.startsWith(listenersKey) || listenersKey.startsWith(key)) {
          listeners[listenersKey].forEach((listener) => listener());
        }
      });
    },
    _unsubscribe(key, listener) {
      listeners[key].delete(listener);
      if (listeners[key].size === 0) delete listeners[key];
    },
  };
}
