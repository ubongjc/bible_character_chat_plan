import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client.js';
import { generateResponse, validateCitations } from '../services/chat.js';

export const chatRoutes: FastifyPluginAsync = async (fastify) => {
  // Send message and get streaming response
  fastify.post('/ask', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request, reply) => {
    const { userId } = request.user as { userId: string };
    const {
      threadId,
      characterId,
      text,
      language = 'en',
    } = request.body as {
      threadId: string;
      characterId: string;
      text: string;
      language?: string;
    };

    // Verify thread ownership
    const threadCheck = await db.query(
      'SELECT id, character_ids FROM threads WHERE id = $1 AND user_id = $2',
      [threadId, userId]
    );

    if (threadCheck.rows.length === 0) {
      return reply.forbidden('Thread not found or unauthorized');
    }

    // Verify character is in thread
    const thread = threadCheck.rows[0];
    if (!thread.character_ids.includes(characterId)) {
      return reply.badRequest('Character not in this thread');
    }

    // Get character and policy
    const characterResult = await db.query(
      `SELECT c.*, p.*
       FROM characters c
       LEFT JOIN policies p ON c.policy_id = p.id
       WHERE c.id = $1`,
      [characterId]
    );

    if (characterResult.rows.length === 0) {
      return reply.notFound('Character not found');
    }

    const character = characterResult.rows[0];

    // Save user message
    await db.query(
      `INSERT INTO messages (thread_id, role, text, language)
       VALUES ($1, 'user', $2, $3)`,
      [threadId, text, language]
    );

    // Set up SSE streaming
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    try {
      let fullResponse = '';
      let citations: string[] = [];

      // Generate streaming response
      const stream = await generateResponse({
        character,
        userMessage: text,
        threadId,
        language,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content') {
          fullResponse += chunk.content;
          reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
        } else if (chunk.type === 'citation') {
          citations.push(chunk.citation);
          reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
        } else if (chunk.type === 'flag') {
          // Deception or content warning flags
          reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
      }

      // Validate citations
      const validationResult = await validateCitations(fullResponse, citations);

      // Determine flags
      const flags: any = {};
      if (character.alignment === 'antagonist' && character.enable_deception_flags) {
        flags.deceptionRisk = validationResult.deceptionRisk || false;
      }

      // Save character response
      const messageResult = await db.query(
        `INSERT INTO messages (thread_id, character_id, role, text, language, citations, flags)
         VALUES ($1, $2, 'character', $3, $4, $5, $6)
         RETURNING id`,
        [threadId, characterId, fullResponse, language, citations, JSON.stringify(flags)]
      );

      // Send completion event
      reply.raw.write(`data: ${JSON.stringify({
        type: 'complete',
        messageId: messageResult.rows[0].id,
        flags,
      })}\n\n`);

      reply.raw.end();
    } catch (error) {
      fastify.log.error('Chat error:', error);
      reply.raw.write(`data: ${JSON.stringify({
        type: 'error',
        error: 'Failed to generate response',
      })}\n\n`);
      reply.raw.end();
    }
  });

  // Add reaction to message
  fastify.post('/messages/:messageId/react', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request, reply) => {
    const { userId } = request.user as { userId: string };
    const { messageId } = request.params as { messageId: string };
    const { emoji } = request.body as { emoji: string };

    // Verify message ownership
    const messageCheck = await db.query(
      `SELECT m.id FROM messages m
       JOIN threads t ON m.thread_id = t.id
       WHERE m.id = $1 AND t.user_id = $2`,
      [messageId, userId]
    );

    if (messageCheck.rows.length === 0) {
      return reply.forbidden('Message not found or unauthorized');
    }

    await db.query(
      `UPDATE messages
       SET reactions = jsonb_set(
         COALESCE(reactions, '{}'::jsonb),
         '{${emoji}}',
         'true'
       )
       WHERE id = $1`,
      [messageId]
    );

    return { success: true };
  });
};
