import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client.js';

export const charactersRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all characters with filters and sorting
  fastify.get('/', async (request) => {
    const {
      filter,
      sort = 'featured',
      search,
      limit = 100,
      offset = 0,
    } = request.query as {
      filter?: string;
      sort?: string;
      search?: string;
      limit?: number;
      offset?: number;
    };

    let query = 'SELECT * FROM characters WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    // Apply filters
    if (filter) {
      const filters = filter.split('&');
      for (const f of filters) {
        const [key, value] = f.split(':');
        if (key === 'role') {
          paramCount++;
          query += ` AND $${paramCount} = ANY(roles)`;
          params.push(value);
        } else if (key === 'type') {
          paramCount++;
          query += ` AND type = $${paramCount}`;
          params.push(value);
        } else if (key === 'alignment') {
          paramCount++;
          query += ` AND alignment = $${paramCount}`;
          params.push(value);
        } else if (key === 'book') {
          paramCount++;
          query += ` AND $${paramCount} = ANY(books)`;
          params.push(value);
        } else if (key === 'era') {
          paramCount++;
          query += ` AND era = $${paramCount}`;
          params.push(value);
        }
      }
    }

    // Apply search
    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Apply sorting
    if (sort === 'featured') {
      query += ' ORDER BY is_featured DESC, featured_order ASC, name ASC';
    } else if (sort === 'name') {
      query += ' ORDER BY name ASC';
    } else if (sort === 'era') {
      query += ' ORDER BY era ASC';
    } else if (sort === 'influence') {
      query += ' ORDER BY influence_score DESC';
    } else if (sort === 'controversy') {
      query += ' ORDER BY controversy_level DESC';
    }

    // Apply pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await db.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM characters WHERE 1=1';
    const countParams: any[] = [];
    let countParamCount = 0;

    if (filter) {
      const filters = filter.split('&');
      for (const f of filters) {
        const [key, value] = f.split(':');
        if (key === 'role') {
          countParamCount++;
          countQuery += ` AND $${countParamCount} = ANY(roles)`;
          countParams.push(value);
        } else if (key === 'type') {
          countParamCount++;
          countQuery += ` AND type = $${countParamCount}`;
          countParams.push(value);
        } else if (key === 'alignment') {
          countParamCount++;
          countQuery += ` AND alignment = $${countParamCount}`;
          countParams.push(value);
        }
      }
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (name ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count, 10);

    return {
      characters: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  });

  // Get single character by ID
  fastify.get('/:id', async (request) => {
    const { id } = request.params as { id: string };

    const result = await db.query(
      `SELECT c.*, p.* FROM characters c
       LEFT JOIN policies p ON c.policy_id = p.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return { error: 'Character not found' };
    }

    // Get relationships
    const relationships = await db.query(
      `SELECT r.*, c.name as related_character_name
       FROM relationships r
       JOIN characters c ON r.dst_character_id = c.id
       WHERE r.src_character_id = $1`,
      [id]
    );

    return {
      character: result.rows[0],
      relationships: relationships.rows,
    };
  });

  // Get featured characters
  fastify.get('/featured/list', async () => {
    const result = await db.query(
      'SELECT * FROM characters WHERE is_featured = true ORDER BY featured_order ASC'
    );

    return { characters: result.rows };
  });
};
