import { FastifyRequest, FastifyReply } from 'fastify';
import { z, ZodSchema } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Common validation schemas
export const schemas = {
  email: z.string().email().min(3).max(255),
  password: z.string().min(12).max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  uuid: z.string().uuid(),
  positiveInt: z.number().int().positive(),
  nonNegativeInt: z.number().int().min(0),
  url: z.string().url(),
  text: z.string().min(1).max(10000),
  shortText: z.string().min(1).max(500),
  translation: z.enum(['KJV', 'ASV', 'WEB', 'ESV', 'NIV', 'NASB']),
  locale: z.enum(['en', 'es', 'fr', 'de', 'pt', 'zh', 'ar', 'he']),
};

// Request validation schemas
export const requestSchemas = {
  register: z.object({
    email: schemas.email,
    password: schemas.password,
    locale: schemas.locale.optional(),
  }),

  login: z.object({
    email: schemas.email,
    password: z.string().min(1), // Don't validate on login, just check existence
  }),

  createThread: z.object({
    characterIds: z.array(schemas.uuid).min(1).max(10),
    title: schemas.shortText.optional(),
    storeTranscript: z.boolean().optional(),
  }),

  updateThread: z.object({
    starred: z.boolean().optional(),
    title: schemas.shortText.optional(),
    archived: z.boolean().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),

  sendMessage: z.object({
    threadId: schemas.uuid,
    characterId: schemas.uuid,
    text: schemas.text,
    language: schemas.locale.optional(),
  }),

  createBookmark: z.object({
    messageId: schemas.uuid,
    note: schemas.text.optional(),
  }),

  createReadingPlan: z.object({
    title: schemas.shortText,
    entries: z.array(z.object({
      book: z.string(),
      chapter: schemas.positiveInt,
      verseStart: schemas.positiveInt.optional(),
      verseEnd: schemas.positiveInt.optional(),
      day: schemas.positiveInt,
    })).min(1),
  }),

  sourceQuery: z.object({
    ref: z.string().min(1).max(100),
    translation: schemas.translation.optional(),
  }),

  searchSources: z.object({
    query: schemas.text,
    translation: schemas.translation.optional(),
    limit: schemas.positiveInt.max(100).optional(),
    books: z.array(z.string()).optional(),
  }),

  characterFilters: z.object({
    filter: z.string().optional(),
    sort: z.enum(['featured', 'name', 'era', 'influence', 'controversy']).optional(),
    search: z.string().max(100).optional(),
    limit: schemas.positiveInt.max(100).optional(),
    offset: schemas.nonNegativeInt.optional(),
  }),
};

// Sanitization functions
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [], // Strip all HTML
    ALLOWED_ATTR: [],
  });
}

export function sanitizeText(text: string): string {
  // Remove any potential XSS vectors
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

// Validation middleware factory
export function validateRequest(schema: ZodSchema) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Validate and sanitize request body
      if (request.body) {
        const sanitized = sanitizeObject(request.body);
        const validated = schema.parse(sanitized);
        request.body = validated;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      throw error;
    }
  };
}

// SQL injection prevention helpers
export function escapeIdentifier(identifier: string): string {
  return identifier.replace(/[^a-zA-Z0-9_]/g, '');
}

export function isValidSortField(field: string, allowedFields: string[]): boolean {
  return allowedFields.includes(field);
}

// Rate limiting helper
export function getUserIdentifier(request: FastifyRequest): string {
  const user = request.user as { userId?: string } | undefined;
  return user?.userId || request.ip;
}
