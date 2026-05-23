import { Router } from "express";
import {
	CATEGORIES,
	MAX_TASKS_PER_CATEGORY,
	type Category,
} from "../constants.js";
import { prisma } from "../db.js";

const router = Router();

function isCategory(value: string): value is Category {
	return (CATEGORIES as readonly string[]).includes(value);
}

router.get("/categories", (_req, res) => {
	res.json([...CATEGORIES]);
});

router.get("/todos", async (req, res) => {
	const { category } = req.query;

	if (category !== undefined) {
		if (typeof category !== "string" || !isCategory(category)) {
			res.status(400).json({ message: "Invalid category." });
			return;
		}
	}

	const todos = await prisma.todo.findMany({
		where:
			typeof category === "string" ? { category } : undefined,
		orderBy: { id: "asc" },
	});

	res.json(todos);
});

router.post("/todos", async (req, res) => {
	const { text, category } = req.body ?? {};

	if (typeof text !== "string" || !text.trim()) {
		res.status(400).json({ message: "Text is required." });
		return;
	}

	if (typeof category !== "string" || !isCategory(category)) {
		res.status(400).json({ message: "Invalid category." });
		return;
	}

	const countInCategory = await prisma.todo.count({
		where: { category },
	});

	if (countInCategory >= MAX_TASKS_PER_CATEGORY) {
		res.status(400).json({
			message: `Category "${category}" already has ${MAX_TASKS_PER_CATEGORY} tasks.`,
		});
		return;
	}

	const todo = await prisma.todo.create({
		data: {
			text: text.trim(),
			category,
		},
	});

	res.status(201).json(todo);
});

router.patch("/todos/:id", async (req, res) => {
	const { id } = req.params;
	const { completed } = req.body ?? {};

	if (typeof completed !== "boolean") {
		res.status(400).json({ message: "completed must be a boolean." });
		return;
	}

	const existing = await prisma.todo.findUnique({ where: { id } });

	if (!existing) {
		res.status(404).json({ message: "Task not found." });
		return;
	}

	const todo = await prisma.todo.update({
		where: { id },
		data: { completed },
	});

	res.json(todo);
});

router.delete("/todos/:id", async (req, res) => {
	const { id } = req.params;

	const existing = await prisma.todo.findUnique({ where: { id } });

	if (!existing) {
		res.status(404).json({ message: "Task not found." });
		return;
	}

	await prisma.todo.delete({ where: { id } });

	res.status(204).send();
});

export default router;
