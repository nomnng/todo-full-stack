import type { Todo } from "../types/todo";
import { TodoItem } from "./TodoItem";

type TodoListProps = {
	todos: Todo[];
	selectionMode: boolean;
	selectableCount: number;
	selectedIds: Set<string>;
	allSelectableSelected: boolean;
	someSelectableSelected: boolean;
	onEnterSelectionMode: () => void;
	onExitSelectionMode: () => void;
	onSelectAll: (selected: boolean) => void;
	onToggleSelection: (id: string) => void;
	onBulkComplete: () => void;
	onToggleComplete: (todo: Todo) => void;
	onDelete: (todo: Todo) => void;
};

export function TodoList({
	todos,
	selectionMode,
	selectableCount,
	selectedIds,
	allSelectableSelected,
	someSelectableSelected,
	onEnterSelectionMode,
	onExitSelectionMode,
	onSelectAll,
	onToggleSelection,
	onBulkComplete,
	onToggleComplete,
	onDelete,
}: TodoListProps) {
	const selectedCount = selectedIds.size;
	const showBulkBar = selectableCount > 0;

	return (
		<div className="flex flex-col gap-3">
			{showBulkBar && (
				<div className="flex flex-wrap items-center gap-3 rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2">
					{selectionMode ? (
						<>
							<label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
								<input
									type="checkbox"
									checked={allSelectableSelected}
									ref={(el) => {
										if (el) {
											el.indeterminate =
												someSelectableSelected && !allSelectableSelected;
										}
									}}
									onChange={(e) => onSelectAll(e.target.checked)}
									className="h-4 w-4 accent-blue-500"
									aria-label="Select all incomplete tasks"
								/>
								Select all
							</label>

							{selectedCount > 0 && (
								<button
									type="button"
									onClick={onBulkComplete}
									className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
								>
									Mark {selectedCount} as done
								</button>
							)}

							<button
								type="button"
								onClick={onExitSelectionMode}
								className="text-sm text-gray-400 hover:text-white"
							>
								Cancel
							</button>
						</>
					) : (
						<button
							type="button"
							onClick={onEnterSelectionMode}
							className="w-full rounded-md border border-gray-500 bg-gray-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-500"
						>
							Select tasks
						</button>
					)}
				</div>
			)}

			<ul className="flex flex-col gap-2">
				{todos.map((todo) => (
					<TodoItem
						key={todo.id}
						todo={todo}
						selectionMode={selectionMode}
						isSelected={selectedIds.has(todo.id)}
						onToggleSelection={onToggleSelection}
						onToggleComplete={onToggleComplete}
						onDelete={onDelete}
					/>
				))}
			</ul>
		</div>
	);
}
