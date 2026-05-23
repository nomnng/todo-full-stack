import express from "express";
import cors from "cors";
import todosRouter from "./routes/todos.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(todosRouter);

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
