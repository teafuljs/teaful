import {useEffect, useReducer, useRef} from 'react';

const MODE_GET = 1;
const MODE_USE = 2;
const MODE_WITH = 3;
const DISCARD = new Set(['prototype', 'isReactComponent']);

export default function createStore(defaultStore = {}, defaultCallbacks = {}) {
  const subscription = createSubscription();

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
   * const { Store } = createStore({ count: 0 })
   * // ...
   * <Store>{children}</Store>
   *
   * // Creating the default store in the Store
   * const { Store } = createStore()
   * // ...
   * <Store store={{ count: 0 }}>{children}</Store>
   *
   * // Defining callbacks
   * const { Store } = createStore({ count: 0 })
   * // ...
   * <Store callbacks={{ count: (v) => console.log(v) }}>
   *  {children}
   * </Store>
   * @return {React.ReactNode} children
   */
  function Store({store = {}, callbacks = {}, children}) {
    const initialized = useRef();

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
  const validator = {
    path: [],
    subscribe(prop, value, update, initializeValue) {
      useEffect(() => initializeValue && update(value), []);
      useSubscription(prop ? `store.${prop}` : 'store');
    },
    getHoC(Comp, store, path, initializeValue) {
      const componentName = Comp.displayName || Comp.name || 'Component';
      const WithStore = (props) => {
        this.subscribe(path, store[0], store[1], initializeValue);
        return <Comp {...props} store={store} />;
      };
      WithStore.displayName = `withStore(${componentName})`;
      return WithStore;
    },
    get(target, path) {
      if (!DISCARD.has(path)) this.path.push(path);
      return new Proxy(target, validator);
    },
    apply(getMode, _, args) {
      const mode = getMode();
      const param = args[mode === MODE_WITH ? 1 : 0];
      const path = this.path.slice();
      this.path = [];

      // .........................
      // ALL STORE (unfragmented):
      // .........................
      if (path.length === 0) {
        // subscribe to the store
        if (mode === MODE_USE) this.subscribe();

        const store = [allStore, updateAllStore, resetAllStore];

        return mode === MODE_WITH ?
         //
         // MODE_WITH: withStore(Component)
         this.getHoC(args[0], store) :
         //
         // MODE_USE: const [store, update, reset] = useStore()
         //
         // MODE_GET: const [store, update, reset] = getStore()
         store;
      }

      // .................
      // FRAGMENTED STORE:
      // .................
      const prop = path.join('.');
      const update = updateField(prop);
      const reset = resetField(prop);
      let value = getField(allStore, prop);

      const initializeValue =
        param !== undefined &&
        value === undefined &&
        getField(initialStore, prop) === undefined;

      // Initialize the value if is not defined
      if (initializeValue) {
        value = param;
        initialStore = setField(initialStore, path, value);
      }

      // subscribe to the fragmented store
      if (mode === MODE_USE) {
        this.subscribe(prop, value, update, initializeValue);
      }

      const store = [value, update, reset];

      return mode === MODE_WITH ?
        //
        // MODE_WITH: Similar to useStore but in a HoC
        // withStore.cart.price(Component)
        this.getHoC(args[0], store, prop, initializeValue) :
        //
        // MODE_USE: hook with subscription, rerender component after an update:
        // const [price, setPrice, resetPrice] = useStore.cart.price()
        //
        // MODE_GET: without subscription, to use outside components:
        // const [price, setPrice, resetPrice] = getStore.cart.price()
        store;
    },
  };
  const useStore = new Proxy(() => MODE_USE, validator);
  const getStore = new Proxy(() => MODE_GET, validator);
  const withStore = new Proxy(() => MODE_WITH, validator);

  /**
   * Hook to register a listener to force a render when the
   * subscribed field changes.
   * @param {string} key
   */
  function useSubscription(key) {
    const [, forceRender] = useReducer((v) => v + 1, 0);

    useEffect(() => {
      subscription.subscribe(key, forceRender);
      return () => subscription.unsubscribe(key, forceRender);
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
      subscription.notify(`store.${field}`),
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
    const fieldPath = Array.isArray(path) ? path : path.split('.');
    const [firstKey] = fieldPath;
    const isCb = callCallback && typeof allCallbacks[firstKey] === 'function';
    const prevValue = isCb ? getField(allStore, fieldPath) : undefined;

    return (newValue) => {
      let value = newValue;

      if (typeof newValue === 'function') {
        value = newValue(getField(allStore, path));
      }

      allStore = setField(allStore, fieldPath, value);
      subscription.notify(`store.${path}`);

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
  const newObj = Array.isArray(store) ? [...store] : {...store};
  newObj[prop] = rest.length ? setField(store[prop], rest, value) : value;
  return newObj;
}

function createSubscription() {
  const listeners = {};

  return {
    subscribe(key, listener) {
      if (!listeners[key]) listeners[key] = new Set();
      listeners[key].add(listener);
    },
    notify(key) {
      Object.keys(listeners).forEach((listenersKey) => {
        if (key.startsWith(listenersKey) || listenersKey.startsWith(key)) {
          listeners[listenersKey].forEach((listener) => listener());
        }
      });
    },
    unsubscribe(key, listener) {
      listeners[key].delete(listener);
      if (listeners[key].size === 0) delete listeners[key];
    },
  };
}
