import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

const app = new Hono();
const api = app.basePath('/api');

// Middlewares
app.use('*', logger());
app.use('*', cors());

// Routes
api.get('/hello', (c) => {
  return c.json({
    message: 'Welcome to Shizhengyeji Backend!',
    status: 'ok',
  });
});

// Start the server
const port = Number(process.env.PORT) || 3001;
console.log(`Server is running on port ${port}`);

serve({ fetch: app.fetch, port });

export default {
  port,
  fetch: app.fetch,
};
