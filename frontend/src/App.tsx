import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ApiError,
	createTodo,
	deleteTodo,
	fetchTodos,
	restoreTodo,
	updateTodo,
} from "./api/todos";
import { CategoryFilter } from "./components/CategoryFilter";
import { EmptyState } from "./components/EmptyState";
import { Loader } from "./components/Loader";
import { Snackbar } from "./components/Snackbar";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { useSnackbar } from "./hooks/useSnackbar";
import type { CreateTodoInput, FilterCategory, Todo } from "./types/todo";

const COMPLETE_GRACE_MS = 5000;

type PendingAction = {
	todo: Todo;
	timeoutId: ReturnType<typeof setTimeout>;
};

function App() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [filter, setFilter] = useState<FilterCategory>("All");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectionMode, setSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

	const { snackbar, show: showSnackbar, hide: hideSnackbar } = useSnackbar();
	const pendingCompleteRef = useRef<Map<string, PendingAction>>(new Map());
	const pendingDeleteRef = useRef<Map<string, PendingAction>>(new Map());

	const loadTodos = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchTodos();
			setTodos(data);
		} catch {
			setError("Failed to load tasks. Please try again.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadTodos();
	}, [loadTodos]);

	useEffect(() => {
		return () => {
			pendingCompleteRef.current.forEach(({ timeoutId }) =>
				clearTimeout(timeoutId),
			);
			pendingDeleteRef.current.forEach(({ timeoutId }) =>
				clearTimeout(timeoutId),
			);
		};
	}, []);

	const filteredTodos = useMemo(() => {
		if (filter === "All") {
			return todos;
		}
		return todos.filter((todo) => todo.category === filter);
	}, [todos, filter]);

	const selectableTodos = useMemo(
		() => filteredTodos.filter((todo) => !todo.completed),
		[filteredTodos],
	);

	const allSelectableSelected =
		selectableTodos.length > 0 &&
		selectableTodos.every((todo) => selectedIds.has(todo.id));

	const someSelectableSelected = selectableTodos.some((todo) =>
		selectedIds.has(todo.id),
	);

	useEffect(() => {
		setSelectedIds((prev) => {
			const selectable = new Set(selectableTodos.map((todo) => todo.id));
			const next = new Set([...prev].filter((id) => selectable.has(id)));
			return next.size === prev.size ? prev : next;
		});
	}, [selectableTodos]);

	useEffect(() => {
		if (selectableTodos.length === 0) {
			setSelectionMode(false);
			setSelectedIds(new Set());
		}
	}, [selectableTodos.length]);

	const exitSelectionMode = useCallback(() => {
		setSelectionMode(false);
		setSelectedIds(new Set());
	}, []);

	const enterSelectionMode = useCallback(() => {
		setSelectionMode(true);
	}, []);

	const cancelPending = (map: Map<string, PendingAction>, id: string) => {
		const pending = map.get(id);
		if (pending) {
			clearTimeout(pending.timeoutId);
			map.delete(id);
		}
	};

	const handleCreate = async (input: CreateTodoInput) => {
		setFormError(null);
		setIsSubmitting(true);
		try {
			const created = await createTodo(input);
			setTodos((prev) => [...prev, created]);
		} catch (err) {
			const message =
				err instanceof ApiError
					? err.message
					: "Failed to create task. Please try again.";
			setFormError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const finalizeComplete = useCallback(async (id: string) => {
		pendingCompleteRef.current.delete(id);
		try {
			await deleteTodo(id);
			setTodos((prev) => prev.filter((todo) => todo.id !== id));
		} catch {
			setError("Failed to remove completed task.");
		}
	}, []);

	const toggleSelection = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const handleSelectAll = (selected: boolean) => {
		if (selected) {
			setSelectedIds(new Set(selectableTodos.map((todo) => todo.id)));
		} else {
			setSelectedIds(new Set());
		}
	};

	const handleBulkComplete = async () => {
		const targets = selectableTodos.filter(
			(todo) =>
				selectedIds.has(todo.id) &&
				!pendingCompleteRef.current.has(todo.id),
		);
		if (targets.length === 0) {
			return;
		}

		try {
			const updated = await Promise.all(
				targets.map((todo) => updateTodo(todo.id, { completed: true })),
			);
			const updatedById = new Map(updated.map((todo) => [todo.id, todo]));

			setTodos((prev) =>
				prev.map((item) => updatedById.get(item.id) ?? item),
			);

			const ids = targets.map((todo) => todo.id);

			const undo = () => {
				for (const id of ids) {
					cancelPending(pendingCompleteRef.current, id);
				}
				hideSnackbar();
				Promise.all(
					ids.map((id) => updateTodo(id, { completed: false })),
				).then((restored) => {
					const restoredById = new Map(
						restored.map((todo) => [todo.id, todo]),
					);
					setTodos((prev) =>
						prev.map((item) => restoredById.get(item.id) ?? item),
					);
				});
			};

			const label =
				targets.length === 1
					? "Task completed"
					: `${targets.length} tasks completed`;
			showSnackbar(label, { label: "Undo", onClick: undo });

			let remaining = ids.length;
			for (const todo of updated) {
				const timeoutId = setTimeout(() => {
					finalizeComplete(todo.id);
					remaining -= 1;
					if (remaining === 0) {
						hideSnackbar();
					}
				}, COMPLETE_GRACE_MS);

				pendingCompleteRef.current.set(todo.id, {
					todo,
					timeoutId,
				});
			}

			exitSelectionMode();
		} catch {
			setError("Failed to complete tasks.");
		}
	};

	const handleToggleComplete = async (todo: Todo) => {
		if (todo.completed) {
			cancelPending(pendingCompleteRef.current, todo.id);
			hideSnackbar();
			try {
				const updated = await updateTodo(todo.id, { completed: false });
				setTodos((prev) =>
					prev.map((item) => (item.id === todo.id ? updated : item)),
				);
			} catch {
				setError("Failed to update task.");
			}
			return;
		}

		if (pendingCompleteRef.current.has(todo.id)) {
			return;
		}

		try {
			const updated = await updateTodo(todo.id, { completed: true });
			setTodos((prev) =>
				prev.map((item) => (item.id === todo.id ? updated : item)),
			);

			const undo = () => {
				cancelPending(pendingCompleteRef.current, todo.id);
				hideSnackbar();
				updateTodo(todo.id, { completed: false }).then((restored) => {
					setTodos((prev) =>
						prev.map((item) => (item.id === todo.id ? restored : item)),
					);
				});
			};

			showSnackbar("Task completed", { label: "Undo", onClick: undo });

			const timeoutId = setTimeout(() => {
				finalizeComplete(todo.id);
				hideSnackbar();
			}, COMPLETE_GRACE_MS);

			pendingCompleteRef.current.set(todo.id, {
				todo: updated,
				timeoutId,
			});
		} catch {
			setError("Failed to complete task.");
		}
	};

	const finalizeDelete = useCallback((id: string) => {
		pendingDeleteRef.current.delete(id);
	}, []);

	const handleDelete = async (todo: Todo) => {
		cancelPending(pendingCompleteRef.current, todo.id);

		const snapshot = { ...todo };
		setTodos((prev) => prev.filter((item) => item.id !== todo.id));

		try {
			await deleteTodo(todo.id);
		} catch {
			setTodos((prev) => [...prev, snapshot]);
			setError("Failed to delete task.");
			return;
		}

		const undo = async () => {
			cancelPending(pendingDeleteRef.current, todo.id);
			hideSnackbar();
			try {
				const restored = await restoreTodo(snapshot);
				setTodos((prev) => [...prev, restored]);
			} catch (err) {
				const message =
					err instanceof ApiError ? err.message : "Failed to restore task.";
				setError(message);
			}
		};

		showSnackbar("Task deleted", { label: "Undo", onClick: undo });

		const timeoutId = setTimeout(() => {
			finalizeDelete(todo.id);
		}, COMPLETE_GRACE_MS);

		pendingDeleteRef.current.set(todo.id, {
			todo: snapshot,
			timeoutId,
		});
	};

	return (
		<div className="mx-auto min-h-screen max-w-lg px-4 py-10">
			<header className="mb-8">
				<h1 className="text-2xl font-semibold text-white">Todos</h1>
				<p className="mt-1 text-sm text-gray-400">Up to 5 tasks per category</p>
			</header>

			<section className="mb-8 rounded-lg border border-gray-600 bg-gray-700/50 p-4">
				<h2 className="mb-4 text-sm font-medium text-gray-300">New task</h2>
				<TodoForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
				{formError && (
					<p className="mt-3 text-sm text-red-400" role="alert">
						{formError}
					</p>
				)}
			</section>

			<section>
				<div className="mb-4">
					<CategoryFilter value={filter} onChange={setFilter} />
				</div>

				{error && (
					<div
						role="alert"
						className="mb-4 rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300"
					>
						{error}
						<button
							type="button"
							onClick={loadTodos}
							className="ml-2 underline hover:text-red-200"
						>
							Retry
						</button>
					</div>
				)}

				{loading ? (
					<Loader />
				) : filteredTodos.length === 0 ? (
					<EmptyState />
				) : (
					<TodoList
						todos={filteredTodos}
						selectionMode={selectionMode}
						selectableCount={selectableTodos.length}
						selectedIds={selectedIds}
						allSelectableSelected={allSelectableSelected}
						someSelectableSelected={someSelectableSelected}
						onEnterSelectionMode={enterSelectionMode}
						onExitSelectionMode={exitSelectionMode}
						onSelectAll={handleSelectAll}
						onToggleSelection={toggleSelection}
						onBulkComplete={handleBulkComplete}
						onToggleComplete={handleToggleComplete}
						onDelete={handleDelete}
					/>
				)}
			</section>

			<Snackbar snackbar={snackbar} />
		</div>
	);
}

export default App;
