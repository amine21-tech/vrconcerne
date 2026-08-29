import fastifyJwt from '@fastify/jwt';
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { env } from '../env.js';

export type Role = 'client' | 'organizer' | 'admin';
export type Claims = { sub: string; role: Role };

declare module 'fastify' {
  interface FastifyRequest {
    /**
     * Nom distinct de `user` : @fastify/jwt decore deja `request.user` avec
     * le payload JWT brut, sous un type incompatible avec le notre.
     */
    authUser?: { id: string; role: Role };
  }
  interface FastifyInstance {
    /** Exige un jeton valide, n'importe quel role. */
    requireAuth: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** Exige un jeton valide dont le role figure dans la liste donnee. */
    requireRole: (...roles: Role[]) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** Lit le jeton s'il est present, sans jamais refuser la requete. */
    optionalAuth: (req: FastifyRequest) => Promise<void>;
    signToken: (userId: string, role: Role) => string;
  }
}

const plugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { algorithm: 'HS256' },
  });

  app.decorate('signToken', (userId: string, role: Role) =>
    app.jwt.sign({ sub: userId, role } satisfies Claims, { expiresIn: '30d' }),
  );

  app.decorate('requireAuth', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const claims = await req.jwtVerify<Claims>();
      req.authUser = { id: claims.sub, role: claims.role };
    } catch {
      await reply.code(401).send({ error: 'connexion_requise', message: 'Connexion requise.' });
    }
  });

  app.decorate(
    'requireRole',
    (...roles: Role[]) =>
      async (req: FastifyRequest, reply: FastifyReply) => {
        try {
          const claims = await req.jwtVerify<Claims>();
          if (!roles.includes(claims.role)) {
            await reply.code(403).send({ error: 'interdit', message: 'Action non autorisee.' });
            return;
          }
          req.authUser = { id: claims.sub, role: claims.role };
        } catch {
          await reply.code(401).send({ error: 'connexion_requise', message: 'Connexion requise.' });
        }
      },
  );

  app.decorate('optionalAuth', async (req: FastifyRequest) => {
    try {
      const claims = await req.jwtVerify<Claims>();
      req.authUser = { id: claims.sub, role: claims.role };
    } catch {
      /* requete anonyme : on continue */
    }
  });
};

export default fp(plugin, { name: 'vrc-auth' });
