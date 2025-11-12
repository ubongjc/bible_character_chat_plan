import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client.js';

export const subscriptionsRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all available plans
  fastify.get('/plans', async () => {
    const result = await db.query(
      `SELECT id, name, display_name, description, price_monthly, price_yearly,
              features, limits, sort_order
       FROM subscription_plans
       WHERE is_active = true
       ORDER BY sort_order ASC`
    );

    return { plans: result.rows };
  });

  // Get user's current subscription
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
      `SELECT s.*, p.name as plan_name, p.display_name, p.features, p.limits
       FROM user_subscriptions s
       JOIN subscription_plans p ON s.plan_id = p.id
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Return free plan if no subscription
      const freePlan = await db.query(
        `SELECT id, name, display_name, features, limits
         FROM subscription_plans
         WHERE name = 'free'`
      );

      return {
        subscription: {
          plan_name: 'free',
          display_name: freePlan.rows[0]?.display_name || 'Free',
          status: 'active',
          features: freePlan.rows[0]?.features || {},
          limits: freePlan.rows[0]?.limits || {},
        },
      };
    }

    return { subscription: result.rows[0] };
  });

  // Create subscription (placeholder for Stripe integration)
  fastify.post('/subscribe', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request, reply) => {
    const { userId } = request.user as { userId: string };
    const { planId, billingCycle } = request.body as {
      planId: string;
      billingCycle: 'monthly' | 'yearly';
    };

    // Get plan details
    const planResult = await db.query(
      'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true',
      [planId]
    );

    if (planResult.rows.length === 0) {
      return reply.notFound('Plan not found');
    }

    const plan = planResult.rows[0];

    // In production, this would:
    // 1. Create Stripe customer if not exists
    // 2. Create Stripe subscription
    // 3. Handle payment
    // 4. Create user_subscription record

    // For now, create a placeholder subscription
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

    const result = await db.query(
      `INSERT INTO user_subscriptions (
        user_id, plan_id, status, billing_cycle,
        current_period_start, current_period_end
      ) VALUES ($1, $2, 'active', $3, $4, $5)
      RETURNING *`,
      [userId, planId, billingCycle, now, periodEnd]
    );

    // Update user plan
    await db.query(
      'UPDATE users SET plan = $1 WHERE id = $2',
      [plan.name, userId]
    );

    return {
      subscription: result.rows[0],
      message: 'Subscription created successfully (demo mode)',
      next_steps: 'In production, this would redirect to Stripe checkout',
    };
  });

  // Cancel subscription
  fastify.post('/cancel', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request) => {
    const { userId } = request.user as { userId: string };
    const { immediately } = request.body as { immediately?: boolean };

    const result = await db.query(
      `UPDATE user_subscriptions
       SET cancel_at_period_end = true,
           canceled_at = NOW(),
           status = CASE WHEN $2 = true THEN 'canceled' ELSE status END
       WHERE user_id = $1 AND status = 'active'
       RETURNING *`,
      [userId, immediately || false]
    );

    if (result.rows.length === 0) {
      return { error: 'No active subscription found' };
    }

    return {
      subscription: result.rows[0],
      message: immediately
        ? 'Subscription canceled immediately'
        : 'Subscription will be canceled at the end of the billing period',
    };
  });

  // Get payment history
  fastify.get('/payments', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request) => {
    const { userId } = request.user as { userId: string };
    const { limit = 20, offset = 0 } = request.query as {
      limit?: number;
      offset?: number;
    };

    const result = await db.query(
      `SELECT * FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return { payments: result.rows };
  });

  // Check feature access
  fastify.get('/check-access/:feature', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.unauthorized('Invalid token');
      }
    },
  }, async (request) => {
    const { userId } = request.user as { userId: string };
    const { feature } = request.params as { feature: string };

    const result = await db.query(
      `SELECT s.*, p.features, p.limits
       FROM user_subscriptions s
       JOIN subscription_plans p ON s.plan_id = p.id
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Free plan features
      const freeFeatures = {
        text_chat: true,
        voice_calls: false,
        group_panels: false,
        all_translations: false,
        reading_plans: false,
      };

      return {
        hasAccess: freeFeatures[feature as keyof typeof freeFeatures] || false,
        plan: 'free',
      };
    }

    const subscription = result.rows[0];
    const features = subscription.features || {};

    return {
      hasAccess: features[feature] === true,
      plan: subscription.plan_name,
      limits: subscription.limits || {},
    };
  });
};
