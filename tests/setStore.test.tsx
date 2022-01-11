import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@babel/polyfill';

import createStore from '../package/index';

describe('setStore', () => {
  it('should avoid rerenders on component that use the setStore', () => {
    const renderCart = jest.fn();
    const renderOther = jest.fn();
    const renderUpdateProps = jest.fn();

    const {useStore, setStore} = createStore({cart: {price: 0}, name: 'Aral', count: 0});

    function UpdateProps() {
      renderUpdateProps();
      return (
        <button data-testid="click" onClick={() => {
          setStore.name('ARAL');
          setStore.count(10);
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
    const {useStore, setStore} = createStore({cart: {price: 0}, name: 'Aral', count: 0});

    function setFragmentedStore(fields) {
      Object.keys(fields).forEach((key) => {
        setStore[key](fields[key]);
      });
    }

    function UpdateProps() {
      return <button data-testid="click" onClick={() => setFragmentedStore({name: 'ARAL', count: 10})} />;
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
});
