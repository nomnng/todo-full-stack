export const CATEGORIES = ["Work", "Personal", "Shopping", "Health"] as const;

export type Category = (typeof CATEGORIES)[number];

export const MAX_TASKS_PER_CATEGORY = 5;
