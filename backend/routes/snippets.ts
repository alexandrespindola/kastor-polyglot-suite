import { Hono } from "hono";
import {
	connectDB,
	getSnippetsCollection,
	type Snippet,
} from "../db/connection";

const app = new Hono();

// GET /api/snippets
app.get("/", async (c) => {
	try {
		await connectDB();
		const snippetsCollection = getSnippetsCollection();
		const snippets = await snippetsCollection
			.find({})
			.sort({ createdAt: -1 })
			.toArray();

		return c.json(
			snippets.map((s: Snippet) => ({
				id: s._id?.toString(),
				title: s.title,
				code: s.code,
				createdAt: s.createdAt.toISOString(),
			})),
		);
	} catch (error) {
		console.error("Error fetching snippets:", error);
		return c.json({ error: "Failed to fetch snippets" }, 500);
	}
});

// POST /api/snippets
app.post("/", async (c) => {
	try {
		await connectDB();
		const snippetsCollection = getSnippetsCollection();
		const { title, code } = await c.req.json();

		if (!title || !code) {
			return c.json({ error: "title and code are required" }, 400);
		}

		const snippet: Snippet = {
			title,
			code,
			createdAt: new Date(),
		};

		const result = await snippetsCollection.insertOne(snippet);
		return c.json({
			success: true,
			id: result.insertedId.toString(),
		});
	} catch (error) {
		console.error("Error saving snippet:", error);
		return c.json({ error: "Failed to save snippet" }, 500);
	}
});

export default app;
