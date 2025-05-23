import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import projectsRoutes from './routes/projects';
import adminRoutes from './routes/admin';
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

// 项目API路由
api.route('/projects', projectsRoutes);
api.route('/admin', adminRoutes);
// Start the server
const port = Number(process.env.PORT) || 3001;
console.log(`Server is running on port ${port}`);

serve({ fetch: app.fetch, port });

export default {
  port,
  fetch: app.fetch,
};
