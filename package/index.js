import { useEffect, useReducer, useRef } from "react";

export default function createStore(defaultStore = {}, defaultCallbacks = {}) {
  const subscription = createSubscription();

  // Initialize the store and callbacks
  let allStore = defaultStore;
  let initialStore = defaultStore;
  let allCallbacks = defaultCallbacks;

  /**
   * Provider of the store
   *
   * @example
   *
   * // Default usage
   * const { Provider } = createStore({ count: 0 })
   * // ...
   * <Provider>{children}</Provider>
   *
   * // Creating the default store in the Provider
   * const { Provider } = createStore()
   * // ...
   * <Provider store={{ count: 0 }}>{children}</Provider>
   *
   * // Defining callbacks
   * const { Provider } = createStore({ count: 0 })
   * // ...
   * <Provider callbacks={{ count: (v) => console.log(v) }}>{children}</Provider>
   */
  function Provider({ store = {}, callbacks = {}, children }) {
    const initialized = useRef();

    if (!initialized.current) {
      initialStore = allStore = { ...allStore, ...store };
      allCallbacks = { ...allCallbacks, ...callbacks };
    }

    useEffect(() => {
      if (!initialized.current) return (initialized.current = true);
      allCallbacks = { ...allCallbacks, ...callbacks };
      updateAllStore(store);
    }, [store, callbacks]);

    return children;
  }

  /**
   * useStore is a hook that returns a Proxy object that can be used to read
   * and write properties of the store.
   *
   * @example
   * // Default usage
   * const [age, setAge, resetAge] = useStore.age()
   * const [cartQuantity, setCartQuantity] = useStore.cart.quantity()
   *
   * // Consume/create/update new properties of the store
   * const [newProp, setNewProp, resetNewProp] = useStore.newProp()
   *
   * // Consume/update or all the store properties
   * const [store, updateStore, resetStore] = useStore()
   */
  const validator = {
    path: [],
    discard: new Set(["prototype", "isReactComponent"]),
    get(_, path) {
      if (!this.discard.has(path)) this.path.push(path);
      return new Proxy(() => { }, validator);
    },
    apply() {
      const path = this.path.slice();
      this.path = [];

      // const [store, update, reset] = useStore()
      if (path.length === 0) {
        useSubscription("store");
        return [allStore, updateAllStore, resetAllStore];
      }

      // const [age, setAge, resetAge] = useStore.age()
      // const [cartQuantity, setCartQuantity] = useStore.cart.quantity()
      // const [newProp, setNewProp, resetNewProp] = useStore.newProp()
      const prop = path.join(".");
      useSubscription(`store.${prop}`);
      return [getField(allStore, prop), updateField(prop), resetField(prop)];
    }
  };
  const useStore = new Proxy(() => { }, validator);

  /**
   *
   * Hook to register a listener to force a render when the
   * subscribed field changes.
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
   */
  function updateAllStore(newStore) {
    let fields = newStore;

    if (typeof newStore === "function") fields = newStore(allStore);

    allStore = { ...allStore, ...fields };
    Object.keys(fields).forEach((field) =>
      subscription.notify(`store.${field}`)
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
   */
  function updateField(path, callCallback = true) {
    const fieldPath = Array.isArray(path) ? path : path.split(".");
    const [firstKey] = fieldPath;
    const isCb = callCallback && typeof allCallbacks[firstKey] === "function";
    const cb = isCb ? allCallbacks[firstKey] : undefined;
    const prevValue = isCb ? getField(allStore, fieldPath) : undefined;

    return (newValue) => {
      let value = newValue;

      if (typeof newValue === "function") {
        value = newValue(getField(allStore, path));
      }

      allStore = setField(allStore, fieldPath, value);
      subscription.notify(`store.${path}`);

      if (isCb) {
        cb({
          path: fieldPath.join("."),
          value,
          prevValue,
          updateValue: updateField(path, false)
        });
      }
    };
  }

  /**
   * Reset a field of the store
   * 
   * When resetField(path) is called, the field of the store is 
   * reset to the initial value.
   */
  function resetField(path) {
    return () => updateField(path)(getField(initialStore, path));
  }

  /**
   * createStore function returns the Provider component with the
   * useStore hook.
   *
   * @returns {object} { Provider, useStore }
   */
  return { Provider, useStore };
}

// ##########################################################
// ######################  Helpers  #########################
// ##########################################################

function getField(store, path) {
  return (Array.isArray(path) ? path : path.split(".")).reduce(
    (a, c) => a?.[c],
    store
  );
}

function setField(store = {}, [prop, ...rest], value) {
  const newObj = Array.isArray(store) ? [...store] : { ...store };
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
    }
  };
}
