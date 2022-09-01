import {useState} from 'react';
import {render, screen} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';

import '@babel/polyfill';

import createStore from '../package/index';

describe('useStore', () => {
  it('should rerender the last value', () => {
    type Store = {
      items: string[];
    }
    const {useStore, getStore} = createStore<Store>({items: []});

    function Test() {
      const [items] = useStore.items();
      return (
        <div data-testid="test">
          {items.map((item) => <div key={item}>{item}</div>)}
        </div>
      );
    }

    render(<Test />);

    const update = getStore.items()[1];

    expect(screen.getByTestId('test').textContent).toBe('');

    act(() => update((v) => [...v, 'a']));
    expect(screen.getByTestId('test').textContent).toBe('a');

    act(() => update((v) => [...v, 'b']));
    expect(screen.getByTestId('test').textContent).toBe('ab');
  });

  it('should work with a non existing store value', () => {
    type Store = {
      items: string[];
    }
    const {useStore, getStore} = createStore<Store>();

    function Test() {
      const [items] = useStore.items([]);
      return (
        <div data-testid="test">
          {items.map((item) => <div key={item}>{item}</div>)}
        </div>
      );
    }

    render(<Test />);

    const update = getStore.items()[1];

    expect(screen.getByTestId('test').textContent).toBe('');

    act(() => update((v) => [...v, 'a']));
    expect(screen.getByTestId('test').textContent).toBe('a');

    act(() => update((v) => [...v, 'b']));
    expect(screen.getByTestId('test').textContent).toBe('ab');
  });

  it('should allow to update the value', () => {
    type Store = {
      items: number[];
    }
    const {useStore} = createStore<Store>();

    function Test() {
      const [items, setItems] = useStore.items([]);
      return (
        <div onClick={() => setItems((v) => [...v, v.length])} data-testid="test">
          {items.map((item) => <div key={item}>{item}</div>)}
        </div>
      );
    }

    render(<Test />);

    expect(screen.getByTestId('test').textContent).toBe('');

    userEvent.click(screen.getByTestId('test'));
    expect(screen.getByTestId('test').textContent).toBe('0');

    userEvent.click(screen.getByTestId('test'));
    expect(screen.getByTestId('test').textContent).toBe('01');
  });

  it('should be possible to create more than one store', () => {
    type CartStore = {
       items: string[];
    }

    type CounterStore = {
      count: number;
    }

    const {useStore: useCart, getStore: getCart} = createStore<CartStore>({
      items: []
    });
    const {useStore: useCounter} = createStore<CounterStore>({count: 0});

    function Test() {
      const [count] = useCounter.count();
      const [items] = useCart.items();
      return (
        <>
          <div data-testid="counter">{count}</div>
          <div data-testid="cart">
            {items.map((item) => <div key={item}>{item}</div>)}
          </div>
        </>
      );
    }

    render(<Test />);

    const update = getCart.items()[1];

    expect(screen.getByTestId('counter').textContent).toBe('0');
    expect(screen.getByTestId('cart').textContent).toBe('');

    act(() => update((v) => [...v, 'a']));
    expect(screen.getByTestId('cart').textContent).toBe('a');

    act(() => update((v) => [...v, 'b']));
    expect(screen.getByTestId('cart').textContent).toBe('ab');
  });

  it('should work changing the index of an array on fly', () => {
    const onAfterUpdate = jest.fn();
    type Items = {
      price: number;
      name: string;
    }
    type Store = {
      cart: {
        items: Items[];
      }
    }
    const {useStore} = createStore<Store>({
      cart: {
        items: [],
      },
    }, onAfterUpdate);

    function Test() {
      const [state, setState] = useState<number>(0);
      const [item, setItem] = useStore.cart.items[state]();

      return (
        <>
          <h2 data-testid="item">Item: {JSON.stringify(item)}</h2>
          <button
            data-testid="update-item"
            onClick={async () => {
              await setItem({
                name: 'new Item',
                price: (item?.price || 0) + 1,
              });
            }}
          >
            Update item
          </button>
          <button data-testid="update-index" onClick={() => setState(2)}>change Index</button>
          <button onClick={() => setItem()}>Reset item</button>
        </>
      );
    }

    render(<Test />);

    expect(screen.getByTestId('item').textContent).toBe('Item: ');

    // Updating the item with index 0
    userEvent.click(screen.getByTestId('update-item'));
    expect(screen.getByTestId('item').textContent).toBe('Item: {"name":"new Item","price":1}');
    expect(onAfterUpdate.mock.calls[0][0].prevStore)
        .toMatchObject({cart: {items: []}});
    expect(onAfterUpdate.mock.calls[0][0].store)
        .toMatchObject({cart: {items: [{name: 'new Item', price: 1}]}});

    // Updating again the item with index 0
    userEvent.click(screen.getByTestId('update-item'));
    expect(screen.getByTestId('item').textContent).toBe('Item: {"name":"new Item","price":2}');
    expect(onAfterUpdate.mock.calls[1][0].prevStore)
        .toMatchObject({cart: {items: [{name: 'new Item', price: 1}]}});
    expect(onAfterUpdate.mock.calls[1][0].store)
        .toMatchObject({cart: {items: [{name: 'new Item', price: 2}]}});

    userEvent.click(screen.getByTestId('update-index'));
    expect(screen.getByTestId('item').textContent).toBe('Item: ');

    // Updating the item with index 2
    userEvent.click(screen.getByTestId('update-item'));
    expect(onAfterUpdate.mock.calls[2][0].prevStore)
        .toMatchObject({cart: {items: [{name: 'new Item', price: 2}]}});
    expect(onAfterUpdate.mock.calls[2][0].store)
        .toMatchObject({cart: {items: [{name: 'new Item', price: 2}, undefined, {name: 'new Item', price: 1}]}});
    expect(screen.getByTestId('item').textContent).toBe('Item: {"name":"new Item","price":1}');
  });

  it("should work with optional properties", () => {
    type User = {
      username: string;
    };

    type Store = {
      user?: User;
    };

    const { useStore, getStore } = createStore<Store>();

    function Test() {
      const [user] = useStore.user();
      const [username] = useStore.user.username();
      return (
        <>
          <div data-testid="username">{username}</div>
          <div data-testid="user">{JSON.stringify(user)}</div>
        </>
      );
    }

    render(<Test />);

    const update = getStore.user.username()[1];

    expect(screen.getByTestId("username").textContent).toBe("");

    act(() => update('myUsername'));
    expect(screen.getByTestId("username").textContent).toBe("myUsername");
    expect(screen.getByTestId("user").textContent).toBe('{"username":"myUsername"}');

    act(() => update((v) => v + "Update"));
    expect(screen.getByTestId("username").textContent).toBe("myUsernameUpdate");
    expect(screen.getByTestId("user").textContent).toBe('{"username":"myUsernameUpdate"}');
  });
});
