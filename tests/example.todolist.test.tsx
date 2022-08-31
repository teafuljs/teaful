import { FormEvent } from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@babel/polyfill';

import createStore from '../package/index';

describe('Example: Todo list', () => {
  it('should work with a simple todo list app', () => {
    type Store = {
      todo: string[];
      done: string[];
    }
    const {useStore} = createStore<Store>({todo: [], done: []});
    const renderAddTodoTask = jest.fn();
    const renderTodoList = jest.fn();

    function AddTodoTask() {
      const [todo, setTodo] = useStore.todo();
      const addTask = (e: FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const input = form.children[0] as HTMLInputElement;
        setTodo([...todo, input.value]);
      };
      renderAddTodoTask();
      return (
        <form key={todo.length} onSubmit={addTask}>
          <input type="text" />
          <button type="submit">Add</button>
        </form>
      );
    }

    function TodoList() {
      const [todo, setTodo] = useStore.todo();
      const [done, setDone] = useStore.done();

      function reset() {
        setTodo([]);
        setDone([]);
      }

      renderTodoList();

      return (
        <div>
          <h1>Todo tasks</h1>
          <ul data-testid="todo">
            {todo.map((t) => (
              <li key={t}>
                {t}
                <button
                  onClick={() => {
                    setTodo(todo.filter((i) => i !== t));
                    setDone([...done, t]);
                  }}
                >
                  Done
                </button>
              </li>
            ))}
          </ul>
          <h1>Done tasks</h1>
          <ul data-testid="done">
            {done.map((d) => (
              <li key={d}>
                {d}
                <button
                  onClick={() => {
                    setDone(done.filter((t) => t !== d));
                    setTodo([...todo, d]);
                  }}
                >
                  Undone
                </button>
              </li>
            ))}
          </ul>
          <button onClick={reset}>Reset</button>
        </div>
      );
    }

    render(
        <>
          <AddTodoTask />
          <TodoList />
        </>,
    );

    expect(renderAddTodoTask).toHaveBeenCalledTimes(1);
    expect(renderTodoList).toHaveBeenCalledTimes(1);

    // Add task
    userEvent.clear(screen.getByRole('textbox'));
    userEvent.type(screen.getByRole('textbox'), 'New task');
    userEvent.click(screen.getByText('Add'));
    expect(screen.getByTestId('todo').textContent).toContain('New task');
    expect(screen.getByTestId('done').textContent).not.toContain('New task');
    expect(renderAddTodoTask).toHaveBeenCalledTimes(2);
    expect(renderTodoList).toHaveBeenCalledTimes(2);

    // Move to done
    userEvent.click(screen.getByText('Done'));
    expect(screen.getByTestId('todo').textContent).not.toContain('New task');
    expect(screen.getByTestId('done').textContent).toContain('New task');
    expect(renderAddTodoTask).toHaveBeenCalledTimes(3);
    expect(renderTodoList).toHaveBeenCalledTimes(3);

    // Move to todo
    userEvent.click(screen.getByText('Undone'));
    expect(screen.getByTestId('todo').textContent).toContain('New task');
    expect(screen.getByTestId('done').textContent).not.toContain('New task');
    expect(renderAddTodoTask).toHaveBeenCalledTimes(4);
    expect(renderTodoList).toHaveBeenCalledTimes(4);

    // Move again to done
    userEvent.click(screen.getByText('Done'));
    expect(screen.getByTestId('todo').textContent).not.toContain('New task');
    expect(screen.getByTestId('done').textContent).toContain('New task');
    expect(renderAddTodoTask).toHaveBeenCalledTimes(5);
    expect(renderTodoList).toHaveBeenCalledTimes(5);

    // Add another task
    userEvent.type(screen.getByRole('textbox'), 'Another task');
    userEvent.click(screen.getByText('Add'));
    expect(screen.getByTestId('todo').textContent).toContain('Another task');
    expect(screen.getByTestId('todo').textContent).not.toContain('New task');
    expect(screen.getByTestId('done').textContent).toContain('New task');
    expect(screen.getByTestId('done').textContent).not.toContain('Another task');
    expect(renderAddTodoTask).toHaveBeenCalledTimes(6);
    expect(renderTodoList).toHaveBeenCalledTimes(6);

    // Reset
    userEvent.click(screen.getByText('Reset'));
    expect(screen.getByTestId('todo').textContent).not.toContain('New task');
    expect(screen.getByTestId('todo').textContent).not.toContain('Another task');
    expect(screen.getByTestId('done').textContent).not.toContain('New task');
    expect(screen.getByTestId('done').textContent).not.toContain('Another task');
    expect(renderAddTodoTask).toHaveBeenCalledTimes(7);
    expect(renderTodoList).toHaveBeenCalledTimes(7);
  });
});
