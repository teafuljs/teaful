<h1 align="center">
<div><b>Fragstore</b></div>
<small>Fragmented store</small>
</h1>

<p align="center">
    <img src="logo.svg" width="200" alt="Fragstore" />
</p>

<p align="center">
    Tiny, easy and powerful <b>React state management</b> library
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/fragstore.svg)](https://badge.fury.io/js/fragstore)
[![gzip size](https://img.badgesize.io/https://unpkg.com/fragstore?compression=gzip&label=gzip)](https://unpkg.com/fragstore)
[![CI Status](https://github.com/aralroca/fragstore/actions/workflows/test.yml/badge.svg)](https://github.com/aralroca/fragstore/actions/workflows/test.yml)
[![Maintenance Status](https://badgen.net/badge/maintenance/active/green)](https://github.com/aralroca/fragstore#maintenance-status)
[![Weekly downloads](https://badgen.net/npm/dw/fragstore?color=blue)](https://www.npmjs.com/package/fragstore)
[![GitHub Discussions: Chat With Us](https://badgen.net/badge/discussions/chat%20with%20us/purple)](https://github.com/aralroca/fragstore/discussions)
[![PRs Welcome][badge-prwelcome]][prwelcome]

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

</div>

[badge-prwelcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prwelcome]: http://makeapullrequest.com

## What advantages does it have? ✨ 

<ul>
    <li>📦  ・<b>Tiny</b>: Less than 1kb package to manage your state in React and Preact.</li>
    <li>🌱  ・<b>Easy</b>: You don't need actions, reducers, selectors, connect, providers, etc. Everything can be done in the simplest and most comfortable way.</li>
    <li>🚀  ・<b>Powerful</b>: When a store property is updated, only its components are re-rendered. It's not re-rendering components that use other store properties.</li>
</ul>

<hr />

## Guide 🗺

- [1. Installation 🧑🏻‍💻](#installation-)
- [2. Init your store 👩🏽‍🎨](#init-your-store-)
  - [createStore](#createstore)
  - [How to export](#how-to-export)
- [3. Manage the store 🕹](#manage-the-store-)
  - [useStore hook](#usestore-hook)
  - [getStore helper](#getstore-helper)
  - [withStore HoC](#withstore-hoc)
- [4. Register events after an update 🚦](#register-events-after-an-update-)
- [5. How to... 🧑‍🎓](#how-to-)
  - [Add a new store property](#adding-new-properties-to-the-store)
  - [Reset a store property](#todo)
  - [Reset all the store](#todo)
  - [Use more than one store](#todo)
- [6. Examples 🖥](#examples--)
- [7. Roadmap 🛣](#roadmap-)
- [8. Contributors ✨](#contributors-)

## Installation 🧑🏻‍💻

```sh
yarn add fragstore
# or
npm install fragstore --save
```

## Init your store 👩🏽‍🎨

Each store has to be created with the `createStore` function. This function returns all the methods that you can use to consume and update the store properties.

### createStore

```js
import createStore from "fragstore";

const { useStore } = createStore();
```

Or also with an initial store:

```js
const initialStore = {
  cart: { price: 0, items: [] },
};
const { useStore } = createStore(initialStore);
```

Or also with callbacks:

```js
const initialStore = {
  cart: { price: 0, items: [] },
};
const callbacks = {
  cart({ value }) {
    console.log("This callback is executed after a cart update");
  },
};
const { useStore } = createStore(initialStore, callbacks);
```

_Input:_

| name           | type               | required | description                                                                                                                                                                                       |
| -------------- | ------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialStore` | `object<any>`      | `false`  | Object with your initial store.                                                                                                                                                                   |
| `callbacks`    | `object<function>` | `false`  | Object with functions that are executed after each property change. If `cart.price` is changed is executed on `cart` callback (first level). See [here](#callbacks) more details about callbacks. |

_Output:_

| name        | type        | description                                                                                                                                                                                                                    | example                                                         |
| ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `useStore`  | `Proxy`     | Proxy hook to consume and update store properties inside your components. Each time the value changes, the component is rendered again with the new value.                                                                     | `const [price, setPrice] = useStore.cart.price()`               |
| `getStore`  | `Proxy`     | Similar to `useStore` but without subscription. You can use it as a helper outside (or inside) components. Note that if the value changes, it does not cause a rerender.                                                       | `const [price, setPrice] = getStore.cart.price()`               |
| `withStore` | `Proxy`     | HoC with `useStore` inside. Useful for components that are not functional.                                                                                                                                                     | `withStore.cart.price(MyComponent)`                             |


### How to export

We recommend using this type of export:

```js
// ✅
export const { useStore, getStore, withStore } = createStore({
  cart: { price: 0, items: [] },
});
```

This way you can import it with:

```js
// ✅
import { useStore } from '../store
```

Avoid using a default export with all:

```js
// ❌
export default createStore({ cart: { price: 0, items: [] } });
```

Because then you won't be able to do this:

```js
// ❌  It's not working well with proxies
import { useStore } from '../store
```

## Manage the store 🕹

### useStore hook

It's recommended to use the `useStore` hook as a proxy to indicate exactly what **portion of the store** you want. This way you only subscribe to this part of the store avoiding unnecessary re-renders.

```js
import createStore from "fragstore";

const { useStore } = createStore({
  username: "Aral",
  count: 0,
  age: 31,
  cart: {
    price: 0,
    items: [],
  },
});

function Example() {
  const [username, setUsername] = useStore.username();
  const [cartPrice, setCartPrice] = useStore.cart.price();

  return (
    <>
      <button onClick={() => setUsername("AnotherUserName")}>
        Update {username}
      </button>
      <button onClick={() => setCartPrice((v) => v + 1)}>
        Increment price: {cartPrice}€
      </button>
    </>
  );
}
```

However, it's also possible to use the `useStore` hook to use **all the store**.

```js
function Example() {
  const [store, setStore] = useStore();

  return (
    <>
      <button
        onClick={() =>
          setStore((s) => ({
            ...s,
            username: "AnotherUserName",
          }))
        }
      >
        Update {store.username}
      </button>
      <button
        onClick={() =>
          setStore((s) => ({
            ...s,
            cart: { ...s.cart, price: s.cart.price + 1 },
          }))
        }
      >
        Increment price: {store.cart.price}€
      </button>
    </>
  );
}
```

_Input:_

| name          | type  | description                                                                                                                                                                                                                                                      | example                                            |
| ------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Initial value | `any` | This parameter is **not mandatory**. It only makes sense for new store properties that have not been defined before within the `createStore`. If the value has already been initialized inside the `createStore` this parameter has no effect. | `const [price, setPrice] = useStore.cart.price(0)` |
| event after an update| `function`|This parameter is **not mandatory**. Adds an event that is executed every time there is a change inside the indicated store portion.| `const [price, setPrice] = useStore.cart.price(0, onAfterUpdate)`<div><small>And the function:</small></div><div>`function onAfterUpdate({ path, value, prevValue, getStore }){ console.log({ prevValue, value }) }`</div>

_Output:_

Is an `Array` with **3** items:

| name         | type       | description                                                                             | example                                                                                                                                                                                                                                                                                                                                                                 |
| ------------ | ---------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value        | `any`      | The value of the store portion indicated with the proxy.                                | A store portion <div>`const [price] = useStore.cart.price()`</div>All store: <div> `const [store] = useStore()`</div>                                                                                                                                                                                                                                                   |
| update value | `function` | Function to update the store property indicated with the proxy.                         | Updating a store portion:<div>`const [count, setCount] = useStore.count(0)`</div>Way 1:<div>`setCount(count + 1)`</div>Way 1:<div>`setCount(c => c + 1)`</div><div>-------</div>Updating all store:<div>`const [store, updateStore] = useStore()`</div>Way 1:<div>`updateStore({ ...store, count: 2 }))`</div>Way 1:<div>`updateStore(s => ({ ...s, count: 2 }))`</div> |
| reset value  | `function` | Function that reset the store property indicated with the proxy to their initial value. | Reset store portion:<div>`const [,,resetCount] = useStore.count()`</div><div>`resetCount()`</div><small>_Put counter to 0 again (initial value defined inside the `createStore`)._</small><div>-------</div>Reset all store:<div>`const [,,resetStore] = useStore()`</div><div>`resetStore()`</div><small>_All store portions to their initial values._</small>         |

### getStore helper

It works exactly like `useStore` but with **some differences**:

- It **does not make a subscription**. So it is no longer a hook and you can use it as a helper wherever you want.
- It's **not possible to register events** that are executed after a change.
    ```js
    getStore.cart.price(0, onAfterPriceChange) // ❌

    function onAfterPriceChange({ path, value, prevValue }) {
      const [,setErrorMsg] = getStore.errorMsg()
      setErrorMsg(value > 99 ? 'price should be lower than $99')
    }
    ```
    - If the intention is to register events that last forever, it has to be done within the `createStore`: 
    ```js
     const { useStore } = createStore(initialStore, onAfterUpdate) // ✅

     function onAfterUpdate({ path, value, prevValue, getStore }) {
       if(path === 'cart.price') {
         const [,setErrorMsg] = getStore.errorMsg()
         setErrorMsg(value > 99 ? 'price should be lower than $99')
       }
     }
    ```

Very useful to use it:

- **Outside components**: helpers, services, etc.
- **Inside components**: Avoiding rerenders if you want to consume it inside events, when you only use the updaters `const [, setCount, resetCount] = getStore.count()`, etc.

Example:

```js
import { useState } from "react";

const { getStore } = createStore({ count: 0 });

function Example1() {
  const resetStore = getStore()[2];
  return <button onClick={resetStore}>Reset store</button>;
}

function Example2() {
  const [newCount, setNewCount] = useState();

  function saveIncreasedCount(e) {
    e.preventDefault();
    const [count, setCount] = getStore.count();
    if (newCount > count) setCount(newCount);
    else alert("You should increase the value");
  }

  return (
    <form onSubmit={saveIncreasedCount}>
      <input
        value={newCount}
        onChange={(e) => setNewCount(e.target.valueAsNumber)}
        type="number"
      />
      <button>Save the increased count value</button>
    </form>
  );
}
```

### withStore HoC

It's a wrapper of the `useStore` for non-functional components. Where you receive the same thing that the `useStore` hook returns inside `this.props.store`.

Example with a store portion:

```js
const { withStore } = createStore();

class Counter extends Component {
  render() {
    const [count, setCount, resetCount] = this.props.store;
    return (
      <div>
        <h1>{count}</h1>
        <button onClick={() => setCount((v) => v + 1)}>+</button>
        <button onClick={() => setCount((v) => v - 1)}>-</button>
        <button onClick={resetCount}>reset</button>
      </div>
    );
  }
}

// Similar to useStore.counter.count(0)
const CounterWithStore = withStore.counter.count(Counter, 0);
```

Example with all store:

```js
const { withStore } = createStore({ count: 0 });

class Counter extends Component {
  render() {
    const [store, setStore, resetStore] = this.props.store;
    return (
      <div>
        <h1>{store.count}</h1>
        <button onClick={() => setStore({ count: store.count + 1 })}>+</button>
        <button onClick={() => setStore({ count: store.count - 1 })}>-</button>
        <button onClick={resetStore}>reset</button>
      </div>
    );
  }
}

// Similar to useStore()
const CounterWithStore = withStore(Counter);
```

The **only difference** with the `useStore` is that instead of having 2 parameters (initial value, callback), it has 3 where the **first one is mandatory** and the other 2 are not (**Component**, **initial value**, **callback**).

## Register events after an update 🚦

## How to... 🧑‍🎓

### Add a new store property
### Reset a store property

### Use more than one store

## Examples  🖥

## Roadmap 🛣

- [x] React support
- [x] TypeScript support
- [ ] Svelte support
- [ ] Vue support

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://aralroca.com"><img src="https://avatars3.githubusercontent.com/u/13313058?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aral Roca Gomez</b></sub></a><br /><a href="#maintenance-aralroca" title="Maintenance">🚧</a> <a href="https://github.com/aralroca/fragstore/commits?author=aralroca" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/danielofair"><img src="https://avatars.githubusercontent.com/u/4655428?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Danielo Artola</b></sub></a><br /><a href="#infra-danielart" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://shinshin86.com"><img src="https://avatars.githubusercontent.com/u/8216064?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yuki Shindo</b></sub></a><br /><a href="#infra-shinshin86" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://github.com/dididy"><img src="https://avatars.githubusercontent.com/u/16266103?v=4?s=100" width="100px;" alt=""/><br /><sub><b>YONGJAE LEE(이용재)</b></sub></a><br /><a href="https://github.com/aralroca/fragstore/issues?q=author%3Adididy" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
