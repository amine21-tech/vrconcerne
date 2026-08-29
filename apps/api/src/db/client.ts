import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env, isProduction } from '../env.js';

/** Connexion unique, partagee par tout le processus. */
export const sqlClient = postgres(env.DATABASE_URL, {
  max: isProduction ? 12 : 4,
  idle_timeout: 30,
  connect_timeout: 10,
  onnotice: () => {},
});

export const db = drizzle(sqlClient);

export type Database = typeof db;

export async function closeDatabase(): Promise<void> {
  await sqlClient.end({ timeout: 5 });
}

/** Verifie que la base repond. */
export async function checkDatabase(): Promise<{ version: string }> {
  const rows = await sqlClient<{ version: string }[]>`SELECT version() AS version`;
  return { version: rows[0]?.version ?? 'inconnue' };
}
