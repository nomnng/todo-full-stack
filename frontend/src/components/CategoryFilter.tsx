import { CATEGORIES, type FilterCategory } from "../types/todo";

type CategoryFilterProps = {
	value: FilterCategory;
	onChange: (value: FilterCategory) => void;
};

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
	return (
		<label className="flex flex-col gap-1 text-sm">
			<span className="text-gray-400">Filter by category</span>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value as FilterCategory)}
				className="rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
			>
				<option value="All">All</option>
				{CATEGORIES.map((category) => (
					<option key={category} value={category}>
						{category}
					</option>
				))}
			</select>
		</label>
	);
}
