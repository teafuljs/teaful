import AddTodoTask from './AddTodoTask';
import TodoList from './TodoList';
import './styles.css';

export function App() {
  return (
    <div className="App">
      <AddTodoTask />
      <TodoList />
    </div>
  );
}
