import type { FastifyPluginAsync } from 'fastify';
import { checkDatabase } from '../db/client.js';
import { noStore } from '../lib/http.js';

const startedAt = Date.now();

const routes: FastifyPluginAsync = async (app) => {
  app.get('/health', async (_req, reply) => {
    noStore(reply);
    return { ok: true, service: 'vrc-api', uptimeS: Math.round((Date.now() - startedAt) / 1000) };
  });

  app.get('/health/full', async (_req, reply) => {
    noStore(reply);
    try {
      const { version } = await checkDatabase();
      return { ok: true, database: version };
    } catch (error) {
      return reply.code(503).send({ ok: false, error: (error as Error).message });
    }
  });
};

export default routes;
