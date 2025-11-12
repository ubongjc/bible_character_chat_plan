import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client.js';

export const sourcesRoutes: FastifyPluginAsync = async (fastify) => {
  // Get source by reference
  fastify.get('/', async (request) => {
    const { ref, translation = 'KJV' } = request.query as {
      ref: string;
      translation?: string;
    };

    if (!ref) {
      return { error: 'Reference is required' };
    }

    const result = await db.query(
      'SELECT * FROM sources WHERE ref = $1 AND translation = $2',
      [ref, translation]
    );

    if (result.rows.length === 0) {
      return { error: 'Source not found' };
    }

    return { source: result.rows[0] };
  });

  // Search sources (semantic search with pgvector)
  fastify.post('/search', async (request) => {
    const {
      query,
      translation = 'KJV',
      limit = 10,
      books,
    } = request.body as {
      query: string;
      translation?: string;
      limit?: number;
      books?: string[];
    };

    // In a real implementation, this would:
    // 1. Generate embedding for the query using OpenAI
    // 2. Perform vector similarity search
    // 3. Rerank results

    // Placeholder: Simple text search
    let sql = `
      SELECT s.*,
        ts_rank(to_tsvector('english', s.text), plainto_tsquery('english', $1)) as rank
      FROM sources s
      WHERE to_tsvector('english', s.text) @@ plainto_tsquery('english', $1)
        AND s.translation = $2
    `;

    const params: any[] = [query, translation];
    let paramCount = 2;

    if (books && books.length > 0) {
      paramCount++;
      sql += ` AND s.book = ANY($${paramCount})`;
      params.push(books);
    }

    sql += ` ORDER BY rank DESC LIMIT $${paramCount + 1}`;
    params.push(limit);

    const result = await db.query(sql, params);

    return { results: result.rows };
  });

  // Get cross-references for a verse
  fastify.get('/cross-references', async (request) => {
    const { ref } = request.query as { ref: string };

    if (!ref) {
      return { error: 'Reference is required' };
    }

    // This would query cross-reference data
    // Placeholder implementation
    const result = await db.query(
      `SELECT * FROM sources
       WHERE type = 'cross_reference' AND metadata->>'source_ref' = $1`,
      [ref]
    );

    return { crossReferences: result.rows };
  });

  // Get available translations
  fastify.get('/translations', async () => {
    const result = await db.query(
      `SELECT DISTINCT translation, license
       FROM sources
       ORDER BY translation`
    );

    return { translations: result.rows };
  });
};
