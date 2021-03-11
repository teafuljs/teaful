# Fragmented store

When we update a property of the store, **only** the components that use that particular property **are rendered** even if they consume other elements of the store.

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