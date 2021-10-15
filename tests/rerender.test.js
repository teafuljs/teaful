import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@babel/polyfill";

import createStore from "../package/index";

describe("Examples", () => {
  test("should rerender ONLY Cart, CartPrice and AllStore after update cart.price", async () => {
    const { useStore } = createStore({
      cart: { price: 0, items: [] },
      username: "Aral",
    });
    const renderUsername = jest.fn();
    const renderCart = jest.fn();
    const renderCartPrice = jest.fn();
    const renderCartItems = jest.fn();
    const renderAllStore = jest.fn();

    function Username() {
      const [username] = useStore.username();
      renderUsername();
      return <div>{username}</div>;
    }

    function Cart() {
      const [cart] = useStore.cart();
      renderCart();
      return <div>{cart.items.length}</div>;
    }

    function CartPrice() {
      const [price, setPrice] = useStore.cart.price();
      renderCartPrice();
      return (
        <div data-testid="inc" onClick={() => setPrice((v) => v + 1)}>
          {price}
        </div>
      );
    }

    function CartItems() {
      const [items] = useStore.cart.items();
      renderCartItems();
      return <div>{items.length}</div>;
    }

    function AllStore() {
      const [store] = useStore();
      renderAllStore();
      return <div>{JSON.stringify(store)}</div>;
    }

    render(
      <>
        <Username />
        <Cart />
        <CartPrice />
        <CartItems />
        <AllStore />
      </>
    );

    // Initial render
    expect(renderUsername).toHaveBeenCalledTimes(1);
    expect(renderCart).toHaveBeenCalledTimes(1);
    expect(renderCartPrice).toHaveBeenCalledTimes(1);
    expect(renderCartItems).toHaveBeenCalledTimes(1);
    expect(renderAllStore).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("inc"));

    // After update
    expect(renderUsername).toHaveBeenCalledTimes(1);
    expect(renderCart).toHaveBeenCalledTimes(2);
    expect(renderCartPrice).toHaveBeenCalledTimes(2);
    expect(renderCartItems).toHaveBeenCalledTimes(1);
    expect(renderAllStore).toHaveBeenCalledTimes(2);
  });
});
