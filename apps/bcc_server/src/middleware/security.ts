import { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';

// Generate Content Security Policy nonce
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

// Enhanced security headers
export async function securityHeaders(request: FastifyRequest, reply: FastifyReply) {
  const nonce = generateNonce();
  (request as any).nonce = nonce;

  // Strict Content Security Policy
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`, // Tailwind requires unsafe-inline
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.openai.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  reply.header('Content-Security-Policy', csp);

  // Additional security headers
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  if (process.env.NODE_ENV === 'production') {
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
}

// Request ID for tracing
export async function requestId(request: FastifyRequest, reply: FastifyReply) {
  const id = crypto.randomUUID();
  (request as any).id = id;
  reply.header('X-Request-ID', id);
}

// Sensitive data redaction for logs
export function redactSensitiveData(obj: any): any {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'apiKey',
    'api_key',
    'authorization',
    'cookie',
    'credit_card',
    'creditCard',
    'ssn',
  ];

  if (typeof obj === 'string') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  if (obj && typeof obj === 'object') {
    const redacted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
          redacted[key] = '[REDACTED]';
        } else {
          redacted[key] = redactSensitiveData(obj[key]);
        }
      }
    }
    return redacted;
  }

  return obj;
}

// IP rate limiting helper
export function getClientIp(request: FastifyRequest): string {
  // Check for proxy headers
  const forwarded = request.headers['x-forwarded-for'];
  if (forwarded) {
    return (forwarded as string).split(',')[0].trim();
  }

  const realIp = request.headers['x-real-ip'];
  if (realIp) {
    return realIp as string;
  }

  return request.ip;
}

// Check if request is from allowed origin
export function isAllowedOrigin(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) return false;

  return allowedOrigins.some(allowed => {
    if (allowed === '*') return true;
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      return origin.endsWith(domain);
    }
    return origin === allowed;
  });
}

// Password strength validator
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  else feedback.push('Password should be at least 12 characters');

  // Complexity checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[^A-Za-z0-9]/.test(password)) score += 2;
  else feedback.push('Add special characters');

  // Common patterns check
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /^111111/,
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    score = Math.max(0, score - 3);
    feedback.push('Avoid common patterns');
  }

  // Repetition check
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Avoid repeating characters');
  }

  return {
    isValid: score >= 5,
    score: Math.min(10, Math.max(0, score)),
    feedback,
  };
}

// Session timeout check
export function isSessionExpired(lastActivity: Date, timeoutMinutes: number = 30): boolean {
  const now = new Date();
  const diff = now.getTime() - lastActivity.getTime();
  const minutes = diff / (1000 * 60);
  return minutes > timeoutMinutes;
}

// Generate secure random string
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Hash sensitive data for storage
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Constant-time comparison to prevent timing attacks
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(a, 'utf8'),
    Buffer.from(b, 'utf8')
  );
}
