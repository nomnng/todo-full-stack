export const CATEGORIES = ["Work", "Personal", "Shopping", "Health"] as const;

export type Category = (typeof CATEGORIES)[number];

export type Todo = {
	id: string;
	text: string;
	category: Category;
	completed: boolean;
};

export type CreateTodoInput = {
	text: string;
	category: Category;
};

export type FilterCategory = Category | "All";
