import { ClipboardList } from "lucide-react";

export function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
			<ClipboardList className="h-10 w-10" aria-hidden />
			<p className="text-sm">No tasks</p>
		</div>
	);
}
