import React, { useState, useContext, createContext } from "react";

export default function createStore(store = {}) {
  const keys = Object.keys(store);
  const capitalize = (k) => `${k[0].toUpperCase()}${k.slice(1, k.length)}`;

  const storeUtils = keys.reduce((o, key) => {
    const context = createContext(store[key]);

    return {
      ...o,
      contexts: [...(o.contexts || []), { context, key }],
      [`use${capitalize(key)}`]: () => useContext(context)
    };
  }, {});

  storeUtils.Provider = ({ children }) => {
    const Empty = ({ children }) => children;
    const Component = storeUtils.contexts
      .map(({ context, key }) => ({ children }) => {
        const ctx = useState(store[key]);
        return <context.Provider value={ctx}>{children}</context.Provider>;
      })
      .reduce(
        (RestProviders, Provider) => ({ children }) => (
          <Provider>
            <RestProviders>{children}</RestProviders>
          </Provider>
        ),
        Empty
      );

    return <Component>{children}</Component>;
  };

  storeUtils.useUnfragmentedStore = () => {
    const state = {};
    const updates = {};
    keys.forEach((k) => {
      const [s, u] = storeUtils[`use${capitalize(k)}`]();
      state[k] = s;
      updates[k] = u;
    });

    function updater(newState) {
      const s =
        typeof newState === "function" ? newState(state) : newState || {};
      Object.keys(s).forEach((k) => updates[k] && updates[k](s[k]));
    }

    return [state, updater];
  };

  return storeUtils;
}
