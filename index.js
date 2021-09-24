import React, { useState, useContext, createContext } from 'react'

export default function createStore(store = {}) {
  const keys = Object.keys(store)
  const capitalize = (k) => `${k[0].toUpperCase()}${k.slice(1, k.length)}`

  // storeUtils is the object we'll return with everything
  // (Provider, hooks)
  //
  // We initialize it by creating a context for each property and
  // returning a hook to consume the context of each property
  const storeUtils = keys.reduce((o, key) => {
    const context = createContext(store[key]) // Property context
    const keyCapitalized = capitalize(key)

    if (keyCapitalized === 'Store') {
      console.error('Avoid to use the "store" name at the first level, it\'s reserved for the "useStore" hook.')
    }

    return {
      ...o,
      // All contexts
      contexts: [...(o.contexts || []), { context, key }],
      // Hook to consume the property context
      [`use${keyCapitalized}`]: () => useContext(context),
    }
  }, {})

  // We create the main provider by wrapping all the providers
  storeUtils.Provider = ({ children }) => {
    const Empty = ({ children }) => children
    const Component = storeUtils.contexts
      .map(({ context, key }) => ({ children }) => {
        const ctx = useState(store[key])
        return <context.Provider value={ctx}>{children}</context.Provider>
      })
      .reduce(
        (RestProviders, Provider) =>
          ({ children }) =>
          (
            <Provider>
              <RestProviders>{children}</RestProviders>
            </Provider>
          ),
        Empty
      )

    return <Component>{children}</Component>
  }

  // As a bonus, we create the useStore hook to return all the
  // state. Also to return an updater that uses all the created hooks at
  // the same time
  storeUtils.useStore = () => {
    const state = {}
    const updates = {}
    keys.forEach((k) => {
      const hookName = `use${capitalize(k)}`
      if (hookName === 'useStore') return
      const [s, u] = storeUtils[hookName]()
      state[k] = s
      updates[k] = u
    })

    function updater(newState) {
      const s =
        typeof newState === 'function' ? newState(state) : newState || {}
      Object.keys(s).forEach((k) => updates[k] && updates[k](s[k]))
    }

    return [state, updater]
  }

  // Return everything we've generated
  return storeUtils
}