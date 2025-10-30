import { Hono } from 'hono';

const app = new Hono();

app.post('/', async (c) => {
  try {
    const { urls } = await c.req.json();
    
    if (!urls) {
      return c.json({ error: 'URLs are required' }, 400);
    }
    
    // Mock to development
    const urlList = urls.split('\n').filter((u: string) => u.trim());
    const mockResults = urlList.map((url: string) => ({
      url: url.trim(),
      status: 200,
      statusText: 'OK (Mock)'
    }));
    
    return c.json({ results: mockResults });
  } catch (error) {
    console.error('Error monitoring URLs:', error);
    return c.json({ error: 'Failed to monitor URLs' }, 500);
  }
});

export default app;