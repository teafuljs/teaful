import React, { useState, useContext, createContext } from "react";

export default function createStore(store = {}) {
  const storeUtils = Object.keys(store).reduce((o, key) => {
    const fieldCapitalized = `${key[0].toUpperCase()}${key.slice(
      1,
      key.length
    )}`;
    const context = createContext(store[key]);

    return {
      ...o,
      contexts: [...(o.contexts || []), { context, key }],
      [`use${fieldCapitalized}`]: () => useContext(context)
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

  return storeUtils;
}
