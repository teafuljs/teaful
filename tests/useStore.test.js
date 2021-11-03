import {render, screen} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';

import '@babel/polyfill';

import createStore from '../package/index';

describe('useStore', () => {
  it('should rerender the last value', () => {
    const {useStore, getStore} = createStore({items: []});

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
    const {useStore, getStore} = createStore();

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
    const {useStore} = createStore();

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

  it('should allow to reset the value to the initial value', () => {
    const {useStore, getStore} = createStore();

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

    const reset = getStore.items()[2];
    act(reset);
    expect(screen.getByTestId('test').textContent).toBe('');
  });

  it('should allow to reset the value to the initial value with useStore without path', () => {
    const {useStore, getStore} = createStore();

    function Test() {
      const [store, setStore] = useStore({items: []});
      return (
        <div onClick={() => setStore((store) => ({...store, items: [...store.items, store.items.length]}))} data-testid="test">
          {store.items.map((item) => <div key={item}>{item}</div>)}
        </div>
      );
    }

    render(<Test />);

    expect(screen.getByTestId('test').textContent).toBe('');

    userEvent.click(screen.getByTestId('test'));
    expect(screen.getByTestId('test').textContent).toBe('0');

    userEvent.click(screen.getByTestId('test'));
    expect(screen.getByTestId('test').textContent).toBe('01');

    const reset = getStore()[2];
    act(reset);
    expect(screen.getByTestId('test').textContent).toBe('');
  });

  it('should be possible to create more than one store', () => {
    const {useStore: useCart, getStore: getCart} = createStore({items: []});
    const {useStore: useCounter} = createStore({count: 0});

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
});
