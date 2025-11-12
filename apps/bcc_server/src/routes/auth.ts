import { FastifyPluginAsync } from 'fastify';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import bcrypt from 'bcrypt';
import { db } from '../db/client.js';
import { config } from '../config/index.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register with email/password (fallback)
  fastify.post('/register', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      return reply.badRequest('Email and password are required');
    }

    try {
      const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return reply.conflict('User already exists');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const result = await db.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, locale, plan',
        [email, passwordHash]
      );

      const user = result.rows[0];
      const token = fastify.jwt.sign({ userId: user.id, email: user.email });

      return { user, token };
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Registration failed');
    }
  });

  // Login with email/password
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    // Auth bypass for testing
    if (config.authBypassEnabled && password === 'bypass') {
      let result = await db.query(
        'SELECT id, email, locale, plan FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        // Create test user
        result = await db.query(
          'INSERT INTO users (email) VALUES ($1) RETURNING id, email, locale, plan',
          [email]
        );
      }

      const user = result.rows[0];
      await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
      const token = fastify.jwt.sign({ userId: user.id, email: user.email });

      return { user, token, testMode: true };
    }

    if (!email || !password) {
      return reply.badRequest('Email and password are required');
    }

    try {
      const result = await db.query(
        'SELECT id, email, password_hash, locale, plan FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return reply.unauthorized('Invalid credentials');
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return reply.unauthorized('Invalid credentials');
      }

      await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

      const token = fastify.jwt.sign({ userId: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          locale: user.locale,
          plan: user.plan,
        },
        token,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Login failed');
    }
  });

  // Generate passkey registration options
  fastify.post('/passkeys/register-options', async (request, reply) => {
    const { email } = request.body as { email: string };

    if (!email) {
      return reply.badRequest('Email is required');
    }

    try {
      let result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      let userId: string;

      if (result.rows.length === 0) {
        // Create user if doesn't exist
        result = await db.query(
          'INSERT INTO users (email) VALUES ($1) RETURNING id',
          [email]
        );
        userId = result.rows[0].id;
      } else {
        userId = result.rows[0].id;
      }

      const options = await generateRegistrationOptions({
        rpName: config.rpName,
        rpID: config.rpId,
        userID: userId,
        userName: email,
        attestationType: 'none',
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
          authenticatorAttachment: 'platform',
        },
      });

      // Store challenge in Redis with 5 minute expiry
      await fastify.redis.setex(
        `passkey:challenge:${userId}`,
        300,
        options.challenge
      );

      return options;
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to generate registration options');
    }
  });

  // Verify passkey registration
  fastify.post('/passkeys/register-verify', async (request, reply) => {
    const { email, credential } = request.body as { email: string; credential: any };

    try {
      const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return reply.badRequest('User not found');
      }

      const userId = result.rows[0].id;
      const expectedChallenge = await fastify.redis.get(`passkey:challenge:${userId}`);

      if (!expectedChallenge) {
        return reply.badRequest('Challenge expired or not found');
      }

      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge,
        expectedOrigin: config.rpOrigin,
        expectedRPID: config.rpId,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return reply.unauthorized('Verification failed');
      }

      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

      await db.query(
        `INSERT INTO webauthn_credentials (user_id, credential_id, public_key, counter)
         VALUES ($1, $2, $3, $4)`,
        [userId, Buffer.from(credentialID).toString('base64'), Buffer.from(credentialPublicKey).toString('base64'), counter]
      );

      await fastify.redis.del(`passkey:challenge:${userId}`);

      const token = fastify.jwt.sign({ userId, email });

      return { verified: true, token };
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Registration verification failed');
    }
  });

  // Get current user
  fastify.get('/me', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request) => {
    const { userId } = request.user as { userId: string };

    const result = await db.query(
      'SELECT id, email, locale, plan, settings, favorites FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return { error: 'User not found' };
    }

    return { user: result.rows[0] };
  });
};
