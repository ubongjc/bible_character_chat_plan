import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/bcc_dev',
  databasePoolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
  databasePoolMax: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',

  // WebAuthn
  rpName: process.env.RP_NAME || 'Bible Character Chat',
  rpId: process.env.RP_ID || 'localhost',
  rpOrigin: process.env.RP_ORIGIN || 'http://localhost:3000',

  // Auth
  authBypassEnabled: process.env.AUTH_BYPASS_ENABLED === 'true',

  // Rate limiting
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Storage
  s3Endpoint: process.env.S3_ENDPOINT || '',
  s3Bucket: process.env.S3_BUCKET || '',
  s3AccessKey: process.env.S3_ACCESS_KEY || '',
  s3SecretKey: process.env.S3_SECRET_KEY || '',
  s3Region: process.env.S3_REGION || 'us-east-1',

  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY || 'change-me-in-production-32-bytes',

  // Observability
  sentryDsn: process.env.SENTRY_DSN || '',
  otelEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '',
} as const;

// Validate required config in production
if (config.nodeEnv === 'production') {
  const required = [
    'jwtSecret',
    'openaiApiKey',
    'databaseUrl',
    'encryptionKey',
  ];

  for (const key of required) {
    if (!config[key as keyof typeof config] ||
        config[key as keyof typeof config] === 'change-me-in-production' ||
        config[key as keyof typeof config] === 'change-me-in-production-32-bytes') {
      throw new Error(`Missing required config: ${key}`);
    }
  }
}
