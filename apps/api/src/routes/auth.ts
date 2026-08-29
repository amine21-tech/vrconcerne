import argon2 from 'argon2';
import { sql } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client.js';
import { HttpError, parse } from '../lib/http.js';
import { loginInput, registerInput } from '../lib/validation.js';
import type { Role } from '../plugins/auth.js';

type UserRow = {
  id: string;
  passwordHash: string;
  role: Role;
  displayName: string;
  organizerStatus: string;
};

const routes: FastifyPluginAsync = async (app) => {
  app.post(
    '/auth/register',
    { config: { rateLimit: { max: 10, timeWindow: '10 minutes' } } },
    async (req, reply) => {
      const input = parse(registerInput, req.body);
      const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
      const organizerStatus = input.role === 'organizer' ? 'pending' : 'none';

      const rows = (await db.execute(sql`
        INSERT INTO users (email, password_hash, display_name, role, organizer_status, organizer_bio)
        VALUES (${input.email}, ${passwordHash}, ${input.displayName}, ${input.role},
                ${organizerStatus}, ${input.organizerBio ?? null})
        RETURNING id, role, display_name AS "displayName"
      `)) as unknown as { id: string; role: Role; displayName: string }[];

      const user = rows[0];
      if (!user) throw new HttpError(500, 'creation_echouee', 'La creation du compte a echoue.');

      reply.code(201);
      return {
        token: app.signToken(user.id, user.role),
        user: { id: user.id, displayName: user.displayName, role: user.role },
      };
    },
  );

  app.post(
    '/auth/login',
    { config: { rateLimit: { max: 8, timeWindow: '5 minutes' } } },
    async (req) => {
      const { email, password } = parse(loginInput, req.body);

      const rows = (await db.execute(sql`
        SELECT id, password_hash AS "passwordHash", role, display_name AS "displayName",
               organizer_status AS "organizerStatus"
        FROM users WHERE email = ${email} LIMIT 1
      `)) as unknown as UserRow[];

      const account = rows[0];
      // Verification systematique meme si le compte n'existe pas, pour ne pas
      // reveler par le temps de reponse quels courriels sont enregistres.
      const valid = account
        ? await argon2.verify(account.passwordHash, password).catch(() => false)
        : await argon2
            .hash(password)
            .then(() => false)
            .catch(() => false);

      if (!account || !valid) {
        throw new HttpError(401, 'identifiants_invalides', 'Courriel ou mot de passe incorrect.');
      }

      await db.execute(sql`UPDATE users SET last_login_at = now() WHERE id = ${account.id}`);

      return {
        token: app.signToken(account.id, account.role),
        user: {
          id: account.id,
          displayName: account.displayName,
          role: account.role,
          organizerStatus: account.organizerStatus,
        },
      };
    },
  );

  app.get('/auth/me', { preHandler: [app.requireAuth] }, async (req) => {
    const rows = (await db.execute(sql`
      SELECT id, email, display_name AS "displayName", role, organizer_status AS "organizerStatus"
      FROM users WHERE id = ${req.authUser!.id} LIMIT 1
    `)) as unknown as unknown[];
    return rows[0];
  });
};

export default routes;
