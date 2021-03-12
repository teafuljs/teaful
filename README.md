<h1 align="center">
Fragmented Store
</h1>

<p align="center">
    <img src="logo.svg" width="200" alt="fragmented-store" />
</p>

<p align="center">
    Tiny (~500 B), easy and simple (P)React <b>state management library</b>
</p>
<p align="center">
    After a store update -> <b>only</b> components that use the <b>updated property</b> are rendered.
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/fragmented-store.svg)](https://badge.fury.io/js/fragmented-store)
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
yarn add fragmented-store
```

Or install it with Npm:

```
npm install fragmented-store --save
```

## Usage:

```js
import createStore from "fragmented-store";

const { Provider, useUsername, useAge, useUnfragmentedStore } = createStore({
  username: "Aral",
  age: 30
});

export default function App() {
  return (
    <Provider>
      <Title />
      <UpdateTitle />
      <Age />
      <AllStore />
    </Provider>
  );
}

function Title() {
  const [username] = useUsername();

  console.log("render Title");

  return <h1>{username}</h1>;
}

function UpdateTitle() {
  const [username, setUsername] = useUsername();

  console.log("render UpdateTitle");

  return (
    <button onClick={() => setUsername((s) => s + "a")}>
      Update {username}
    </button>
  );
}

function Age() {
  const [age, setAge] = useAge();

  console.log("render age");

  return (
    <div>
      <div>{age}</div>
      <button onClick={() => setAge((s) => s + 1)}>Inc age</button>
    </div>
  );
}

function AllStore() {
  const [store, update] = useUnfragmentedStore();

  console.log({ store }); // all store

  return (
    <button onClick={() => update({ age: 30, username: "Aral" })}>Reset</button>
  );
}
```

### Provider

The `Provider` is required for any of its child components to consume fragmented-store hooks.

```js
import createStore from "fragmented-store";

const { Provider } = createStore({
  username: "Aral",
  age: 30
});

function App() {
  return (
    <Provider>
     {/* rest */} 
    </Provider>
  );
}
```

### Fragmented store

The power of this library is that you can use fragmented parts of the store, so if a component uses only one field of the store, it will only re-render again if there is a change in this particular field and it will not render again if the other fields change.

For each of the fields of the store, there is a hook with its name, examples:

- username 👉 `useUsername`
- age 👉 `useAge`
- anotherExample 👉 `useAnotherExample`

```js
import createStore from "fragmented-store";

const { useUsername } = createStore({
  username: "Aral",
  age: 30
});

function FragmentedExample() {
  const [username, setUsername] = useUsername();

  return (
    <button onClick={() => setUsername("AnotherUserName")}>
      Update {username}
    </button>
  );
}
```

### Unfragmented store

The advantage of this library is to use the store in a fragmented way. Even so, there are cases when we want to reset the whole store or do more complex things. For these cases, we can use the hook `useUnfragmentedStore`.

```js
import createStore from "fragmented-store";

const { useUnfragmentedStore } = createStore({
  username: "Aral",
  age: 30
});

function UnfragmentedExample() {
  const [store, update] = useUnfragmentedStore();

  return (
    <>
      <h1>{state.username}, {state.age}</h1>
      <button onClick={() => update({ age: 30, username: "Aral" })}>Reset</button>
    </>
  );
}
```

## Demo

* https://codesandbox.io/s/fragmented-store-example-4p5dv?file=/src/App.js
