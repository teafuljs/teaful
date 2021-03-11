<h1 align="center">
Fragmented store
</h1>
<p align="center">
    Tiny (~400 B) and simple (P)React <b>state management library</b>
</p>
<p align="center">
    Store update -> <b>only</b> components that use the updated property are rendered.
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/fragmented-store.svg)](https://badge.fury.io/js/fragmented-store)
[![PRs Welcome][badge-prwelcome]][prwelcome]

<a href="https://twitter.com/intent/follow?screen_name=aralroca">
<img src="https://img.shields.io/twitter/follow/aralroca?style=social&logo=twitter"
            alt="follow on Twitter"></a>

</div>



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

const { Provider, useUsername, useAge } = createStore({
  username: "Aral",
  age: 31
});

export default function App() {
  return (
    <Provider>
      <Title />
      <UpdateTitle />
      <Age />
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
    <button onClick={() => setUsername((u) => u + "a")}>
      Update {username}
    </button>
  );
}

function Age() {
  const [age, setAge] = useAge();

  console.log("render Age");

  return (
    <div>
      <div>{age}</div>
      <button onClick={() => setAge((a) => a + 1)}>Inc age</button>
    </div>
  );
}
```