import type { SnackbarState } from "../hooks/useSnackbar";

type SnackbarProps = {
	snackbar: SnackbarState;
};

export function Snackbar({ snackbar }: SnackbarProps) {
	if (!snackbar) {
		return null;
	}

	return (
		<div
			role="status"
			aria-live="polite"
			className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg ring-1 ring-gray-700"
		>
			<span>{snackbar.message}</span>
			{snackbar.action && (
				<button
					type="button"
					className="font-medium text-blue-400 hover:text-blue-300"
					onClick={snackbar.action.onClick}
				>
					{snackbar.action.label}
				</button>
			)}
		</div>
	);
}
