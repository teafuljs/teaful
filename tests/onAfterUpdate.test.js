import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@babel/polyfill';

import createStore from '../package/index';
import {act} from 'react-dom/test-utils';

describe('onAfterUpdate callback', () => {
  it('should be possible to remove an onAfterUpdate event when a component with useStore is unmounted', () => {
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
    const unmount = () => getStore.mount()[1](false);

    expect(callback).toHaveBeenCalledTimes(0);

    act(() => update({}));
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => update({}));
    expect(callback).toHaveBeenCalledTimes(2);

    act(() => unmount());
    act(() => update({}));
    act(() => update({}));
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should work via createStore', () => {
    const callback = jest.fn();
    const initialStore = {cart: {price: 0, items: []}, username: 'Aral'};
    const {useStore} = createStore(initialStore, callback);
    const testCallback = testItem(callback);

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
    testCallback({value: 1, prevValue: 0, times: 1, path: 'cart.price'});
    testCallback({
      value: 'Arala',
      prevValue: 'Aral',
      times: 2,
      path: 'username',
    });

    userEvent.click(screen.getByTestId('click'));
    expect(callback).toHaveBeenCalledTimes(4);
    testCallback({value: 2, prevValue: 1, times: 3, path: 'cart.price'});
    testCallback({
      value: 'Aralaa',
      prevValue: 'Arala',
      times: 4,
      path: 'username',
    });

    userEvent.click(screen.getByTestId('click'));
    userEvent.click(screen.getByTestId('click'));
    userEvent.click(screen.getByTestId('click'));
    expect(callback).toHaveBeenCalledTimes(10);
    testCallback({value: 5, prevValue: 4, times: 9, path: 'cart.price'});
    testCallback({
      value: 'Aralaaaaa',
      prevValue: 'Aralaaaa',
      times: 10,
      path: 'username',
    });
  });

  it('Should be possible to register more than 1 onSet (createStore + useStore)', () => {
    const callbackCreateStore = jest.fn();
    const callbackUseStore = jest.fn();
    const initialStore = {cart: {price: 0, items: []}, username: 'Aral'};
    const {useStore} = createStore(initialStore, callbackCreateStore);
    const testCallbackCreateStore = testItem(callbackCreateStore);
    const testCallbackUseStore = testItem(callbackUseStore);

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
    testCallbackCreateStore({value: 1, prevValue: 0, times: 1, path: 'cart.price'});
    testCallbackCreateStore({
      value: 'Arala',
      prevValue: 'Aral',
      times: 2,
      path: 'username',
    });
    expect(callbackUseStore).toHaveBeenCalledTimes(1);
    testCallbackUseStore({value: 1, prevValue: 0, times: 1, path: 'cart.price'});
  });

  it('Updating the prevValue should work as limit | via createStore', () => {
    const callback = ({path, prevValue, value, getStore}) => {
      if (
        (path === 'cart.price' && value > 4) ||
        (path === 'cart' && value.price > 4)
      ) {
        const [, setPrice] = getStore.cart.price();
        setPrice(prevValue);
      }
    };
    const initialStore = {cart: {price: 0}};
    const {useStore} = createStore(initialStore, callback);

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

  it('Updating another value using the getStore should work', () => {
    const initialStore = {cart: {price: 0}, limit: false};
    const {useStore} = createStore(initialStore, onSet);
    const renderTestApp = jest.fn();
    const renderTest = jest.fn();

    function onSet({path, prevValue, value, getStore}) {
      if (path !== 'cart.price') return;
      const [, setLimit] = getStore.limit();
      const [, setPrice] = getStore.cart.price();
      if (value > 4) setPrice(prevValue);
      setLimit(value > 4);
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

function testItem(fn) {
  return ({path, prevValue, value, times}) => {
    const params = fn.mock.calls[times - 1][0];
    expect(params.path).toBe(path);
    expect(params.prevValue).toBe(prevValue);
    expect(params.value).toBe(value);
    expect(typeof params.getStore !== 'undefined').toBeTruthy();
    return params.getStore;
  };
}
