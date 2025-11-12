import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import websocket from '@fastify/websocket';
import jwt from '@fastify/jwt';
import { config } from './config/index.js';
import { db } from './db/client.js';
import { redis } from './db/redis.js';
import { securityHeaders, requestId } from './middleware/security.js';
import { authRoutes } from './routes/auth.js';
import { charactersRoutes } from './routes/characters.js';
import { threadsRoutes } from './routes/threads.js';
import { chatRoutes } from './routes/chat.js';
import { callsRoutes } from './routes/calls.js';
import { sourcesRoutes } from './routes/sources.js';
import { adminRoutes } from './routes/admin.js';
import { bookmarksRoutes } from './routes/bookmarks.js';
import { subscriptionsRoutes } from './routes/subscriptions.js';

const fastify = Fastify({
  logger: {
    level: config.logLevel,
  },
});

async function start() {
  try {
    // Security middleware
    fastify.addHook('onRequest', securityHeaders);
    fastify.addHook('onRequest', requestId);

    // Register plugins
    await fastify.register(cookie, {
      secret: config.jwtSecret,
      parseOptions: {},
    });

    await fastify.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://api.openai.com'],
        },
      },
    });

    await fastify.register(cors, {
      origin: config.corsOrigin,
      credentials: true,
    });

    await fastify.register(rateLimit, {
      max: config.rateLimitMax,
      timeWindow: config.rateLimitWindow,
      redis: redis,
    });

    await fastify.register(sensible);
    await fastify.register(websocket);

    await fastify.register(jwt, {
      secret: config.jwtSecret,
    });

    // Swagger/OpenAPI documentation
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Bible Character Chat API',
          description: 'API for conversing with Scripture-grounded personas',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://${config.host}:${config.port}`,
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [{ bearerAuth: [] }],
      },
    });

    await fastify.register(swaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
    });

    // Health check
    fastify.get('/health', async () => {
      const dbHealth = await db.raw('SELECT 1');
      const redisHealth = await redis.ping();
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbHealth ? 'connected' : 'disconnected',
        redis: redisHealth === 'PONG' ? 'connected' : 'disconnected',
      };
    });

    // Register routes
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(charactersRoutes, { prefix: '/api/characters' });
    await fastify.register(threadsRoutes, { prefix: '/api/threads' });
    await fastify.register(chatRoutes, { prefix: '/api/chat' });
    await fastify.register(callsRoutes, { prefix: '/api/calls' });
    await fastify.register(sourcesRoutes, { prefix: '/api/sources' });
    await fastify.register(bookmarksRoutes, { prefix: '/api/bookmarks' });
    await fastify.register(subscriptionsRoutes, { prefix: '/api/subscriptions' });
    await fastify.register(adminRoutes, { prefix: '/api/admin' });

    // Start server
    await fastify.listen({ port: config.port, host: config.host });
    console.log(`🚀 Server running at http://${config.host}:${config.port}`);
    console.log(`📚 API docs at http://${config.host}:${config.port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    try {
      await fastify.close();
      await db.destroy();
      await redis.quit();
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
});

start();
