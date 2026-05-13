import { Pool, PoolConfig } from 'pg';

// Configure the connection for Cloud SQL
// For Cloud SQL Postgres, you typically provide a DATABASE_URL 
// or set individual properties (host, user, password, database, port).
// When deploying to Cloud Run, you might connect via a Unix socket if using the Cloud SQL Auth Proxy.

const poolConfig: PoolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // For Cloud Run using Cloud SQL Unix sockets, host would be the socket path:
      // host: '/cloudsql/' + process.env.INSTANCE_CONNECTION_NAME
    };

export const db = new Pool(poolConfig);

// Example of a generic query helper
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await db.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}
