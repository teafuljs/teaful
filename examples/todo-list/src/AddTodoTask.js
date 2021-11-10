import {useState} from 'react';
import {useStore} from './store';

export default function AddTodoTask() {
  const [counter, setCounter] = useState(0);
  const [error, setError] = useStore.error();
  const [todo, setTodo] = useStore.todo();
  const addTask = (e) => {
    console.log(JSON.stringify(e.target.children[0].value));
    e.preventDefault();
    if (e.target.children[0].value.trim() === '') {
      setError('Can\'t add empty tasks');
      return;
    } else setError(undefined);

    setTodo({
      ...todo,
      [counter]: {text: e.target.children[0].value, id: counter},
    });
    e.target.children[0].value = '';
    setCounter(counter + 1);
  };
  return (
    <form onSubmit={addTask} className="AddTodoTask">
      <input
        data-testid="textbox"
        type="text"
        className={'textBox'}
        placeholder={error ? error : 'Add task\'s text'}
      />
      <button type="submit"> Add</button>
    </form>
  );
}
