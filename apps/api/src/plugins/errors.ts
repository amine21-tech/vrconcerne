import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { ZodError } from 'zod';
import { isProduction } from '../env.js';
import { HttpError } from '../lib/http.js';

const plugin: FastifyPluginAsync = async (app) => {
  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({
      error: 'route_inconnue',
      message: `Aucune route ${req.method} ${req.url}.`,
    });
  });

  app.setErrorHandler((error, req, reply) => {
    if (error instanceof HttpError) {
      reply.code(error.status).send({
        error: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      });
      return;
    }

    if (error instanceof ZodError) {
      reply.code(400).send({
        error: 'donnees_invalides',
        message: 'Certains champs sont incorrects.',
        details: error.issues.map((i) => ({ champ: i.path.join('.'), probleme: i.message })),
      });
      return;
    }

    const err = error as { code?: string; statusCode?: number; message?: string };

    // Violation de contrainte d'unicite cote Postgres.
    if (err.code === '23505') {
      reply.code(409).send({ error: 'doublon', message: 'Cet enregistrement existe deja.' });
      return;
    }

    const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
    if (status >= 500) req.log.error({ err: error }, 'erreur non geree');

    reply.code(status).send({
      error: 'erreur_serveur',
      message: isProduction
        ? "Une erreur est survenue. L'equipe a ete prevenue."
        : (err.message ?? 'Erreur inconnue.'),
    });
  });
};

export default fp(plugin, { name: 'vrc-errors' });
