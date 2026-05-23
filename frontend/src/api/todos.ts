import type { CreateTodoInput, Todo } from "../types/todo";

const MAX_TASKS_PER_CATEGORY = 5;
const MOCK_DELAY_MS = 400;

let todos: Todo[] = [
	{
		id: "1",
		text: "Review project requirements",
		category: "Work",
		completed: false,
	},
	{
		id: "2",
		text: "Buy groceries",
		category: "Shopping",
		completed: false,
	},
];

function delay(ms = MOCK_DELAY_MS) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId() {
	return crypto.randomUUID();
}

export class ApiError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ApiError";
	}
}

export async function fetchTodos(): Promise<Todo[]> {
	await delay();
	return todos.map((todo) => ({ ...todo }));
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
	await delay();

	const countInCategory = todos.filter(
		(todo) => todo.category === input.category,
	).length;

	if (countInCategory >= MAX_TASKS_PER_CATEGORY) {
		throw new ApiError(
			`Category "${input.category}" already has ${MAX_TASKS_PER_CATEGORY} tasks.`,
		);
	}

	const todo: Todo = {
		id: generateId(),
		text: input.text.trim(),
		category: input.category,
		completed: false,
	};

	todos = [...todos, todo];
	return { ...todo };
}

export async function updateTodo(
	id: string,
	patch: Partial<Pick<Todo, "completed">>,
): Promise<Todo> {
	await delay(200);

	const index = todos.findIndex((todo) => todo.id === id);
	if (index === -1) {
		throw new ApiError("Task not found.");
	}

	todos = todos.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo));

	return { ...todos[index] };
}

export async function deleteTodo(id: string): Promise<void> {
	await delay(200);
	todos = todos.filter((todo) => todo.id !== id);
}

export async function restoreTodo(todo: Todo): Promise<Todo> {
	await delay(100);

	const exists = todos.some((item) => item.id === todo.id);
	if (exists) {
		return { ...todo };
	}

	const countInCategory = todos.filter(
		(item) => item.category === todo.category,
	).length;

	if (countInCategory >= MAX_TASKS_PER_CATEGORY) {
		throw new ApiError(
			`Category "${todo.category}" already has ${MAX_TASKS_PER_CATEGORY} tasks.`,
		);
	}

	todos = [...todos, { ...todo }];
	return { ...todo };
}
