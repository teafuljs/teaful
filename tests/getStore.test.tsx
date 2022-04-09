import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {act} from 'react-dom/test-utils';

import '@babel/polyfill';

import createStore from '../package/index';
import { HookReturn } from '../package/types';


describe('getStore', () => {
  it('should avoid rerenders on component that use the getStore', () => {
    const renderCart = jest.fn();
    const renderOther = jest.fn();
    const renderUpdateProps = jest.fn();

    type Store = {
      cart: {
        price: number;
      }
      name: string;
      count: number;
    }

    const {useStore, getStore} = createStore<Store>({cart: {price: 0}, name: 'Aral', count: 0});

    function UpdateProps() {
      const [, setName] = getStore.name();
      const [, setCount] = getStore.count();
      renderUpdateProps();
      return (
        <button data-testid="click" onClick={() => {
          setName('ARAL');
          setCount(10);
        }}
        />
      );
    }

    function Cart() {
      const [cart] = useStore.cart();
      renderCart();
      return <div data-testid="price">{cart.price}</div>;
    }

    function Other() {
      const [name] = useStore.name();
      const [count] = useStore.count();
      renderOther();
      return <div data-testid="other">{name} {count}</div>;
    }

    render(
        <>
          <Cart />
          <Other />
          <UpdateProps />
        </>,
    );

    expect(renderCart).toHaveBeenCalledTimes(1);
    expect(renderOther).toHaveBeenCalledTimes(1);
    expect(renderUpdateProps).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('price').textContent).toContain('0');
    expect(screen.getByTestId('other').textContent).toContain('Aral 0');

    userEvent.click(screen.getByTestId('click'));
    expect(renderUpdateProps).toHaveBeenCalledTimes(1);
    expect(renderCart).toHaveBeenCalledTimes(1);
    expect(renderOther).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('price').textContent).toContain('0');
    expect(screen.getByTestId('other').textContent).toContain('ARAL 10');
  });

  it('Update serveral portions should avoid rerenders in the rest', () => {
    const renderCart = jest.fn();
    const renderOther = jest.fn();

    type Store = {
      cart: {
        price: number;
      }
      name: string;
      count: number;
    }

    type Fields = Partial<Store>
    type Set = (value: number | string | { price: number } | undefined ) => void

    const {useStore, getStore} = createStore<Store>({cart: {price: 0}, name: 'Aral', count: 0});

    function setStore(fields: Fields) {
      (Object.keys(fields) as Array<keyof Fields>).forEach((key) => {
        const setStoreField = getStore[key]()[1] as Set;
        setStoreField(fields[key]);
      });
    }

    function UpdateProps() {
      return <button data-testid="click" onClick={() => setStore({name: 'ARAL', count: 10})} />;
    }

    function Cart() {
      const [cart] = useStore.cart();
      renderCart();
      return <div data-testid="price">{cart.price}</div>;
    }

    function Other() {
      const [name] = useStore.name();
      const [count] = useStore.count();
      renderOther();
      return <div data-testid="other">{name} {count}</div>;
    }

    render(
        <>
          <Cart />
          <Other />
          <UpdateProps />
        </>,
    );

    expect(renderCart).toHaveBeenCalledTimes(1);
    expect(renderOther).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('price').textContent).toContain('0');
    expect(screen.getByTestId('other').textContent).toContain('Aral 0');

    userEvent.click(screen.getByTestId('click'));
    expect(renderCart).toHaveBeenCalledTimes(1);
    expect(renderOther).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('price').textContent).toContain('0');
    expect(screen.getByTestId('other').textContent).toContain('ARAL 10');
  });

  it('should be possible to create methods to use the setter from getStore', () => {
    type Store = {
      cart: {
        items: string[]
      }
    }
    const {useStore, getStore} = createStore<Store>({cart: {items: []}});

    function push<T>(
      proxy: (proxy: typeof getStore) => HookReturn<T[]>, 
      value: T
    ) {
      const [val, set] = proxy(getStore);
      set([...val, value]);
    }

    function Cart() {
      const [cart] = useStore.cart();
      return <div data-testid="items">{cart.items.join(',')}</div>;
    }

    type Items = (
      proxy: typeof getStore
    ) => ReturnType<typeof getStore.cart.items>

    const items: Items = (proxy) => proxy.cart.items();

    render(<Cart />);

    expect(screen.getByTestId('items').textContent).toContain('');

    act(() => push<string>(items, 'firstElement'));
    expect(screen.getByTestId('items').textContent).toContain('firstElement');
    act(() => push<string>(items, 'secondElement'));
    expect(screen.getByTestId('items').textContent).toContain('firstElement,secondElement');
  })
});
