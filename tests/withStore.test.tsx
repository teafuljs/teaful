import {Component} from 'react';
import {render, screen} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';

import '@babel/polyfill';

import createStore from '../package/index';

describe('withStore', () => {
  it('should rerender the last value', () => {
    type Store = {
      items?: string[],
    }
  
    const {withStore, getStore, useStore} = createStore<Store>({items: []});

    type Props = {
      store?: ReturnType<typeof useStore.items>;
    }

    class TestComponent extends Component<Props> {
      render() {
        const [items] = this.props.store;
        return (
          <div data-testid="test">
            {items.map((item: string) => <div key={item}>{item}</div>)}
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
    const {withStore, setStore, useStore} = createStore();

    type Props = {
      store?: ReturnType<typeof useStore.items>;
    }

    class TestComponent extends Component<Props> {
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

    const update = v => setStore.items(v);

    expect(screen.getByTestId('test').textContent).toBe('');

    act(() => update((v) => [...v, 'a']));
    expect(screen.getByTestId('test').textContent).toBe('a');

    act(() => update((v) => [...v, 'b']));
    expect(screen.getByTestId('test').textContent).toBe('ab');
  });

  it('should allow to update the value', () => {
    const {withStore, useStore} = createStore();

    type Props = {
      store?: ReturnType<typeof useStore.items>;
    }

    class TestComponent extends Component<Props> {
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
});
