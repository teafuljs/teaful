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

## ✨ What advantages does it have?

<ul>
    <li>📦 <b>Tiny</b>: Less than 1kb package to manage your state in React and Preact.</li>
    <li>🌱 <b>Easy</b>: You don't need actions, reducers, selectors, connect, providers, etc. Everything can be done in the simplest and most comfortable way.</li>
    <li>🚀 <b>Powerful</b>: When a store property is updated, only its components are re-rendered. It's not re-rendering components that use other store properties.</li>
</ul>

<hr />

## Content

- [Installation](#installation)
- [Init your store](#init-your-store)
  - [createStore](#createstore)
  - [How to export](#how-to-export)
- [Manage the Store](#manage-the-store)
  - [useStore hook](#todo)
  - [getStore helper](#todo)
  - [withStore HoC](#todo)
  - [Store component](#store)
- [Callbacks](#callbacks)
- [How to...](@todo)
  - [Add a new store property](#adding-new-properties-to-the-store)
  - [Reset a store property](#todo)
  - [Reset all the store](#todo)
- [Demos](#demos)
- [Contributors ✨](#contributors-)


## Installation

```sh
yarn add fragstore
# or
npm install fragstore --save
```

## Init your store

Each store has to be created with the `createStore` function. This function returns all the methods that you can use to consume and update the store properties.

### createStore

```js
import createStore from "fragstore";

const { useStore } = createStore();
```

Or also with an initial store:

```js
const initialStore = { 
  cart: { price: 0, items: [] }
}
const { useStore } = createStore(initialStore);
```

Or also with callbacks:

```js
const initialStore = { 
  cart: { price: 0, items: [] }
}
const callbacks = { 
  cart({ value }){ 
    console.log('This callback is executed after a cart update')
  }
}
const { useStore } = createStore(initialStore, callbacks);
```

_Input:_

| name 	        | type 	            | required | description 	|
|------	        |------	            |------ |-------------	|
| `initialStore`  | `object<any>`    	| `false`      |Object with your initial store.          	|
| `callbacks`     | `object<function>`| `false`      |Object with functions that are executed after each property change. If `cart.price` is changed is executed on `cart` callback (first level). See [here](#callbacks) more details about callbacks.           	|

_Output:_

| name 	    | type 	 | description 	| example |
|------	    |------	 |-------------	|-----|
| `useStore`  | `Proxy` | Proxy hook to consume and update store properties inside your components. Each time the value changes, the component is rendered again with the new value. | `const [price, setPrice] = useStore.cart.price()` |
| `getStore`  | `Proxy` | Similar to `useStore` but without subscription. You can use it as a helper outside (or inside) components. Note that if the value changes, it does not cause a rerender.| `const [price, setPrice] = getStore.cart.price()` |
| `withStore` | `Proxy` | HoC with `useStore` inside. Useful for components that are not functional.| `withStore.cart.price(MyComponent)`|
| `Store`     | `Component` | If in the `createStore` you don't define the initial store or the callbacks you can do it later using this component. It is likely that you want the callbacks to change the internal logic of the component or anything else.| `<Store store={initialStore} callbacks={callbacks}>...</Store>`  |

### How to export

We recommend using this type of export:

```js
// ✅
export const { 
  useStore, 
  getStore, 
  withStore, 
  Store 
} = createStore({ cart: { price: 0, items: [] }});
```

This way you can import it with:

```js
// ✅
import { useStore } from '../store
```

Avoid using a default export with all:

```js
// ❌
export default createStore({ cart: { price: 0, items: [] }});
```

Because then you won't be able to do this:

```js
// ❌  It's not working well with proxies 
import { useStore } from '../store
```

## Manage the Store:
### Store

The `Store` is an optional component where you can send the same parameters than the `createStore`. Sometimes can be useful, for example, when the initial store is defined by an API, or also if you want to change some component state (not store) after some callback.

```js
import createStore from "fragstore";

const { Store } = createStore();

function App() {
  return (
    <Store store={{ 
      username: "Aral",
      age: 31,
    }}>
     {/* rest */} 
    </Store>
  );
}
```

### Fragmented store (meaning of Fragstore)

The power of this library is that you can use fragmented parts of the store, so if a component uses only one field of the store, it will only re-render again if there is a change in this particular field and it will not render again if the other fields change.


```js
import createStore from "fragstore";

const { useStore } = createStore({
  username: "Aral",
  age: 31,
  cart: {
    price: 0,
    items: []
  }
});

function FragmentedExample() {
  const [username, setUsername] = useStore.username();
  const [cartPrice, setCartPrice] = useStore.cart.price();

  return (
    <>
      <button onClick={() => setUsername("AnotherUserName")}>
        Update {username}
      </button>
       <button onClick={() => setCartPrice(v => v + 1)}>
        Increment price: {cartPrice}€
      </button>
    </>
  );
}
```

### Unfragmented store

The advantage of this library is to use the store in a fragmented way. Even so, there are cases when we want to reset the whole store or do more complex things. For these cases, we can use the hook `useStore` directly.

```js
import createStore from "fragstore";

const { useStore } = createStore({
  username: "Aral",
  age: 31
});

function UnfragmentedExample() {
  const [store, update] = useStore();

  return (
    <>
      <h1>{state.username}, {state.age}</h1>
      <button 
        onClick={() => update({ age: 32, cart: { price: 0, items: [] } })}
      >
        Update store
      </button>
    </>
  );
}
```

### Adding new properties to the store

There are 3 ways to add a new property to the store:

#### 1. Adding a new property on the Store

```js
import createStore from "fragstore";

const { Store } = createStore({ username: "Aral" });

function App() {
  return <Store store={{ count: 0 }}>{/* rest */}</Store>;
}
```

#### 2. Using the `useStore` to consume to a new property

```js
const { Store } = createStore({ username: "Aral" });
// ...
const [newProp, setNewProp] = useStore.newProp("Initial value of newProp")
const [anotherProp, setAnotherProp] = useStore.anotherProp()
// ...
setAnotherProp("Initial value of anotherProp")
setNewProp("Next value of newProp")
```

The hook argument works to define the initial value. It doesn't work when the initial value is already defined in `createStore` or `Store`:

```js
const { Store } = createStore({ username: "Aral" });
// ...
const [username, setUsername] = useStore.username("Another name")
console.log(username) // -> Aral
```

In this case, if you want to update the value you should use the `setUsername` method.

#### 3. Using all the store with `useStore` directly *(not recommended)*

```js
const [store, setStore] = useStore()

// ...
setStore({ 
  newProp: "I'm a new property",
  anotherProp: "I'm another new property" 
})
```

The problem with using the entire store is that the component will re-render whenever any property in the store is updated.

### Callbacks

The second param of `createStore` is **callbacks** `Object<function>`. It's useful for example to fetch data to an endpoint after the state change, and roll back the state if the request fails. Callbacks can only be created at the first level. That is, if we have an update in `cart.items[0].price`, only the callback of the cart `{ cart() {} }` will be called. However you receive the updated `path` and you can implement the logic inside the callback:

Example: 

```js
const initialState = {
  quantity: 2,
  userName: 'Aral',
  age: 31,
  cart: {
    items: [{ name: 'example', price: 10 }]
  }
}

// Every callback is executed after a property change
const callbacks = {
  quantity({ value, prevValue, updateValue }) {
    // Update quantity on API
    fetch('/api/quantity', { method: 'POST', body: value })
     // Revert state change if it fails
     .catch(e => updateValue(prevValue))
  },
  age({ value, prevValue, updateValue }) {
    if (value > 100) {
      alert("Sorry, no more than 100 😜");
      updateValue(prevValue);
    }
  },
  cart({ path, value, prevValue, updateValue }) {
    if (path === "cart.items.0" && value.price > 10) {
      alert(`Price of ${value.name} should be lower than 10`);
      updateValue(prevValue);
    }
  }
}

const { Store, useQuantity } = createStore(initialState, callbacks)
```

Also you can overwrite or define callbacks on the `Store`:

```js
<Store 
  store={{ newProperty: 'Another value'}} 
  callbacks={{ 
    newProperty(value) {
      console.log(value)
    }
  }}>
```

## Example

```js
import createStore from "fragstore";

const { Store, useStore } = createStore({
  username: "Aral",
  age: 31,
  cart: {
    price: 0,
    items: [],
  }
});

export default function App() {
  return (
    <Store>
      <AllStore />
      <Username />
      <CartPrice />
      <CartFirstItem />
      <Age />
      <NewProperty />
    </Store>
  );
}


function AllStore() {
  const [store, update] = useStore();

  console.log({ store }); // all store

  return (
    <button onClick={() => update({ age: 31, username: "Aral" })}>
      Reset
    </button>
  );
}

function Username() {
  const [username, setUsername, resetUsername] = useStore.username();

  return (
    <>
      <h1>Username: {username}</h1>
      <button onClick={() => setUsername("Another name")}>
        Update username
      </button>
      <button onClick={resetUsername}>
        Reset username
      </button>
    </>
  );
}

function CartPrice() {
  const [price, setPrice, resetPrice] = useStore.cart.price();

  return (
    <>
      <h1>Price: {price}€</h1>
      <button onClick={() => setPrice(v => v + 1)}>
        Inc price
      </button>
      <button onClick={resetPrice}>
        Reset username
      </button>
    </>
  );
}

function CartFirstItem() {
  const [item, setItem, resetItem] = useStore.cart.items[0]();

  return (
    <>
      <h1>Item: {JSON.stringify(item)}</h1>
      <button onClick={() => setItem({ name: "new Item" })}>
        Update item
      </button>
      <button onClick={resetItem}>
        Reset item
      </button>
    </>
  );
}

function Age() {
  const [age, setAge, resetAge] = useStore.age();

  console.log("render age", age);

  return (
    <div>
      <div>{age}</div>
      <button onClick={() => setAge((s) => s + 1)}>Inc age</button>
      <button onClick={resetAge}>Reset age</button>
    </div>
  );
}

function NewProperty() {
  const [newProperty, setNewProperty] = useStore.newProperty();

  return (
    <>
      {
        newProperty 
          ? <div>{newProperty}</div>
          : (
             <button onClick={() => setNewProperty("I'm a new property")}>
              Create new property
             </button>
          )
      }
    </>
  );
}
```

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
