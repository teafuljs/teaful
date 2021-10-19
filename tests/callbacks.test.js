import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";

import "@babel/polyfill";

import createStore from "../package/index";

describe("Callbacks", () => {
  test("should work via createStore", () => {
    const cart = jest.fn();
    const username = jest.fn();
    const callbacks = { cart, username };
    const initialStore = { cart: { price: 0, items: [] }, username: "Aral" };
    const { useStore } = createStore(initialStore, callbacks);
    const testCart = testItem(cart);
    const testUsername = testItem(username);

    function Test() {
      const [, setPrice] = useStore.cart.price();
      const [, setUsername] = useStore.username();

      function onClick() {
        setPrice((v) => v + 1);
        setUsername((v) => v + "a");
      }

      return (
        <button data-testid="click" onClick={onClick}>
          Test
        </button>
      );
    }

    render(<Test />);

    userEvent.click(screen.getByTestId("click"));
    testCart({ value: 1, prevValue: 0, times: 1, path: "cart.price" });
    testUsername({
      value: "Arala",
      prevValue: "Aral",
      times: 1,
      path: "username",
    });

    userEvent.click(screen.getByTestId("click"));
    testCart({ value: 2, prevValue: 1, times: 2, path: "cart.price" });
    testUsername({
      value: "Aralaa",
      prevValue: "Arala",
      times: 2,
      path: "username",
    });

    userEvent.click(screen.getByTestId("click"));
    userEvent.click(screen.getByTestId("click"));
    userEvent.click(screen.getByTestId("click"));
    testCart({ value: 5, prevValue: 4, times: 5, path: "cart.price" });
    testUsername({
      value: "Aralaaaaa",
      prevValue: "Aralaaaa",
      times: 5,
      path: "username",
    });
  });

  test("should work via Provider", () => {
    const cart = jest.fn();
    const username = jest.fn();
    const callbacks = { cart, username };
    const initialStore = { cart: { price: 0, items: [] }, username: "Aral" };
    const { useStore, Provider } = createStore();
    const testCart = testItem(cart);
    const testUsername = testItem(username);

    function Test() {
      const [, setPrice] = useStore.cart.price();
      const [, setUsername] = useStore.username();

      function onClick() {
        setPrice((v) => v + 1);
        setUsername((v) => v + "a");
      }

      return (
        <button data-testid="click" onClick={onClick}>
          Test
        </button>
      );
    }

    render(
      <Provider store={initialStore} callbacks={callbacks}>
        <Test />
      </Provider>
    );

    userEvent.click(screen.getByTestId("click"));
    testCart({ value: 1, prevValue: 0, times: 1, path: "cart.price" });
    testUsername({
      value: "Arala",
      prevValue: "Aral",
      times: 1,
      path: "username",
    });

    userEvent.click(screen.getByTestId("click"));
    testCart({ value: 2, prevValue: 1, times: 2, path: "cart.price" });
    testUsername({
      value: "Aralaa",
      prevValue: "Arala",
      times: 2,
      path: "username",
    });

    userEvent.click(screen.getByTestId("click"));
    userEvent.click(screen.getByTestId("click"));
    userEvent.click(screen.getByTestId("click"));
    testCart({ value: 5, prevValue: 4, times: 5, path: "cart.price" });
    testUsername({
      value: "Aralaaaaa",
      prevValue: "Aralaaaa",
      times: 5,
      path: "username",
    });
  });

  test("Should be possible to overwrite only ONE callback from createStore using the Provider", () => {
    const cart = jest.fn();
    const username = jest.fn();
    const initialStore = { cart: { price: 0, items: [] }, username: "Aral" };
    const { useStore, Provider } = createStore({}, { cart });
    const testCart = testItem(cart);
    const testUsername = testItem(username);

    function Test() {
      const [, setPrice] = useStore.cart.price();
      const [, setUsername] = useStore.username();

      function onClick() {
        setPrice((v) => v + 1);
        setUsername((v) => v + "a");
      }

      return (
        <button data-testid="click" onClick={onClick}>
          Test
        </button>
      );
    }

    render(
      <Provider store={initialStore} callbacks={{ username }}>
        <Test />
      </Provider>
    );

    userEvent.click(screen.getByTestId("click"));
    testCart({ value: 1, prevValue: 0, times: 1, path: "cart.price" });
    testUsername({
      value: "Arala",
      prevValue: "Aral",
      times: 1,
      path: "username",
    });

    userEvent.click(screen.getByTestId("click"));
    testCart({ value: 2, prevValue: 1, times: 2, path: "cart.price" });
    testUsername({
      value: "Aralaa",
      prevValue: "Arala",
      times: 2,
      path: "username",
    });

    userEvent.click(screen.getByTestId("click"));
    userEvent.click(screen.getByTestId("click"));
    userEvent.click(screen.getByTestId("click"));
    testCart({ value: 5, prevValue: 4, times: 5, path: "cart.price" });
    testUsername({
      value: "Aralaaaaa",
      prevValue: "Aralaaaa",
      times: 5,
      path: "username",
    });
  });

  test("Updating again the value inside the callback should not call again the callback", () => {
    const cart = jest.fn();
    const username = jest.fn();
    const callbacks = { cart, username };
    const initialStore = { cart: { price: 0, items: [] }, username: "Aral" };
    const { useStore } = createStore(initialStore, callbacks);
    const testCart = testItem(cart);
    const testUsername = testItem(username);

    function Test() {
      const [, setPrice] = useStore.cart.price();
      const [, setUsername] = useStore.username();

      function onClick() {
        setPrice((v) => v + 1);
        setUsername((v) => v + "a");
      }

      return (
        <button data-testid="click" onClick={onClick}>
          Test
        </button>
      );
    }

    render(<Test />);

    // Executing callback
    userEvent.click(screen.getByTestId("click"));
    const updateCart = testCart({
      value: 1,
      prevValue: 0,
      times: 1,
      path: "cart.price",
    });
    const updateUsername = testUsername({
      value: "Arala",
      prevValue: "Aral",
      times: 1,
      path: "username",
    });

    // Updating inside the callback should not call again the callback
    act(() => {
      updateCart(2);
      updateUsername((v) => v + "l");
    });

    expect(cart).toHaveBeenCalledTimes(1);
    expect(username).toHaveBeenCalledTimes(1);

    // Executing callback again
    userEvent.click(screen.getByTestId("click"));
    testCart({ value: 3, prevValue: 2, times: 2, path: "cart.price" });
    testUsername({
      value: "Aralala",
      prevValue: "Aralal",
      times: 2,
      path: "username",
    });
  });

  test("Updating the prevValue should work as limit | via createStore", () => {
    const cart = ({ path, prevValue, value, updateValue }) => {
      if (path === "cart.price" && value > 4) {
        updateValue(prevValue);
      }
    };
    const initialStore = { cart: { price: 0 } };
    const { useStore } = createStore(initialStore, { cart });

    function Test() {
      const [price, setPrice] = useStore.cart.price();
      return (
        <button data-testid="click" onClick={() => setPrice((v) => v + 1)}>
          {price}
        </button>
      );
    }

    render(<Test />);

    const btn = screen.getByTestId("click");
    expect(btn.textContent).toBe("0");
    userEvent.click(btn);
    expect(btn.textContent).toBe("1");
    userEvent.click(btn);
    expect(btn.textContent).toBe("2");
    userEvent.click(btn);
    expect(btn.textContent).toBe("3");
    userEvent.click(btn);
    expect(btn.textContent).toBe("4");

    // No more than 4 (logic inside callback)
    userEvent.click(btn);
    expect(btn.textContent).toBe("4");
    userEvent.click(btn);
    expect(btn.textContent).toBe("4");
  });

  test("Updating the prevValue should work as limit | via Provider + updating state", () => {
    const initialStore = { cart: { price: 0 } };
    const { useStore, Provider } = createStore(initialStore);

    function Test({ displayText }) {
      const [price, setPrice] = useStore.cart.price();

      return (
        <button data-testid="click" onClick={() => setPrice((v) => v + 1)}>
          {displayText ? "No more than 4!! :)" : price}
        </button>
      );
    }

    function TestApp() {
      const [displayText, setDisplayText] = useState(false);

      function cart({ path, prevValue, value, updateValue }) {
        if (path !== "cart.price") return;
        if (value > 4) {
          updateValue(prevValue);
          setDisplayText(true);
        } else {
          setDisplayText(false);
        }
      }

      return (
        <Provider callbacks={{ cart }}>
          <Test displayText={displayText} />
        </Provider>
      );
    }

    render(<TestApp />);

    const btn = screen.getByTestId("click");
    expect(btn.textContent).toBe("0");
    userEvent.click(btn);
    expect(btn.textContent).toBe("1");
    userEvent.click(btn);
    expect(btn.textContent).toBe("2");
    userEvent.click(btn);
    expect(btn.textContent).toBe("3");
    userEvent.click(btn);
    expect(btn.textContent).toBe("4");

    // No more than 4 (logic inside callback)
    userEvent.click(btn);
    expect(btn.textContent).toBe("No more than 4!! :)");
    userEvent.click(btn);
    expect(btn.textContent).toBe("No more than 4!! :)");
  });
});

function testItem(fn) {
  return ({ path, prevValue, value, times }) => {
    expect(fn).toHaveBeenCalledTimes(times);
    const params = fn.mock.calls[times - 1][0];
    expect(params.path).toBe(path);
    expect(params.prevValue).toBe(prevValue);
    expect(params.value).toBe(value);
    expect(typeof params.updateValue).toBe("function");
    return params.updateValue;
  };
}
