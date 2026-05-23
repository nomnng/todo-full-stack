import { useForm } from "react-hook-form";
import { CATEGORIES, type Category, type CreateTodoInput } from "../types/todo";

type TodoFormProps = {
	onSubmit: (data: CreateTodoInput) => Promise<void>;
	isSubmitting: boolean;
};

type FormValues = CreateTodoInput;

export function TodoForm({ onSubmit, isSubmitting }: TodoFormProps) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormValues>({
		defaultValues: {
			text: "",
			category: "Work" as Category,
		},
	});

	const submit = handleSubmit(async (data) => {
		await onSubmit(data);
		reset({ text: "", category: data.category });
	});

	return (
		<form onSubmit={submit} className="flex flex-col gap-3">
			<div className="flex flex-col gap-1">
				<label htmlFor="todo-text" className="text-sm text-gray-400">
					Task
				</label>
				<input
					id="todo-text"
					type="text"
					placeholder="What needs to be done?"
					className="rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
					{...register("text", {
						required: "Task text is required",
						minLength: { value: 1, message: "Task text is required" },
					})}
				/>
				{errors.text && (
					<p className="text-sm text-red-400">{errors.text.message}</p>
				)}
			</div>

			<div className="flex flex-col gap-1">
				<label htmlFor="todo-category" className="text-sm text-gray-400">
					Category
				</label>
				<select
					id="todo-category"
					className="rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
					{...register("category", { required: true })}
				>
					{CATEGORIES.map((category) => (
						<option key={category} value={category}>
							{category}
						</option>
					))}
				</select>
			</div>

			<button
				type="submit"
				disabled={isSubmitting}
				className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
			>
				{isSubmitting ? "Adding…" : "Add task"}
			</button>
		</form>
	);
}
