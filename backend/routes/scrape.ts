import { Hono } from "hono";

const app = new Hono();

app.post("/", async (c) => {
	try {
		const { url } = await c.req.json();

		if (!url) {
			return c.json({ error: "URL is required" }, 400);
		}

		// Mock for development
		return c.json({
			content: `Mock scraped content from ${url}. This would be extracted by Python script with BeautifulSoup and saved to AWS S3.`,
			s3_url: "s3://kastor-scraped-content/mock-file.txt",
		});
	} catch (error) {
		console.error("Error scraping URL:", error);
		return c.json({ error: "Failed to scrape URL" }, 500);
	}
});
 
export default app;