import {useStore} from './store';

import Task from './Task';

export default function TodoList() {
  const [todo, setTodo, resetTodo] = useStore.todo();
  const [done, setDone, resetDone] = useStore.done();
  const [error] = useStore.error();

  const resolve = (task) => {
    deleteTask(task.id);
    setDone({...done, [task.id]: {...task}});
  };

  const unresolve = (task) => {
    deleteTask(task.id, true);
    setTodo({...todo, [task.id]: {...task}});
  };

  const deleteTask = (id, resolved) => {
    if (resolved) {
      const newDoneList = {...done};
      delete newDoneList[id];
      setDone(newDoneList);
    } else {
      const newTodoList = {...todo};
      delete newTodoList[id];
      setTodo(newTodoList);
    }
  };

  const resetAll = () => {
    resetTodo();
    resetDone();
  };

  return (
    <>
      <div className="TodoList">
        <h2> Tasks </h2>
        <ul data-testid="todo" className="list">
          {Object.values(todo).map((t) => (
            <Task
              key={`todo-${t.id}`}
              {...t}
              onClick={() => resolve(t)}
              onDelete={() => deleteTask(t.id)}
            />
          ))}
        </ul>

        <h2>Resolved </h2>
        <ul data-testid="done" className="list">
          {Object.values(done).map((d) => (
            <Task
              key={`done-${d.id}`}
              {...d}
              resolved={true}
              onClick={() => unresolve(d)}
              onDelete={() => deleteTask(d.id, true)}
            />
          ))}
        </ul>
      </div>
      <br />
      <button onClick={resetAll}>Reset All</button>
      {error && <p className="errorLabel">{error}</p>}

    </>
  );
}
