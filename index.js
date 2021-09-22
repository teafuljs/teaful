import React, { useState, useContext, createContext } from "react";

export default function createStore(store = {}) {
  const keys = Object.keys(store);
  const capitalize = (k) => `${k[0].toUpperCase()}${k.slice(1, k.length)}`;

  // Store utils is the object that we will return with everything 
  // (Provider, hooks). 
  //
  // We initialize it by creating a context for each property and 
  // returning a hook to consume the context of each property.
  const storeUtils = keys.reduce((o, key) => {
    const context = createContext(store[key]); // Property context

    return {
      ...o,
      // All contexts
      contexts: [...(o.contexts || []), { context, key }],
      // Hook to consume the property context
      [`use${capitalize(key)}`]: () => useContext(context)
    };
  }, {});

  // We create the main provider, where it is a component that returns 
  // the wrapped children of all the providers (since we have all the 
  // created contexts we can extract each Provider).
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

  // How plus, we create the hook useUnfragmentedStore to return all the 
  // status and create an updater. All using all the created hooks at 
  // the same time.
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

  // Return everything we've generated
  return storeUtils;
}
