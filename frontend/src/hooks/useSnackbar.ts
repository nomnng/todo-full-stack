import { useCallback, useRef, useState } from "react";

export type SnackbarAction = {
	label: string;
	onClick: () => void;
};

export type SnackbarState = {
	message: string;
	action?: SnackbarAction;
} | null;

const SNACKBAR_DURATION_MS = 5000;

export function useSnackbar() {
	const [snackbar, setSnackbar] = useState<SnackbarState>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearTimer = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const hide = useCallback(() => {
		clearTimer();
		setSnackbar(null);
	}, [clearTimer]);

	const show = useCallback(
		(message: string, action?: SnackbarAction) => {
			clearTimer();
			setSnackbar({ message, action });

			timerRef.current = setTimeout(() => {
				setSnackbar(null);
				timerRef.current = null;
			}, SNACKBAR_DURATION_MS);
		},
		[clearTimer],
	);

	return { snackbar, show, hide };
}
