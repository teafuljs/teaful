import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@babel/polyfill';

import createStore from '../index';

describe('Example: Todo list', () => {
  it('should work with a simple todo list app', () => {
    const {useStore} = createStore({todo: [], done: []});

    function AddTodoTask() {
      const [todo, setTodo] = useStore.todo();
      const addTask = (e) => {
        e.preventDefault();
        setTodo([...todo, e.target.children[0].value]);
      };
      return (
        <form onSubmit={addTask}>
          <input type="text" />
          <button type="submit">Add</button>
        </form>
      );
    }

    function TodoList() {
      const [todo, setTodo] = useStore.todo();
      const [done, setDone] = useStore.done();
      return (
        <div>
          <h1>Todo tasks</h1>
          <ul data-testid="todo">
            {todo.map((t) => (
              <li key={t}>
                {t}
                <button
                  onClick={() => {
                    setTodo(todo.filter((t) => t !== t));
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
        </div>
      );
    }

    render(
        <>
          <AddTodoTask />
          <TodoList />
        </>,
    );

    // Add task
    userEvent.type(screen.getByRole('textbox'), 'New task');
    userEvent.click(screen.getByText('Add'));
    expect(screen.getByTestId('todo').textContent).toContain('New task');
    expect(screen.getByTestId('done').textContent).not.toContain('New task');

    // Move to done
    userEvent.click(screen.getByText('Done'));
    expect(screen.getByTestId('todo').textContent).not.toContain('New task');
    expect(screen.getByTestId('done').textContent).toContain('New task');

    // Move to todo
    userEvent.click(screen.getByText('Undone'));
    expect(screen.getByTestId('todo').textContent).toContain('New task');
    expect(screen.getByTestId('done').textContent).not.toContain('New task');
  });
});
