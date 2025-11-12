import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import crypto from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'bcc_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

// Generate a secure random token
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

// CSRF protection plugin
export async function csrfPlugin(fastify: FastifyInstance) {
  // Add CSRF token to request context
  fastify.decorateRequest('csrfToken', null);

  // Generate and set CSRF token for GET requests
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.method === 'GET') {
      const token = generateCsrfToken();
      (request as any).csrfToken = token;

      reply.setCookie(CSRF_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 3600, // 1 hour
      });
    }
  });

  // Verify CSRF token for state-changing requests
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip CSRF check for:
    // 1. GET, HEAD, OPTIONS (safe methods)
    // 2. Development mode with bypass enabled
    // 3. Webhook endpoints
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    const skipPaths = ['/api/webhooks/', '/health'];

    if (
      safeMethods.includes(request.method) ||
      skipPaths.some(path => request.url.startsWith(path))
    ) {
      return;
    }

    // Development bypass
    if (process.env.NODE_ENV === 'development' && process.env.CSRF_BYPASS === 'true') {
      return;
    }

    // Extract token from header
    const headerToken = request.headers[CSRF_HEADER_NAME] as string;

    // Extract token from cookie
    const cookieToken = request.cookies[CSRF_COOKIE_NAME];

    // Validate tokens exist
    if (!headerToken || !cookieToken) {
      return reply.status(403).send({
        error: 'CSRF token missing',
        code: 'CSRF_TOKEN_MISSING',
      });
    }

    // Validate tokens match
    if (headerToken !== cookieToken) {
      return reply.status(403).send({
        error: 'CSRF token invalid',
        code: 'CSRF_TOKEN_INVALID',
      });
    }

    // Token is valid, continue
  });
}

// Middleware to verify CSRF token
export async function verifyCsrfToken(request: FastifyRequest, reply: FastifyReply) {
  const headerToken = request.headers[CSRF_HEADER_NAME] as string;
  const cookieToken = request.cookies[CSRF_COOKIE_NAME];

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return reply.status(403).send({
      error: 'CSRF token validation failed',
    });
  }
}

// Get CSRF token endpoint
export async function getCsrfToken(request: FastifyRequest, reply: FastifyReply) {
  const token = (request as any).csrfToken || generateCsrfToken();

  reply.setCookie(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600,
  });

  return { csrfToken: token };
}
