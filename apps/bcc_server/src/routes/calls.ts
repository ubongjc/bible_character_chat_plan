import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client.js';

export const callsRoutes: FastifyPluginAsync = async (fastify) => {
  // Start voice call
  fastify.post('/start', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request) => {
    const { userId } = request.user as { userId: string };
    const { characterId, panelId } = request.body as {
      characterId?: string;
      panelId?: string;
    };

    if (!characterId && !panelId) {
      return { error: 'Either characterId or panelId is required' };
    }

    // Create call session
    const result = await db.query(
      `INSERT INTO call_sessions (user_id, character_id, panel_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, characterId || null, panelId || null]
    );

    const session = result.rows[0];

    // In a real implementation, this would:
    // 1. Set up WebRTC SFU connection
    // 2. Initialize STT/TTS streams
    // 3. Return connection details

    return {
      session,
      // Placeholder for WebRTC connection details
      connectionInfo: {
        sessionId: session.id,
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
        ],
      },
    };
  });

  // Stop voice call
  fastify.post('/stop', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request, reply) => {
    const { userId } = request.user as { userId: string };
    const { sessionId } = request.body as { sessionId: string };

    // Verify ownership
    const sessionCheck = await db.query(
      'SELECT id FROM call_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (sessionCheck.rows.length === 0) {
      return reply.forbidden('Session not found or unauthorized');
    }

    await db.query(
      'UPDATE call_sessions SET end_time = NOW() WHERE id = $1',
      [sessionId]
    );

    return { success: true };
  });

  // Get call history
  fastify.get('/history', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request) => {
    const { userId } = request.user as { userId: string };
    const { limit = 50, offset = 0 } = request.query as {
      limit?: number;
      offset?: number;
    };

    const result = await db.query(
      `SELECT cs.*, c.name as character_name
       FROM call_sessions cs
       LEFT JOIN characters c ON cs.character_id = c.id
       WHERE cs.user_id = $1
       ORDER BY cs.start_time DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return { sessions: result.rows };
  });
};
