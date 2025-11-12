import pg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pg;

// Create PostgreSQL connection pool
export const pool = new Pool({
  connectionString: config.databaseUrl,
  min: config.databasePoolMin,
  max: config.databasePoolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Simple query wrapper with error handling
export const db = {
  async query(text: string, params?: any[]) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('database query error', { text, error });
      throw error;
    }
  },

  async raw(text: string) {
    return pool.query(text);
  },

  async getClient() {
    return pool.connect();
  },

  async destroy() {
    await pool.end();
  },
};

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});
