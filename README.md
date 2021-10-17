<h1 align="center">
Fragstore
</h1>

<p align="center">
    <img src="logo.svg" width="200" alt="Fragstore" />
</p>

<p align="center">
    Tiny (~800 B), easy and simple (P)React <b>state management library</b>
</p>
<p align="center">
    After a store update -> <b>only</b> components that use the <b>updated property</b> are rendered.
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/fragstore.svg)](https://badge.fury.io/js/fragstore)
[![PRs Welcome][badge-prwelcome]][prwelcome]
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->


<a href="https://twitter.com/intent/follow?screen_name=aralroca">
<img src="https://img.shields.io/twitter/follow/aralroca?style=social&logo=twitter"
            alt="follow on Twitter"></a>

</div>

[badge-prwelcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prwelcome]: http://makeapullrequest.com

## Getting started:

Install it with Yarn:

```
yarn add fragstore
```

Or install it with Npm:

```
npm install fragstore --save
```

## Usage:
### Provider

The `Provider` is required for any of its child components to consume the store.

```js
import createStore from "fragstore";

const { Provider } = createStore({
  username: "Aral",
  age: 31
});

function App() {
  return (
    <Provider>
     {/* rest */} 
    </Provider>
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

#### 1. Adding a new property on the Provider

```js
import createStore from "fragstore";

const { Provider } = createStore({ username: "Aral" });

function App() {
  return <Provider store={{ count: 0 }}>{/* rest */}</Provider>;
}
```

#### 2. Using the `useStore` to consume to a new property

```js
const { Provider } = createStore({ username: "Aral" });
// ...
const [newProp, setNewProp] = useStore.newProp("Initial value of newProp")
const [anotherProp, setAnotherProp] = useStore.anotherProp()
// ...
setAnotherProp("Initial value of anotherProp")
setNewProp("Next value of newProp")
```

The hook argument works to define the initial value. It doesn't work when the initial value is already defined in `createStore` or `Provider`:

```js
const { Provider } = createStore({ username: "Aral" });
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

const { Provider, useQuantity } = createStore(initialState, callbacks)
```

Also you can overwrite or define callbacks on the `Provider`:

```js
<Provider 
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

const { Provider, useStore } = createStore({
  username: "Aral",
  age: 31,
  cart: {
    price: 0,
    items: [],
  }
});

export default function App() {
  return (
    <Provider>
      <AllStore />
      <Username />
      <CartPrice />
      <CartFirstItem />
      <Age />
      <NewProperty />
    </Provider>
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
    <td align="center"><a href="https://aralroca.com"><img src="https://avatars3.githubusercontent.com/u/13313058?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aral Roca Gomez</b></sub></a><br /><a href="#maintenance-aralroca" title="Maintenance">🚧</a> <a href="https://github.com/vinissimus/next-translate/commits?author=aralroca" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/danielofair"><img src="https://avatars.githubusercontent.com/u/4655428?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Danielo Artola</b></sub></a><br /><a href="#infra-danielart" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
