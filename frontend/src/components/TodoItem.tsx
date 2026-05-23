import { Trash2 } from "lucide-react";
import type { Todo } from "../types/todo";

type TodoItemProps = {
	todo: Todo;
	selectionMode: boolean;
	isSelected: boolean;
	onToggleSelection: (id: string) => void;
	onToggleComplete: (todo: Todo) => void;
	onDelete: (todo: Todo) => void;
};

export function TodoItem({
	todo,
	selectionMode,
	isSelected,
	onToggleSelection,
	onToggleComplete,
	onDelete,
}: TodoItemProps) {
	const showSelection = selectionMode && !todo.completed;

	return (
		<li
			className={`flex items-center gap-3 rounded-md border px-3 py-3 ${
				showSelection && isSelected
					? "border-blue-500 bg-blue-950/30"
					: "border-gray-600 bg-gray-700"
			}`}
		>
			{showSelection ? (
				<input
					type="checkbox"
					checked={isSelected}
					onChange={() => onToggleSelection(todo.id)}
					className="h-4 w-4 shrink-0 accent-blue-500"
					aria-label={`Select "${todo.text}"`}
				/>
			) : (
				<input
					type="checkbox"
					checked={todo.completed}
					onChange={() => onToggleComplete(todo)}
					className="h-4 w-4 shrink-0 accent-blue-500"
					aria-label={`Mark "${todo.text}" as ${todo.completed ? "incomplete" : "complete"}`}
				/>
			)}

			<div className="min-w-0 flex-1">
				<p
					className={`truncate ${todo.completed ? "text-gray-400 line-through" : "text-white"}`}
				>
					{todo.text}
				</p>
				<div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
					<span className="rounded bg-gray-600 px-2 py-0.5">
						{todo.category}
					</span>
					<span>{todo.completed ? "Done" : "Not done"}</span>
				</div>
			</div>

			<button
				type="button"
				onClick={() => onDelete(todo)}
				className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-600 hover:text-red-400"
				aria-label={`Delete "${todo.text}"`}
			>
				<Trash2 className="h-4 w-4" />
			</button>
		</li>
	);
}
