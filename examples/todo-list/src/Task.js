import { FcFullTrash, FcCheckmark, FcClock } from "react-icons/fc";
// MdDone

const Task = ({ resolved, id, text, onClick, onDelete }) =>
    <li key={`todo-${id}`} className={resolved ? "Task resolved" : "Task"} >
        <div data-testid={`check-${id}`} onClick={onClick} >
            {resolved ? <FcCheckmark /> : <FcClock />}
            {' '}
            {text}
        </div>
        <div onClick={onDelete} data-testid={`delete-${id}`} >
            <FcFullTrash />
        </div>
    </li>

export default Task;