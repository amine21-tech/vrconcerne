import { sql } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client.js';
import { notFound } from '../lib/http.js';

/**
 * Validation des comptes organisateurs/partenaires — le pendant "compte" de
 * la moderation d'evenements deja en place dans admin.ts.
 */
const routes: FastifyPluginAsync = async (app) => {
  app.get('/admin/organizers', { preHandler: [app.requireRole('admin')] }, async (req) => {
    const status = (req.query as { status?: string }).status ?? 'pending';
    const rows = await db.execute(sql`
      SELECT id, email, display_name AS "displayName", organizer_bio AS "organizerBio",
             organizer_status AS "organizerStatus", created_at AS "createdAt"
      FROM users
      WHERE role = 'organizer' AND organizer_status = ${status}
      ORDER BY created_at DESC
    `);
    return { items: rows };
  });

  app.post<{ Params: { id: string } }>(
    '/admin/organizers/:id/approve',
    { preHandler: [app.requireRole('admin')] },
    async (req) => {
      const rows = (await db.execute(sql`
        UPDATE users SET organizer_status = 'approved'
        WHERE id = ${req.params.id} AND role = 'organizer'
        RETURNING id
      `)) as unknown as { id: string }[];
      if (rows.length === 0) throw notFound();

      await db.execute(sql`
        INSERT INTO moderation_log (entity_type, entity_id, action, admin_id)
        VALUES ('organizer', ${req.params.id}, 'approve', ${req.authUser!.id})
      `);
      return { ok: true };
    },
  );

  app.post<{ Params: { id: string } }>(
    '/admin/organizers/:id/reject',
    { preHandler: [app.requireRole('admin')] },
    async (req) => {
      const rows = (await db.execute(sql`
        UPDATE users SET organizer_status = 'rejected'
        WHERE id = ${req.params.id} AND role = 'organizer'
        RETURNING id
      `)) as unknown as { id: string }[];
      if (rows.length === 0) throw notFound();

      await db.execute(sql`
        INSERT INTO moderation_log (entity_type, entity_id, action, admin_id)
        VALUES ('organizer', ${req.params.id}, 'reject', ${req.authUser!.id})
      `);
      return { ok: true };
    },
  );
};

export default routes;
