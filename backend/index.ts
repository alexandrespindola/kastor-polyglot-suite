import { Hono } from "hono";
import { cors } from "hono/cors";
import snippetsRouter from "./routes/snippets"

const app = new Hono();

// Middleware CORS
app.use(
	"*",
	cors({
		origin: ["http://localhost:5173", "http://localhost:3000"],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
	}),
);

// Health check
app.get("/health", (c) => {
	return c.json({
		status: "OK",
		timestamp: new Date().toISOString,
		message: "Kastor Polyglot Suite API Gateway",
	});
});

// Routes
app.route("/api/snippets", snippetsRouter)

// Test route
app.get("/api/test", (c) => {
	return c.json({
		message: "API Gateway is working!",
		tech: "Hono + Bun + MongoDB",
	});
});

// Start server
const port = Number(process.env.PORT) || 3001;

console.log(`🚀 API Gateway starting on port ${port}...`);

export default {
    port,
    fetch: app.fetch
}