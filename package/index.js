import { useEffect, useReducer, useRef } from "react";

export default function createStore(defaultStore = {}, defaultCallbacks = {}) {
  const subscription = createSubscription()

  // Initialize the store and callbacks
  let allStore = defaultStore
  let initialStore = defaultStore
  let allCallbacks = defaultCallbacks

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
      initialStore = allStore = { ...allStore, ...store }
      allCallbacks = { ...allCallbacks, ...callbacks }
    }

    useEffect(() => {
      if (!initialized.current) return initialized.current = true
      allCallbacks = { ...allCallbacks, ...callbacks }
      updateAllStore(store)
    }, [store, callbacks])

    return children
  }

  /**
  * useStore is a hook that returns a Proxy object that can be used to read
  * and write properties of the store.
  * 
  * @example
  * // Default usage
  * const [age, setAge, resetAge] = useStore().age
  * 
  * // Consume/create/update new properties of the store
  * const [newProp, setNewProp, resetNewProp] = useStore().newProp
  * 
  * // Consume/update or all the store properties
  * const [store, updateStore, resetStore] = useStore()
  */
  function useStore() {
    return new Proxy([], {
      get: (_, prop) => {
        // const [store, update, reset] = useStore()
        if (prop > -1) {
          useSubscription('store')
          return [allStore, updateAllStore, resetAllStore][prop];
        }

        // const [age, setAge, resetAge] = useStore().age
        // const [newProp, setNewProp, resetNewProp] = useStore().newProp
        useSubscription(`store.${prop}`)
        return [getField(allStore, prop), updateField(prop), resetField(prop)]
      },
    });
  }

  /**
   * 
   * Hook to register a listener to force a render when the 
   * subscribed field changes.
   */
  function useSubscription(key) {
    const [, forceRender] = useReducer(v => v + 1, 0)

    useEffect(() => {
      subscription.subscribe(key, forceRender)
      return () => subscription.unsubscribe(key, forceRender)
    }, [])
  }

  /**
   * Update all store and notifies to all fields
   * 
   * This way, if updateAllStore({ name: 'John' }) is called,
   * the other fields of the store doesn't need to be notified.
   */
  function updateAllStore(newStore) {
    let fields = newStore

    if (typeof newStore === 'function') fields = newStore(allStore)

    allStore = { ...allStore, ...fields }
    Object.keys(fields).forEach(
      field => subscription.notify(`store.${field}`)
    )
  }

  function resetAllStore() {
    updateAllStore(initialStore)
  }

  function updateField(path) {
    return (newValue) => {
      let value = newValue;
      const fieldPath = Array.isArray(path) ? path : path.split(".");

      if (typeof newValue === "function") {
        value = newValue(getField(allStore, path));
      }

      allStore = setField(allStore, fieldPath, value);
      subscription.notify(`store.${path}`);
    };
  }

  function resetField(path) {
    return () => updateField(path)(getField(initialStore, path))
  }

  /**
   * createStore function returns the Provider component with the 
   * useStore hook.
   * 
   * @returns {object} { Provider, useStore }
   */
  return { Provider, useStore }
}

function getField(store, path) {
  return (Array.isArray(path) ? path : path.split('.'))
    .reduce((a, c) => (a && a[c] ? a[c] : undefined), store)
}

function setField(store = {}, [prop, ...rest], value) {
  const newObj = Array.isArray(store) ? [...store] : { ...store };
  newObj[prop] = rest.length ? setField(store[prop], rest, value) : value;
  return newObj;
}

function createSubscription() {
  const listeners = {}

  return {
    subscribe(key, listener) {
      if (!listeners[key]) listeners[key] = new Set()
      listeners[key].add(listener)
    },
    notify(key) {
      Object.keys(listeners).forEach(listenersKey => {
        if (key.startsWith(listenersKey) || listenersKey.startsWith(key)) {
          listeners[listenersKey].forEach(listener => listener())
        }
      })
    },
    unsubscribe(key, listener) {
      listeners[key].delete(listener)
    }
  }
}
