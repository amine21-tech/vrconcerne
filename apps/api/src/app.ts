import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance } from 'fastify';
import { env, isProduction } from './env.js';
import auth from './plugins/auth.js';
import errors from './plugins/errors.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import eventRoutes from './routes/events.js';
import healthRoutes from './routes/health.js';
import webhookRoutes from './routes/webhooks.js';

declare module 'fastify' {
  interface FastifyRequest {
    /** Corps brut de la requete, conserve pour verifier la signature des webhooks. */
    rawBody?: string;
  }
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      ...(isProduction
        ? {}
        : { transport: { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss' } } }),
    },
    trustProxy: true,
  });

  await app.register(errors);

  // Remplace le parseur JSON par defaut pour garder le corps brut de la
  // requete : la verification de signature des webhooks Chargily porte sur
  // les octets exacts envoyes, pas sur une reserialisation de l'objet parse.
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    req.rawBody = body as string;
    if (!body) {
      done(null, {});
      return;
    }
    try {
      done(null, JSON.parse(body as string));
    } catch (error) {
      done(error as Error, undefined);
    }
  });

  await app.register(cors, {
    origin: env.CORS_ORIGINS === '*' ? true : env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  });

  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
  });

  await app.register(auth);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(eventRoutes);
  await app.register(adminRoutes);
  await app.register(bookingRoutes);
  await app.register(webhookRoutes);

  return app;
}
