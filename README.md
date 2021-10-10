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
  age: 31
});

function FragmentedExample() {
  const [username, setUsername] = useStore().username;

  return (
    <button onClick={() => setUsername("AnotherUserName")}>
      Update {username}
    </button>
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
      <button onClick={() => update({ age: 31, username: "Aral" })}>Reset</button>
    </>
  );
}
```

### Callbacks

The second param of `createStore` is **callbacks** `Object<function>`. Callbacks are executed for any property change. It's useful for example to fetch data to an endpoint after the state change, and roll back the state if the request fails. 


```js
const initialState = {
  quantity: 2,
  userName: 'Aral',
  age: 31,
}

// Every callback is executed after a property change
const callbacks = {
  quantity(newValue, prevValue, setValue) {
    // Update quantity on API
    fetch('/api/quantity', { method: 'POST', body: newValue })
     // Revert state change if it fails
     .catch(e => setValue(prevValue))
  },
  age(newValue, prevValue, setValue) {
    if (newValue > 100) {
      alert("Sorry, no more than 100 😜");
      setValue(prevValue);
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
  age: 31
});

export default function App() {
  return (
    <Provider>
      <AllStore />
      <Username />
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
  const [username, setUsername, resetUsername] = useStore().username;

  return (
    <>
      <h1>{username}</h1>
      <button onClick={() => setUsername("Another name")}>
        Update username
      </button>
      <button onClick={resetUsername}>
        Reset username
      </button>
    </>
  );
}

function Age() {
  const [age, setAge, resetAge] = useStore().age;

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
  const [newProperty, setNewProperty] = useStore().newProperty;

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
