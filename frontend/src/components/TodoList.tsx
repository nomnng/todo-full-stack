import type { Todo } from "../types/todo";
import { TodoItem } from "./TodoItem";

type TodoListProps = {
	todos: Todo[];
	onToggleComplete: (todo: Todo) => void;
	onDelete: (todo: Todo) => void;
};

export function TodoList({ todos, onToggleComplete, onDelete }: TodoListProps) {
	return (
		<ul className="flex flex-col gap-2">
			{todos.map((todo) => (
				<TodoItem
					key={todo.id}
					todo={todo}
					onToggleComplete={onToggleComplete}
					onDelete={onDelete}
				/>
			))}
		</ul>
	);
}
