import {Component} from 'react';
import {render, waitFor, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@babel/polyfill';

import createStore from '../index';

describe('Example: Counter', () => {
  it('should work with a simple counter', async () => {
    const {useStore, Store} = createStore({count: 0});

    function Counter() {
      const [count, setCount, resetCount] = useStore.count();
      return (
        <div>
          <h1>{count}</h1>
          <button onClick={() => setCount((v) => v + 1)}>+</button>
          <button onClick={() => setCount((v) => v - 1)}>-</button>
          <button onClick={resetCount}>reset</button>
        </div>
      );
    }

    function DisplayCounter() {
      const [count] = useStore.count();
      return <p data-testid="number">{count}</p>;
    }

    render(
        <Store>
          <Counter />
          <DisplayCounter />
        </Store>,
    );

    expect(screen.getByRole('heading').textContent).toBe('0');

    // Inc
    userEvent.click(screen.getByText('+'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('1');
    expect(screen.getByTestId('number').textContent).toContain('1');

    // Inc again
    userEvent.click(screen.getByText('+'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('2');
    expect(screen.getByTestId('number').textContent).toContain('2');

    // Dec
    userEvent.click(screen.getByText('-'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('1');
    expect(screen.getByTestId('number').textContent).toContain('1');

    // Inc again
    userEvent.click(screen.getByText('+'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('2');
    expect(screen.getByTestId('number').textContent).toContain('2');

    // Reset
    userEvent.click(screen.getByText('reset'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('0');
    expect(screen.getByTestId('number').textContent).toContain('0');
  });

  it('should work with a counter in a class component', async () => {
    const {useStore, withStore} = createStore({count: 0});

    class Counter extends Component {
      render() {
        const [count, setCount, resetCount] = this.props.store;
        return (
          <div>
            <h1>{count}</h1>
            <button onClick={() => setCount((v) => v + 1)}>+</button>
            <button onClick={() => setCount((v) => v - 1)}>-</button>
            <button onClick={resetCount}>reset</button>
          </div>
        );
      }
    }

    const CounterWithStore = withStore.count(Counter);

    function DisplayCounter() {
      const [count] = useStore.count();
      return <p data-testid="number">{count}</p>;
    }

    render(
        <>
          <CounterWithStore />
          <DisplayCounter />
        </>,
    );

    expect(screen.getByRole('heading').textContent).toBe('0');

    // Inc
    userEvent.click(screen.getByText('+'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('1');
    expect(screen.getByTestId('number').textContent).toContain('1');

    // Inc again
    userEvent.click(screen.getByText('+'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('2');
    expect(screen.getByTestId('number').textContent).toContain('2');

    // Dec
    userEvent.click(screen.getByText('-'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('1');
    expect(screen.getByTestId('number').textContent).toContain('1');

    // Inc again
    userEvent.click(screen.getByText('+'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('2');
    expect(screen.getByTestId('number').textContent).toContain('2');

    // Reset
    userEvent.click(screen.getByText('reset'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('0');
    expect(screen.getByTestId('number').textContent).toContain('0');
  });

  it('should work with a counter in a class component: with all store', async () => {
    const {useStore, withStore} = createStore({count: 0});

    class Counter extends Component {
      render() {
        const [store, setStore, resetStore] = this.props.store;
        return (
          <div>
            <h1>{store.count}</h1>
            <button
              onClick={() => setStore((s) => ({...s, count: s.count + 1}))}
            >
              +
            </button>
            <button
              onClick={() => setStore((s) => ({...s, count: s.count - 1}))}
            >
              -
            </button>
            <button onClick={resetStore}>reset</button>
          </div>
        );
      }
    }

    const CounterWithStore = withStore(Counter);

    function DisplayCounter() {
      const [count] = useStore.count();
      return <p data-testid="number">{count}</p>;
    }

    render(
        <>
          <CounterWithStore />
          <DisplayCounter />
        </>,
    );

    expect(screen.getByRole('heading').textContent).toBe('0');

    // Inc
    userEvent.click(screen.getByText('+'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('1');
    expect(screen.getByTestId('number').textContent).toContain('1');

    // Inc again
    userEvent.click(screen.getByText('+'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('2');
    expect(screen.getByTestId('number').textContent).toContain('2');

    // Dec
    userEvent.click(screen.getByText('-'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('1');
    expect(screen.getByTestId('number').textContent).toContain('1');

    // Inc again
    userEvent.click(screen.getByText('+'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('2');
    expect(screen.getByTestId('number').textContent).toContain('2');

    // Reset
    userEvent.click(screen.getByText('reset'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('0');
    expect(screen.getByTestId('number').textContent).toContain('0');
  });

  it('should work with a counter in a class component: with all store defined inside Store', async () => {
    const {useStore, withStore, Store} = createStore();

    class Counter extends Component {
      render() {
        const [store, setStore, resetStore] = this.props.store;
        return (
          <div>
            <h1>{store.count}</h1>
            <button
              onClick={() => setStore((s) => ({...s, count: s.count + 1}))}
            >
              +
            </button>
            <button
              onClick={() => setStore((s) => ({...s, count: s.count - 1}))}
            >
              -
            </button>
            <button onClick={resetStore}>reset</button>
          </div>
        );
      }
    }

    const CounterWithStore = withStore(Counter);

    function DisplayCounter() {
      const [count] = useStore.count();
      return <p data-testid="number">{count}</p>;
    }

    render(
        <Store store={{count: 0}}>
          <CounterWithStore />
          <DisplayCounter />
        </Store>,
    );

    expect(screen.getByRole('heading').textContent).toBe('0');

    // Inc
    userEvent.click(screen.getByText('+'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('1');
    expect(screen.getByTestId('number').textContent).toContain('1');

    // Inc again
    userEvent.click(screen.getByText('+'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('2');
    expect(screen.getByTestId('number').textContent).toContain('2');

    // Dec
    userEvent.click(screen.getByText('-'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('1');
    expect(screen.getByTestId('number').textContent).toContain('1');

    // Inc again
    userEvent.click(screen.getByText('+'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('2');
    expect(screen.getByTestId('number').textContent).toContain('2');

    // Reset
    userEvent.click(screen.getByText('reset'));
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading').textContent).toBe('0');
    expect(screen.getByTestId('number').textContent).toContain('0');
  });

  it('should work with a counter: as a new value (not defined on the store)',
      async () => {
        const {useStore} = createStore({anotherValue: ''});

        function Counter() {
          const [count, setCount, resetCount] = useStore.count();
          return (
            <div>
              <h1>{count}</h1>
              <button onClick={() => setCount((v) => v + 1)}>+</button>
              <button onClick={() => setCount((v) => v - 1)}>-</button>
              <button onClick={resetCount}>reset</button>
            </div>
          );
        }

        function DisplayCounter() {
          const [anotherValue] = useStore.anotherValue(
              'Should not be overwritted (only for initial values)',
          );
          const [count] = useStore.count(0); // initial value
          return (
            <>
              <p data-testid="number">{count}</p>
              <p data-testid="anotherValue">{anotherValue}</p>
            </>
          );
        }

        render(
            <>
              <Counter />
              <DisplayCounter />
            </>,
        );

        expect(screen.getByRole('heading').textContent).toBe('0');

        // Inc
        userEvent.click(screen.getByText('+'));
        await waitFor(() => screen.getByRole('heading'));
        expect(screen.getByRole('heading').textContent).toBe('1');
        expect(screen.getByTestId('number').textContent).toContain('1');

        // Inc again
        userEvent.click(screen.getByText('+'));
        await waitFor(() => screen.getByRole('heading'));
        expect(screen.getByRole('heading').textContent).toBe('2');
        expect(screen.getByTestId('number').textContent).toContain('2');

        // Dec
        userEvent.click(screen.getByText('-'));
        await waitFor(() => screen.getByRole('heading'));
        expect(screen.getByRole('heading').textContent).toBe('1');
        expect(screen.getByTestId('number').textContent).toContain('1');

        // Inc again
        userEvent.click(screen.getByText('+'));
        await waitFor(() => screen.getByRole('heading'));
        expect(screen.getByRole('heading').textContent).toBe('2');
        expect(screen.getByTestId('number').textContent).toContain('2');

        // Reset
        userEvent.click(screen.getByText('reset'));
        await waitFor(() => screen.getByRole('heading'));
        expect(screen.getByRole('heading').textContent).toBe('0');
        expect(screen.getByTestId('number').textContent).toContain('0');

        // Another value
        expect(screen.getByTestId('anotherValue').textContent).toBe('');
      });
  it('should work with a counter in a class component: as a new value (not defined on the store)',
      async () => {
        const {useStore, withStore} = createStore();

        class Counter extends Component {
          // Forcing update to verify that the initial value is not overwritten
          componentDidMount() {
            this.forceUpdate();
          }
          render() {
            const [count, setCount, resetCount] = this.props.store;
            return (
              <div>
                <h1>{count}</h1>
                <button onClick={() => setCount((v) => v + 1)}>+</button>
                <button onClick={() => setCount((v) => v - 1)}>-</button>
                <button onClick={resetCount}>reset</button>
              </div>
            );
          }
        }

        const CounterWithStore = withStore.counter.count(Counter, 0);

        function DisplayCounter() {
          const [count] = useStore.counter.count();
          return <p data-testid="number">{count}</p>;
        }

        render(
            <>
              <CounterWithStore />
              <DisplayCounter />
            </>,
        );

        expect(screen.getByRole('heading').textContent).toBe('0');

        // Inc
        userEvent.click(screen.getByText('+'));
        await waitFor(() => screen.getByRole('heading'));
        expect(screen.getByRole('heading').textContent).toBe('1');
        expect(screen.getByTestId('number').textContent).toContain('1');

        // Inc again
        userEvent.click(screen.getByText('+'));
        await waitFor(() => screen.getByRole('heading'));
        expect(screen.getByRole('heading').textContent).toBe('2');
        expect(screen.getByTestId('number').textContent).toContain('2');

        // Dec
        userEvent.click(screen.getByText('-'));
        await waitFor(() => screen.getByRole('heading'));
        expect(screen.getByRole('heading').textContent).toBe('1');
        expect(screen.getByTestId('number').textContent).toContain('1');

        // Inc again
        userEvent.click(screen.getByText('+'));
        await waitFor(() => screen.getByRole('heading'));
        expect(screen.getByRole('heading').textContent).toBe('2');
        expect(screen.getByTestId('number').textContent).toContain('2');

        // Reset
        userEvent.click(screen.getByText('reset'));
        await waitFor(() => screen.getByRole('heading'));
        expect(screen.getByRole('heading').textContent).toBe('0');
        expect(screen.getByTestId('number').textContent).toContain('0');
      });
});
