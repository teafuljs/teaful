import React, { useState, useContext, createContext, useEffect } from "react";

const libName = "FragmentedStore";

export default function createStore(defaultStore = {}, defaultCallbacks = {}) {
  const capitalize = (k) => `${k[0].toUpperCase()}${k.slice(1, k.length)}`;
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
      const keyCapitalized = capitalize(key);

      if (!force && (contexts[key] || hooks[`use${keyCapitalized}`])) continue;

      const context = createContext([
        allStore[key],
        () =>
          console.error(
            "You can't change store value because store provider not found."
          )
      ]);
      const useHook = () => useContext(context);

      if (keyCapitalized === "Store") {
        console.error(
          'Avoid to use the "store" name at the first level, it\'s reserved for the "useStore" hook.'
        );
      }
      if (!(key in initStore)) initStore[key] = undefined;
      context.displayName = `${libName}(${key})`;
      updated = true;
      contexts[key] = context;
      hooks[`use${keyCapitalized}`] = useHook;
    }

    if (!updated) return;

    hooks.useStore = () => {
      const addNewValues = useMainContext();
      const state = {};
      const updates = {};
      keys.forEach((k) => {
        const hookName = `use${capitalize(k)}`;
        if (hookName === "useStore") return;
        const [s, u] = hooks[hookName]();
        state[k] = s;
        updates[k] = u;
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

  function useHooks() {
    return new Proxy(hooks, {
      get: (target, prop) => {
        if (prop in target) return target[prop];
        return () => {
          const addNewValues = useMainContext();
          let key = prop.replace("use", "");
          key = key.replace(key[0], key[0].toLowerCase());
          const updater = (v) => addNewValues({ [key]: v });
          return [undefined, updater, () => { }];
        };
      }
    });
  }

  addMissingContextsAndHooks();

  return { Provider, useHooks };
}
