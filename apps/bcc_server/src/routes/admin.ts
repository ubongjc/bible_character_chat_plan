import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client.js';

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // Middleware to check admin privileges
  const requireAdmin = async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
      const { userId } = request.user;

      const result = await db.query(
        'SELECT plan FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0 || result.rows[0].plan !== 'admin') {
        return reply.forbidden('Admin access required');
      }
    } catch (err) {
      return reply.unauthorized('Invalid token');
    }
  };

  // Ingest content (verses, commentaries)
  fastify.post('/content/ingest', {
    preHandler: requireAdmin,
  }, async (request) => {
    const { sources } = request.body as { sources: any[] };

    if (!sources || !Array.isArray(sources)) {
      return { error: 'Sources array is required' };
    }

    const inserted: string[] = [];

    for (const source of sources) {
      const result = await db.query(
        `INSERT INTO sources (type, ref, text, translation, book, chapter, verse_start, verse_end, license, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (ref, translation) DO NOTHING
         RETURNING id`,
        [
          source.type,
          source.ref,
          source.text,
          source.translation || 'KJV',
          source.book,
          source.chapter,
          source.verseStart,
          source.verseEnd,
          source.license || 'Public Domain',
          JSON.stringify(source.metadata || {}),
        ]
      );

      if (result.rows.length > 0) {
        inserted.push(result.rows[0].id);
      }
    }

    return {
      success: true,
      insertedCount: inserted.length,
      ids: inserted,
    };
  });

  // Update character policy
  fastify.post('/policies/:characterId', {
    preHandler: requireAdmin,
  }, async (request) => {
    const { characterId } = request.params as { characterId: string };
    const {
      canSay,
      mustCite,
      cannotSay,
      style,
      disclaimer,
      enableDeceptionFlags,
      enableCounterVoice,
    } = request.body as {
      canSay?: string[];
      mustCite?: string[];
      cannotSay?: string[];
      style?: any;
      disclaimer?: string;
      enableDeceptionFlags?: boolean;
      enableCounterVoice?: boolean;
    };

    const result = await db.query(
      `INSERT INTO policies (
        character_id, can_say, must_cite, cannot_say, style,
        disclaimer, enable_deception_flags, enable_counter_voice
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (character_id) DO UPDATE SET
        can_say = COALESCE($2, policies.can_say),
        must_cite = COALESCE($3, policies.must_cite),
        cannot_say = COALESCE($4, policies.cannot_say),
        style = COALESCE($5, policies.style),
        disclaimer = COALESCE($6, policies.disclaimer),
        enable_deception_flags = COALESCE($7, policies.enable_deception_flags),
        enable_counter_voice = COALESCE($8, policies.enable_counter_voice),
        updated_at = NOW()
      RETURNING *`,
      [
        characterId,
        canSay,
        mustCite,
        cannotSay,
        style ? JSON.stringify(style) : null,
        disclaimer,
        enableDeceptionFlags,
        enableCounterVoice,
      ]
    );

    return { policy: result.rows[0] };
  });

  // Run red team test
  fastify.post('/redteam/run', {
    preHandler: requireAdmin,
  }, async (request) => {
    const { characterId, testCases } = request.body as {
      characterId: string;
      testCases: Array<{ prompt: string; expectedBehavior: string }>;
    };

    // Placeholder for red team testing
    // In production, this would run test prompts and log results

    return {
      success: true,
      message: 'Red team tests queued',
      characterId,
      testCount: testCases.length,
    };
  });

  // Get system stats
  fastify.get('/stats', {
    preHandler: requireAdmin,
  }, async () => {
    const [
      usersCount,
      charactersCount,
      threadsCount,
      messagesCount,
      callsCount,
    ] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users'),
      db.query('SELECT COUNT(*) FROM characters'),
      db.query('SELECT COUNT(*) FROM threads'),
      db.query('SELECT COUNT(*) FROM messages'),
      db.query('SELECT COUNT(*) FROM call_sessions'),
    ]);

    return {
      users: parseInt(usersCount.rows[0].count, 10),
      characters: parseInt(charactersCount.rows[0].count, 10),
      threads: parseInt(threadsCount.rows[0].count, 10),
      messages: parseInt(messagesCount.rows[0].count, 10),
      calls: parseInt(callsCount.rows[0].count, 10),
    };
  });
};
