import {Component} from 'react';
import {render, screen} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';

import '@babel/polyfill';

import createStore from '../package/index';

describe('withStore', () => {
  it('should rerender the last value', () => {
    const {withStore, getStore} = createStore({items: []});

    class TestComponent extends Component {
      render() {
        const [items] = this.props.store;
        return (
          <div data-testid="test">
            {items.map((item) => <div key={item}>{item}</div>)}
          </div>
        );
      }
    }

    const Test = withStore.items(TestComponent);

    render(<Test />);

    const update = getStore.items()[1];

    expect(screen.getByTestId('test').textContent).toBe('');

    act(() => update((v) => [...v, 'a']));
    expect(screen.getByTestId('test').textContent).toBe('a');

    act(() => update((v) => [...v, 'b']));
    expect(screen.getByTestId('test').textContent).toBe('ab');
  });

  it('should work with a non existing store value', () => {
    const {withStore, getStore} = createStore();

    class TestComponent extends Component {
      render() {
        const [items] = this.props.store;
        return (
          <div data-testid="test">
            {items.map((item) => <div key={item}>{item}</div>)}
          </div>
        );
      }
    }

    const Test = withStore.items(TestComponent, []);

    render(<Test />);

    const update = getStore.items()[1];

    expect(screen.getByTestId('test').textContent).toBe('');

    act(() => update((v) => [...v, 'a']));
    expect(screen.getByTestId('test').textContent).toBe('a');

    act(() => update((v) => [...v, 'b']));
    expect(screen.getByTestId('test').textContent).toBe('ab');
  });

  it('should allow to update the value', () => {
    const {withStore} = createStore();

    class TestComponent extends Component {
      render() {
        const [items, setItems] = this.props.store;
        return (
          <div onClick={() => setItems((v) => [...v, v.length])} data-testid="test">
            {items.map((item) => <div key={item}>{item}</div>)}
          </div>
        );
      }
    }

    const Test = withStore.items(TestComponent, []);

    render(<Test />);

    expect(screen.getByTestId('test').textContent).toBe('');

    userEvent.click(screen.getByTestId('test'));
    expect(screen.getByTestId('test').textContent).toBe('0');

    userEvent.click(screen.getByTestId('test'));
    expect(screen.getByTestId('test').textContent).toBe('01');
  });

  it('should allow to reset the value to the initial value', () => {
    const {withStore, getStore} = createStore();

    class TestComponent extends Component {
      render() {
        const [items, setItems] = this.props.store;
        return (
          <div onClick={() => setItems((v) => [...v, v.length])} data-testid="test">
            {items.map((item) => <div key={item}>{item}</div>)}
          </div>
        );
      }
    }

    const Test = withStore.items(TestComponent, []);

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
});
