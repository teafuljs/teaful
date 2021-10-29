import {useState} from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@babel/polyfill';

import createStore from '../index';

describe('onSet callback', () => {
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

  it('should work via Store', () => {
    const callback = jest.fn();
    const initialStore = {cart: {price: 0, items: []}, username: 'Aral'};
    const {useStore, Store} = createStore();
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

    render(
        <Store store={initialStore} onSet={callback}>
          <Test />
        </Store>,
    );

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

  it('Should be possible to register more than 1 onSet (createStore + Store)', () => {
    const callbackCreateStore = jest.fn();
    const callbackStore = jest.fn();
    const initialStore = {cart: {price: 0, items: []}, username: 'Aral'};
    const {useStore, Store} = createStore({}, callbackCreateStore);
    const testCallbackCreateStore = testItem(callbackCreateStore);
    const testCallbackStore = testItem(callbackCreateStore);

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

    render(
        <Store store={initialStore} onSet={callbackStore}>
          <Test />
        </Store>,
    );

    userEvent.click(screen.getByTestId('click'));
    expect(callbackCreateStore).toHaveBeenCalledTimes(2);
    testCallbackCreateStore({value: 1, prevValue: 0, times: 1, path: 'cart.price'});
    testCallbackCreateStore({
      value: 'Arala',
      prevValue: 'Aral',
      times: 2,
      path: 'username',
    });
    expect(callbackStore).toHaveBeenCalledTimes(2);
    testCallbackStore({value: 1, prevValue: 0, times: 1, path: 'cart.price'});
    testCallbackStore({
      value: 'Arala',
      prevValue: 'Aral',
      times: 2,
      path: 'username',
    });
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

  it('Updating the prevValue should work as limit | via Store + updating state', () => {
    const initialStore = {cart: {price: 0}};
    const {useStore, Store} = createStore(initialStore);

    function Test({displayText}) {
      const [price, setPrice] = useStore.cart.price();

      return (
        <button data-testid="click" onClick={() => setPrice((v) => v + 1)}>
          {displayText ? 'No more than 4!! :)' : price}
        </button>
      );
    }

    function TestApp() {
      const [displayText, setDisplayText] = useState(false);

      function onSet({path, prevValue, value, getStore}) {
        if (path !== 'cart.price') return;
        if (value > 4) {
          const [, setPrice] = getStore.cart.price();
          setPrice(prevValue);
          setDisplayText(true);
        } else {
          setDisplayText(false);
        }
      }

      return (
        <Store onSet={onSet}>
          <Test displayText={displayText} />
        </Store>
      );
    }

    render(<TestApp />);

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
    expect(btn.textContent).toBe('No more than 4!! :)');
    userEvent.click(btn);
    expect(btn.textContent).toBe('No more than 4!! :)');
  });
});

it('Updating another value using the getStore should work', () => {
  const initialStore = {cart: {price: 0}, limit: false};
  const {useStore, Store} = createStore(initialStore);
  const renderTestApp = jest.fn();
  const renderTest = jest.fn();

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
    return (
      <Store onSet={({path, prevValue, value, getStore}) => {
        if (path !== 'cart.price') return;
        const [, setLimit] = getStore.limit();
        const [, setPrice] = getStore.cart.price();
        if (value > 4) setPrice(prevValue);
        setLimit(value > 4);
      }}>
        <Test />
      </Store>
    );
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
