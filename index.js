import React, { useState, useContext, createContext, useEffect } from "react";

const libName = "FragmentedStore";

export default function createStore(defaultStore = {}, defaultCallbacks = {}) {
  const mainContext = createContext();
  const useMainContext = () => useContext(mainContext);
  const hooks = {};
  const contexts = {};
  let allStore = defaultStore;
  let initStore = defaultStore;
  let keys = Object.keys(defaultStore);

  function Provider({ store = {}, callbacks = {}, children }) {
    const [, forceRender] = useState(0);

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
            updater(initStore[key]);
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

    mainContext.displayName = libName;

    useEffect(() => {
      initStore = { ...initStore, ...store };
      addNewValues(store);
    }, [store]);

    function addNewValues(vals, force) {
      const newKeys = Object.keys(vals);
      if (!newKeys.length) return;
      const oldKeysLength = keys.length;
      keys = [...new Set([...keys, ...newKeys])];
      if (keys.length === oldKeysLength) return;
      allStore = { ...allStore, ...vals };
      addMissingContextsAndHooks(force);
      forceRender((v) => v + 1);
    }

    return (
      <mainContext.Provider value={addNewValues}>{el}</mainContext.Provider>
    );
  }

  function addMissingContextsAndHooks(force) {
    let updated = false;

    for (let key of keys) {
      if (!force && (contexts[key] || hooks[key])) continue;

      const context = createContext([
        allStore[key],
        () =>
          console.error(
            "You can't change store value because store provider not found."
          )
      ]);

      if (!(key in initStore)) initStore[key] = undefined;
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
        updater(initStore);
      }

      return [state, updater, reset];
    };
  }

  addMissingContextsAndHooks();

  return {
    Provider,
    useStore() {
      return new Proxy([], {
        get: (_, prop) => {
          // const [store, update, reset] = useStore()
          if (prop > -1) {
            return hooks.__store()[prop];
          }

          // const [age, setAge, resetAge] = useStore().age
          if (prop in hooks) return hooks[prop]();

          // const [invented, setInvented, resetInvented] = useStore().invented
          const addNewValues = useMainContext();
          const updater = (v) => addNewValues({ [prop]: v });
          return [undefined, updater, () => { }];
        }
      });
    }
  };
}
