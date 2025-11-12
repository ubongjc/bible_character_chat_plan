import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client.js';
import { validateRequest, requestSchemas } from '../middleware/validation.js';

export const bookmarksRoutes: FastifyPluginAsync = async (fastify) => {
  // Get user bookmarks
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
    const { tags, limit = 50, offset = 0 } = request.query as {
      tags?: string;
      limit?: number;
      offset?: number;
    };

    let query = `
      SELECT b.*, m.text as message_text, m.citations,
        c.name as character_name, t.title as thread_title
      FROM bookmarks b
      JOIN messages m ON b.message_id = m.id
      LEFT JOIN characters c ON m.character_id = c.id
      LEFT JOIN threads t ON m.thread_id = t.id
      WHERE b.user_id = $1
    `;

    const params: any[] = [userId];
    let paramCount = 1;

    if (tags) {
      const tagArray = tags.split(',');
      paramCount++;
      query += ` AND b.tags && $${paramCount}`;
      params.push(tagArray);
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    return { bookmarks: result.rows };
  });

  // Create bookmark
  fastify.post('/', {
    preHandler: [
      async (request, reply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          reply.unauthorized('Invalid token');
        }
      },
      validateRequest(requestSchemas.createBookmark),
    ],
  }, async (request) => {
    const { userId } = request.user as { userId: string };
    const { messageId, note, tags, color } = request.body as {
      messageId: string;
      note?: string;
      tags?: string[];
      color?: string;
    };

    const result = await db.query(
      `INSERT INTO bookmarks (user_id, message_id, note, tags, color)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, message_id) DO UPDATE
       SET note = $3, tags = $4, color = $5
       RETURNING *`,
      [userId, messageId, note, tags || [], color || '#FCD34D']
    );

    return { bookmark: result.rows[0] };
  });

  // Update bookmark
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
    const { note, tags, color } = request.body as {
      note?: string;
      tags?: string[];
      color?: string;
    };

    // Verify ownership
    const ownerCheck = await db.query(
      'SELECT id FROM bookmarks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return reply.forbidden('Bookmark not found or unauthorized');
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (note !== undefined) {
      paramCount++;
      updates.push(`note = $${paramCount}`);
      values.push(note);
    }

    if (tags !== undefined) {
      paramCount++;
      updates.push(`tags = $${paramCount}`);
      values.push(tags);
    }

    if (color !== undefined) {
      paramCount++;
      updates.push(`color = $${paramCount}`);
      values.push(color);
    }

    if (updates.length === 0) {
      return reply.badRequest('No updates provided');
    }

    paramCount++;
    values.push(id);

    const result = await db.query(
      `UPDATE bookmarks SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return { bookmark: result.rows[0] };
  });

  // Delete bookmark
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
      'DELETE FROM bookmarks WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return reply.notFound('Bookmark not found');
    }

    return { deleted: true };
  });
};
