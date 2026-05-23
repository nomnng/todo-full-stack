import axios from "axios";
import type { CreateTodoInput, Todo } from "../types/todo";
import { api } from "./client";

export class ApiError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ApiError";
	}
}

function getErrorMessage(error: unknown): string {
	if (axios.isAxiosError(error)) {
		const message = error.response?.data?.message;
		if (typeof message === "string") {
			return message;
		}
	}
	return "Request failed.";
}

export async function fetchCategories(): Promise<string[]> {
	const { data } = await api.get<string[]>("/categories");
	return data;
}

export async function fetchTodos(category?: string): Promise<Todo[]> {
	const { data } = await api.get<Todo[]>("/todos", {
		params: category ? { category } : undefined,
	});
	return data;
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
	try {
		const { data } = await api.post<Todo>("/todos", {
			text: input.text.trim(),
			category: input.category,
		});
		return data;
	} catch (error) {
		throw new ApiError(getErrorMessage(error));
	}
}

export async function updateTodo(
	id: string,
	patch: Partial<Pick<Todo, "completed">>,
): Promise<Todo> {
	try {
		const { data } = await api.patch<Todo>(`/todos/${id}`, patch);
		return data;
	} catch (error) {
		throw new ApiError(getErrorMessage(error));
	}
}

export async function deleteTodo(id: string): Promise<void> {
	try {
		await api.delete(`/todos/${id}`);
	} catch (error) {
		throw new ApiError(getErrorMessage(error));
	}
}

export async function restoreTodo(todo: Todo): Promise<Todo> {
	try {
		const { data } = await api.post<Todo>("/todos", {
			text: todo.text,
			category: todo.category,
		});
		if (todo.completed) {
			return updateTodo(data.id, { completed: true });
		}
		return data;
	} catch (error) {
		throw new ApiError(getErrorMessage(error));
	}
}
