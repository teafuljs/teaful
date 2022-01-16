import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {act} from 'react-dom/test-utils';

import '@babel/polyfill';

import createStore from '../package/index';

describe('getStore', () => {
  it('should avoid rerenders on component that use the getStore', () => {
    const renderCart = jest.fn();
    const renderOther = jest.fn();
    const renderUpdateProps = jest.fn();

    const {useStore, getStore} = createStore({cart: {price: 0}, name: 'Aral', count: 0});

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
    const {useStore, getStore} = createStore({cart: {price: 0}, name: 'Aral', count: 0});

    function setStore(fields) {
      Object.keys(fields).forEach((key) => {
        const setStoreField = getStore[key]()[1];
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
    const {useStore, getStore} = createStore({cart: {items: []}});

    function push(proxy, value) {
      const [val, set] = proxy(getStore);
      set([...val, value]);
    }

    function Cart() {
      const [cart] = useStore.cart();
      return <div data-testid="items">{cart.items.join(',')}</div>;
    }

    const items = (proxy) => proxy.cart.items();

    render(<Cart />);

    expect(screen.getByTestId('items').textContent).toContain('');

    act(() => push(items, 'firstElement'));
    expect(screen.getByTestId('items').textContent).toContain('firstElement');
    act(() => push(items, 'secondElement'));
    expect(screen.getByTestId('items').textContent).toContain('firstElement,secondElement');
  })
});
