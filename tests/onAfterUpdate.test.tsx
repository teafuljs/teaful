// @ts-nocheck
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {act} from 'react-dom/test-utils';
import {Component} from 'react';

import '@babel/polyfill';

import createStore from '../package/index';

describe('onAfterUpdate callback', () => {
  it('should be possible to remove an onAfterUpdate event when a component with useStore.test is unmounted', () => {
    const callback = jest.fn();
    const {useStore, getStore} = createStore({mount: true});

    function RegisterCallback() {
      useStore.test(undefined, callback);
      return null;
    }

    function Test() {
      const [mount] = useStore.mount();
      if (!mount) return null;
      return <RegisterCallback />;
    }

    render(<Test />);

    const update = getStore.test()[1];

    expect(callback).toHaveBeenCalledTimes(0);

    act(() => update({}));
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => update({}));
    expect(callback).toHaveBeenCalledTimes(2);

    act(() => getStore.mount()[1](false));
    expect(callback).toHaveBeenCalledTimes(3);

    // Updating twice to confirm that updates don't call the callback when the
    // component with the useStore is unmounted
    act(() => update({}));
    act(() => update({}));
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should be possible to remove an onAfterUpdate event when a component with useStore is unmounted', () => {
    const callback = jest.fn();
    const {useStore, getStore} = createStore({mount: true});

    function RegisterCallback() {
      useStore(undefined, callback);
      return null;
    }

    function Test() {
      const [mount] = useStore.mount();
      if (!mount) return null;
      return <RegisterCallback />;
    }

    render(<Test />);

    const update = getStore.test()[1];

    expect(callback).toHaveBeenCalledTimes(0);

    act(() => update({}));
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => update({}));
    expect(callback).toHaveBeenCalledTimes(2);

    act(() => getStore.mount()[1](false));
    expect(callback).toHaveBeenCalledTimes(3);

    act(() => update({}));
    act(() => update({}));
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should be possible to remove an onAfterUpdate event when a component with withStore is unmounted', () => {
    const callback = jest.fn();
    const {useStore, withStore, getStore} = createStore({mount: true});
    class RegisterCallbackComponent extends Component {
      render() {
        return null;
      }
    }

    const RegisterCallback = withStore
        .test(RegisterCallbackComponent, undefined, callback);

    function Test() {
      const [mount] = useStore.mount();
      if (!mount) return null;
      return <RegisterCallback />;
    }

    render(<Test />);

    const update = getStore.test()[1];

    expect(callback).toHaveBeenCalledTimes(0);

    act(() => update({}));
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => update({}));
    expect(callback).toHaveBeenCalledTimes(2);

    act(() => getStore.mount()[1](false));
    expect(callback).toHaveBeenCalledTimes(3);

    act(() => update({}));
    act(() => update({}));
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should work via createStore', () => {
    const callback = jest.fn();
    const initialStore = {cart: {price: 0, items: []}, username: 'Aral'};
    const {useStore} = createStore(initialStore, callback);

    function Test() {
      const [, setPrice] = useStore.cart.price();
      const [, setUsername] = useStore.username();

      function onClick() {
        setPrice((v) => v + 1);
        setUsername((v) => v + 'a');
      }

      return (
        <button data-testid="click" onClick={onClick}>
          Test
        </button>
      );
    }

    render(<Test />);

    userEvent.click(screen.getByTestId('click'));
    expect(callback).toHaveBeenCalledTimes(2);

    userEvent.click(screen.getByTestId('click'));
    expect(callback).toHaveBeenCalledTimes(4);

    userEvent.click(screen.getByTestId('click'));
    userEvent.click(screen.getByTestId('click'));
    userEvent.click(screen.getByTestId('click'));
    expect(callback).toHaveBeenCalledTimes(10);
  });

  it('Should be possible to register more than 1 onAfterUpdate (createStore + useStore.cart.price)', () => {
    const callbackCreateStore = jest.fn();
    const callbackUseStore = jest.fn();
    const initialStore = {cart: {price: 0, items: []}, username: 'Aral'};
    const {useStore} = createStore(initialStore, callbackCreateStore);

    function Test() {
      const [, setPrice] = useStore.cart.price(0, callbackUseStore);
      const [, setUsername] = useStore.username();

      function onClick() {
        setPrice((v) => v + 1);
        setUsername((v) => v + 'a');
      }

      return (
        <button data-testid="click" onClick={onClick}>
          Test
        </button>
      );
    }

    render(<Test />);

    userEvent.click(screen.getByTestId('click'));
    expect(callbackCreateStore).toHaveBeenCalledTimes(2);
    expect(callbackUseStore).toHaveBeenCalledTimes(2);
  });

  it('Should be possible to register more than 1 onAfterUpdate (createStore + useStore)', () => {
    const callbackCreateStore = jest.fn();
    const callbackUseStore = jest.fn();
    const initialStore = {cart: {price: 0, items: []}, username: 'Aral'};
    const {useStore} = createStore(initialStore, callbackCreateStore);

    function Test() {
      const [, setStore] = useStore(undefined, callbackUseStore);

      function onClick() {
        setStore((store) => ({
          ...store,
          cart: {
            ...store.cart,
            price: store.cart.price + 1,
          },
        }));
      }

      return (
        <button data-testid="click" onClick={onClick}>
          Test
        </button>
      );
    }

    render(<Test />);

    userEvent.click(screen.getByTestId('click'));
    expect(callbackCreateStore).toHaveBeenCalledTimes(1);
    expect(callbackUseStore).toHaveBeenCalledTimes(1);
  });

  it('Should return the prevStore and store', () => {
    const initialStore = {cart: {price: 0}};
    const onAfterUpdate = jest.fn();
    const {useStore} = createStore(initialStore, onAfterUpdate);

    function Test() {
      const [, setPrice] = useStore.cart.price(0);

      return (
        <button data-testid="click" onClick={() => setPrice((v) => v + 1)}>
          Test
        </button>
      );
    }

    render(<Test />);

    userEvent.click(screen.getByTestId('click'));
    expect(onAfterUpdate).toHaveBeenCalledTimes(1);
    const params = onAfterUpdate.mock.calls[0][0];
    expect(params.store).toMatchObject({cart: {price: 1}});
    expect(params.prevStore).toMatchObject({cart: {price: 0}});

    userEvent.click(screen.getByTestId('click'));
    expect(onAfterUpdate).toHaveBeenCalledTimes(2);
    const params2 = onAfterUpdate.mock.calls[1][0];
    expect(params2.store).toMatchObject({cart: {price: 2}});
    expect(params2.prevStore).toMatchObject({cart: {price: 1}});
  });

  it('Updating the prevValue should work as limit | via createStore', () => {
    const initialStore = {cart: {price: 0}};
    const {useStore, getStore} = createStore(initialStore, callback);

    function callback({prevStore, store}) {
      const {price} = store.cart;
      if (price > 4) {
        const [, setPrice] = getStore.cart.price();
        setPrice(prevStore.cart.price);
      }
    }

    function Test() {
      const [price, setPrice] = useStore.cart.price();
      const [, setCart] = useStore.cart();

      const onClick = () => {
        if (price % 2 === 0) return setPrice((v) => v + 1);
        setCart((c) => ({...c, price: c.price + 1}));
      };

      return (
        <button data-testid="click" onClick={onClick}>
          {price}
        </button>
      );
    }

    render(<Test />);

    const btn = screen.getByTestId('click');
    expect(btn.textContent).toBe('0');
    userEvent.click(btn);
    expect(btn.textContent).toBe('1');
    userEvent.click(btn);
    expect(btn.textContent).toBe('2');
    userEvent.click(btn);
    expect(btn.textContent).toBe('3');
    userEvent.click(btn);
    expect(btn.textContent).toBe('4');

    // No more than 4 (logic inside callback)
    userEvent.click(btn);
    expect(btn.textContent).toBe('4');
    userEvent.click(btn);
    expect(btn.textContent).toBe('4');
  });

  it('Should be possible to create calculated variables', () => {
    const renderTest = jest.fn();
    const initialStore = {cart: {price: 0, items: []}};
    const {useStore, getStore} = createStore(initialStore, onAfterUpdate);

    function onAfterUpdate({store}) {
      const {items, price} = store.cart;
      const calculatedPrice = items.length * 3;
      if (price !== calculatedPrice) {
        const [, setPrice] = getStore.cart.price();
        setPrice(calculatedPrice);
      }
    }

    function Test() {
      const [cart, setCart] = useStore.cart();
      renderTest();
      return (
        <>
          <div data-testid="price">{cart.price}</div>
          <button
            data-testid="click"
            onClick={() => setCart((v) => ({
              ...v,
              items: [...v.items, {name: 'newItem'}],
            }))}>
            {cart.items.length} items
          </button>
        </>
      );
    }

    render(<Test />);

    const btn = screen.getByTestId('click');
    const price = screen.getByTestId('price');

    expect(renderTest).toHaveBeenCalledTimes(1);
    expect(price.textContent).toBe('0');
    expect(btn.textContent).toBe('0 items');

    userEvent.click(btn);
    expect(renderTest).toHaveBeenCalledTimes(2);
    expect(price.textContent).toBe('3');
    expect(btn.textContent).toBe('1 items');

    userEvent.click(btn);
    expect(renderTest).toHaveBeenCalledTimes(3);
    expect(price.textContent).toBe('6');
    expect(btn.textContent).toBe('2 items');

    // No possible to modifiy a calculated value
    act(() => getStore.cart.price()[1](0));
    expect(renderTest).toHaveBeenCalledTimes(4);
    expect(price.textContent).toBe('6');
    expect(btn.textContent).toBe('2 items');
  });

  it('Updating another value using the getStore should work', () => {
    const initialStore = {cart: {price: 0}, limit: false};
    const {useStore, getStore} = createStore(initialStore, onAfterUpdate);
    const renderTestApp = jest.fn();
    const renderTest = jest.fn();

    function onAfterUpdate({prevStore, store}) {
      const price = store.cart.price;
      const prevPrice = prevStore.cart.price;
      const [, setLimit] = getStore.limit();

      if (price > 4) {
        const [, setPrice] = getStore.cart.price();
        setPrice(prevPrice);
        setLimit(true);
      }
    }

    function Test() {
      const [price, setPrice] = useStore.cart.price();
      const [limit] = useStore.limit();
      renderTest();
      return (
        <button data-testid="click" onClick={() => setPrice((v) => v + 1)}>
          {limit ? 'No more than 4!! :)' : price}
        </button>
      );
    }

    function TestApp() {
      renderTestApp();
      return <Test />;
    }

    render(<TestApp />);

    const btn = screen.getByTestId('click');

    expect(renderTest).toHaveBeenCalledTimes(1);
    expect(renderTestApp).toHaveBeenCalledTimes(1);
    expect(btn.textContent).toBe('0');
    userEvent.click(btn);
    expect(renderTest).toHaveBeenCalledTimes(2);
    expect(renderTestApp).toHaveBeenCalledTimes(1);
    expect(btn.textContent).toBe('1');
    userEvent.click(btn);
    expect(renderTest).toHaveBeenCalledTimes(3);
    expect(renderTestApp).toHaveBeenCalledTimes(1);
    expect(btn.textContent).toBe('2');
    userEvent.click(btn);
    expect(renderTest).toHaveBeenCalledTimes(4);
    expect(renderTestApp).toHaveBeenCalledTimes(1);
    expect(btn.textContent).toBe('3');
    userEvent.click(btn);
    expect(renderTest).toHaveBeenCalledTimes(5);
    expect(renderTestApp).toHaveBeenCalledTimes(1);
    expect(btn.textContent).toBe('4');

    // No more than 4 (logic inside callback)
    userEvent.click(btn);
    expect(renderTest).toHaveBeenCalledTimes(6);
    expect(renderTestApp).toHaveBeenCalledTimes(1);
    expect(btn.textContent).toBe('No more than 4!! :)');
    userEvent.click(btn);
    expect(renderTest).toHaveBeenCalledTimes(7);
    expect(renderTestApp).toHaveBeenCalledTimes(1);
    expect(btn.textContent).toBe('No more than 4!! :)');
  });
});
