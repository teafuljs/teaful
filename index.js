import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  useRef,
} from "react";

const libName = "Fragstore";

export default function createStore(defaultStore = {}, defaultCallbacks = {}) {
  const mainContext = createContext();
  const useMainContext = () => useContext(mainContext);
  const hooks = {};
  const contexts = {};
  let allStore = defaultStore;
  let initialStore = defaultStore;
  let keys = Object.keys(defaultStore);

  function createMissingContexts(force) {
    let updated = false;

    for (let key of keys) {
      if (!force && (contexts[key] || hooks[key])) continue;

      const context = createContext(allStore[key]);

      if (!(key in initialStore)) initialStore[key] = undefined;
      context.displayName = `${libName}(${key})`;
      updated = true;
      contexts[key] = context;
      hooks[key] = () => useContext(context);
    }

    if (!updated) return;

    hooks.__store = () => {
      const addNewValues = useMainContext();
      const state = {};
      const updates = {};
      keys.forEach((key) => {
        if (key === "store") return;
        const [s, u] = hooks[key]();
        state[key] = s;
        updates[key] = u;
      });

      function updater(newState) {
        const s =
          typeof newState === "function" ? newState(state) : newState || {};
        addNewValues(s);
        Object.keys(s).forEach((k) => updates[k] && updates[k](s[k]));
      }

      function reset() {
        updater(initialStore);
      }

      return [state, updater, reset];
    };
  }

  mainContext.displayName = libName;
  createMissingContexts();

  /**
   * createStore function returns the Provider component with the 
   * useStore hook.
   * 
   * @returns {object} { Provider, useStore }
   */
  return {

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
    Provider({ store = {}, callbacks = {}, children }) {
      const [, forceRender] = useState(0);
      const initialized = useRef();

      function initStore() {
        initialStore = { ...initialStore, ...store };
        addNewValues(store);
      }

      if (!initialized.current) initStore();

      useEffect(() => {
        if (initialized.current) return initStore();
        initialized.current = true;
      }, [store]);

      const el = Object.keys(contexts)
        .map((key) => {
          const Provider = ({ children }) => {
            const context = contexts[key];
            const [value, setter] = useState(allStore[key]);
            const cb = callbacks[key] || defaultCallbacks[key];

            const updater = (newValue) => {
              let nVal = newValue;
              if (typeof nVal === "function") nVal = newValue(value);
              allStore[key] = nVal;
              setter(newValue);
              if (typeof cb === "function") cb(nVal, value, setter);
            };

            const reset = () => {
              updater(initialStore[key]);
            };

            return (
              <context.Provider value={[value, updater, reset]}>
                {children}
              </context.Provider>
            );
          };
          Provider.displayName = `${libName}(${key})`;
          return Provider;
        })
        .reduce((c, Provider) => <Provider>{c}</Provider>, children);

      function addNewValues(vals, force) {
        const newKeys = Object.keys(vals);
        if (!newKeys.length) return;
        const oldKeysLength = keys.length;
        keys = [...new Set([...keys, ...newKeys])];
        if (keys.length === oldKeysLength) return;
        allStore = { ...allStore, ...vals };
        createMissingContexts(force);
        forceRender((v) => v + 1);
      }

      return (
        <mainContext.Provider value={addNewValues}>{el}</mainContext.Provider>
      );
    },

    /**
     * useStore is a hook that returns a Proxy object that can be used to read
     * and write properties of the store.
     * 
     * @example
     * // Default usage
     * const [age, setAge, resetAge] = useStore().age
     * 
     * // Is possible to consume a non existing property of the store
     * const [invented, setInvented, resetInvented] = useStore().invented
     * 
     * // or all the store together
     * const [store, update, reset] = useStore()
     */
    useStore() {
      return new Proxy([], {
        get: (_, prop) => {
          // const [store, update, reset] = useStore()
          if (prop > -1) return hooks.__store()[prop];

          // const [age, setAge, resetAge] = useStore().age
          if (prop in hooks) return hooks[prop]();

          // const [invented, setInvented, resetInvented] = useStore().invented
          return [undefined, (v) => useMainContext()({ [prop]: v }), () => { }];
        },
      });
    },
  };
}
