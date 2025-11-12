import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client.js';

export const threadsRoutes: FastifyPluginAsync = async (fastify) => {
  // Create new thread
  fastify.post('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request) => {
    const { userId } = request.user as { userId: string };
    const { characterIds, title, storeTranscript = true } = request.body as {
      characterIds: string[];
      title?: string;
      storeTranscript?: boolean;
    };

    const result = await db.query(
      `INSERT INTO threads (user_id, character_ids, title, store_transcript)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, characterIds, title, storeTranscript]
    );

    return { thread: result.rows[0] };
  });

  // Get user threads
  fastify.get('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request) => {
    const { userId } = request.user as { userId: string };
    const { archived = false, limit = 50, offset = 0 } = request.query as {
      archived?: boolean;
      limit?: number;
      offset?: number;
    };

    const result = await db.query(
      `SELECT t.*,
        (SELECT json_agg(c.*) FROM characters c WHERE c.id = ANY(t.character_ids)) as characters,
        (SELECT COUNT(*) FROM messages WHERE thread_id = t.id) as message_count
       FROM threads t
       WHERE t.user_id = $1 AND t.archived = $2
       ORDER BY t.updated_at DESC
       LIMIT $3 OFFSET $4`,
      [userId, archived, limit, offset]
    );

    return { threads: result.rows };
  });

  // Get single thread with messages
  fastify.get('/:id', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request, reply) => {
    const { userId } = request.user as { userId: string };
    const { id } = request.params as { id: string };

    const threadResult = await db.query(
      `SELECT t.*,
        (SELECT json_agg(c.*) FROM characters c WHERE c.id = ANY(t.character_ids)) as characters
       FROM threads t
       WHERE t.id = $1 AND t.user_id = $2`,
      [id, userId]
    );

    if (threadResult.rows.length === 0) {
      return reply.notFound('Thread not found');
    }

    const messagesResult = await db.query(
      `SELECT m.*, c.name as character_name
       FROM messages m
       LEFT JOIN characters c ON m.character_id = c.id
       WHERE m.thread_id = $1
       ORDER BY m.created_at ASC`,
      [id]
    );

    return {
      thread: threadResult.rows[0],
      messages: messagesResult.rows,
    };
  });

  // Update thread (star, title, archive)
  fastify.patch('/:id', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request, reply) => {
    const { userId } = request.user as { userId: string };
    const { id } = request.params as { id: string };
    const updates = request.body as {
      starred?: boolean;
      title?: string;
      archived?: boolean;
    };

    // Verify ownership
    const ownerCheck = await db.query(
      'SELECT id FROM threads WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return reply.forbidden('Not authorized to update this thread');
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (updates.starred !== undefined) {
      paramCount++;
      setClauses.push(`starred = $${paramCount}`);
      values.push(updates.starred);
    }

    if (updates.title !== undefined) {
      paramCount++;
      setClauses.push(`title = $${paramCount}`);
      values.push(updates.title);
    }

    if (updates.archived !== undefined) {
      paramCount++;
      setClauses.push(`archived = $${paramCount}`);
      values.push(updates.archived);
    }

    if (setClauses.length === 0) {
      return reply.badRequest('No updates provided');
    }

    paramCount++;
    values.push(id);

    const result = await db.query(
      `UPDATE threads SET ${setClauses.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return { thread: result.rows[0] };
  });

  // Delete thread
  fastify.delete('/:id', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request, reply) => {
    const { userId } = request.user as { userId: string };
    const { id } = request.params as { id: string };

    const result = await db.query(
      'DELETE FROM threads WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return reply.notFound('Thread not found');
    }

    return { deleted: true };
  });
};
