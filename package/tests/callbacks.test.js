import {useState} from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {act} from 'react-dom/test-utils';

import '@babel/polyfill';

import createStore from '../index';

describe('Callbacks', () => {
  it('should work via createStore', () => {
    const cart = jest.fn();
    const username = jest.fn();
    const callbacks = {cart, username};
    const initialStore = {cart: {price: 0, items: []}, username: 'Aral'};
    const {useStore} = createStore(initialStore, callbacks);
    const testCart = testItem(cart);
    const testUsername = testItem(username);

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
    testCart({value: 1, prevValue: 0, times: 1, path: 'cart.price'});
    testUsername({
      value: 'Arala',
      prevValue: 'Aral',
      times: 1,
      path: 'username',
    });

    userEvent.click(screen.getByTestId('click'));
    testCart({value: 2, prevValue: 1, times: 2, path: 'cart.price'});
    testUsername({
      value: 'Aralaa',
      prevValue: 'Arala',
      times: 2,
      path: 'username',
    });

    userEvent.click(screen.getByTestId('click'));
    userEvent.click(screen.getByTestId('click'));
    userEvent.click(screen.getByTestId('click'));
    testCart({value: 5, prevValue: 4, times: 5, path: 'cart.price'});
    testUsername({
      value: 'Aralaaaaa',
      prevValue: 'Aralaaaa',
      times: 5,
      path: 'username',
    });
  });

  it('should work via Store', () => {
    const cart = jest.fn();
    const username = jest.fn();
    const callbacks = {cart, username};
    const initialStore = {cart: {price: 0, items: []}, username: 'Aral'};
    const {useStore, Store} = createStore();
    const testCart = testItem(cart);
    const testUsername = testItem(username);

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
        <Store store={initialStore} callbacks={callbacks}>
          <Test />
        </Store>,
    );

    userEvent.click(screen.getByTestId('click'));
    testCart({value: 1, prevValue: 0, times: 1, path: 'cart.price'});
    testUsername({
      value: 'Arala',
      prevValue: 'Aral',
      times: 1,
      path: 'username',
    });

    userEvent.click(screen.getByTestId('click'));
    testCart({value: 2, prevValue: 1, times: 2, path: 'cart.price'});
    testUsername({
      value: 'Aralaa',
      prevValue: 'Arala',
      times: 2,
      path: 'username',
    });

    userEvent.click(screen.getByTestId('click'));
    userEvent.click(screen.getByTestId('click'));
    userEvent.click(screen.getByTestId('click'));
    testCart({value: 5, prevValue: 4, times: 5, path: 'cart.price'});
    testUsername({
      value: 'Aralaaaaa',
      prevValue: 'Aralaaaa',
      times: 5,
      path: 'username',
    });
  });

  it('Should be possible to overwrite only ONE callback from createStore using the Store', () => {
    const cart = jest.fn();
    const username = jest.fn();
    const initialStore = {cart: {price: 0, items: []}, username: 'Aral'};
    const {useStore, Store} = createStore({}, {cart});
    const testCart = testItem(cart);
    const testUsername = testItem(username);

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
        <Store store={initialStore} callbacks={{username}}>
          <Test />
        </Store>,
    );

    userEvent.click(screen.getByTestId('click'));
    testCart({value: 1, prevValue: 0, times: 1, path: 'cart.price'});
    testUsername({
      value: 'Arala',
      prevValue: 'Aral',
      times: 1,
      path: 'username',
    });

    userEvent.click(screen.getByTestId('click'));
    testCart({value: 2, prevValue: 1, times: 2, path: 'cart.price'});
    testUsername({
      value: 'Aralaa',
      prevValue: 'Arala',
      times: 2,
      path: 'username',
    });

    userEvent.click(screen.getByTestId('click'));
    userEvent.click(screen.getByTestId('click'));
    userEvent.click(screen.getByTestId('click'));
    testCart({value: 5, prevValue: 4, times: 5, path: 'cart.price'});
    testUsername({
      value: 'Aralaaaaa',
      prevValue: 'Aralaaaa',
      times: 5,
      path: 'username',
    });
  });

  it('Updating again the value inside the callback should not call again the callback', () => {
    const cart = jest.fn();
    const username = jest.fn();
    const callbacks = {cart, username};
    const initialStore = {cart: {price: 0, items: []}, username: 'Aral'};
    const {useStore} = createStore(initialStore, callbacks);
    const testCart = testItem(cart);
    const testUsername = testItem(username);

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

    // Executing callback
    userEvent.click(screen.getByTestId('click'));
    const updateCart = testCart({
      value: 1,
      prevValue: 0,
      times: 1,
      path: 'cart.price',
    });
    const updateUsername = testUsername({
      value: 'Arala',
      prevValue: 'Aral',
      times: 1,
      path: 'username',
    });

    // Updating inside the callback should not call again the callback
    act(() => {
      updateCart(2);
      updateUsername((v) => v + 'l');
    });

    expect(cart).toHaveBeenCalledTimes(1);
    expect(username).toHaveBeenCalledTimes(1);

    // Executing callback again
    userEvent.click(screen.getByTestId('click'));
    testCart({value: 3, prevValue: 2, times: 2, path: 'cart.price'});
    testUsername({
      value: 'Aralala',
      prevValue: 'Aralal',
      times: 2,
      path: 'username',
    });
  });

  it('Updating the prevValue should work as limit | via createStore', () => {
    const cart = ({path, prevValue, value, updateValue}) => {
      if (
        (path === 'cart.price' && value > 4) ||
        (path === 'cart' && value.price > 4)
      ) {
        updateValue(prevValue);
      }
    };
    const initialStore = {cart: {price: 0}};
    const {useStore} = createStore(initialStore, {cart});

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

      function cart({path, prevValue, value, updateValue}) {
        if (path !== 'cart.price') return;
        if (value > 4) {
          updateValue(prevValue);
          setDisplayText(true);
        } else {
          setDisplayText(false);
        }
      }

      return (
        <Store callbacks={{cart}}>
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
  const {useStore, Store, getStore} = createStore(initialStore);
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
    const [, setLimit] = getStore.limit();

    function cart({path, prevValue, value, updateValue}) {
      if (path !== 'cart.price') return;
      if (value > 4) {
        updateValue(prevValue);
        setLimit(true);
      } else {
        setLimit(false);
      }
    }
    renderTestApp();
    return (
      <Store callbacks={{cart}}>
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
    expect(fn).toHaveBeenCalledTimes(times);
    const params = fn.mock.calls[times - 1][0];
    expect(params.path).toBe(path);
    expect(params.prevValue).toBe(prevValue);
    expect(params.value).toBe(value);
    expect(typeof params.updateValue).toBe('function');
    return params.updateValue;
  };
}
