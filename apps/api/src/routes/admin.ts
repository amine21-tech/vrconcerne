import { sql } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client.js';
import { notFound } from '../lib/http.js';

const routes: FastifyPluginAsync = async (app) => {
  app.get('/admin/events', { preHandler: [app.requireRole('admin')] }, async (req) => {
    const status = (req.query as { status?: string }).status;
    const where = status ? sql`WHERE status = ${status}` : sql``;
    const rows = await db.execute(sql`
      SELECT e.id, e.title, e.singer, e.genre, e.description,
             to_char(e.event_date, 'YYYY-MM-DD') AS date, to_char(e.event_time, 'HH24:MI') AS time,
             e.venue, e.wilaya, e.total_seats AS "totalSeats", e.available_seats AS "availableSeats",
             e.price, e.emoji, e.status, e.created_at AS "createdAt",
             u.display_name AS "organizerName"
      FROM events e
      JOIN users u ON u.id = e.organizer_id
      ${where}
      ORDER BY e.created_at DESC
      LIMIT 200
    `);
    return { items: rows };
  });

  app.post<{ Params: { id: string } }>(
    '/admin/events/:id/approve',
    { preHandler: [app.requireRole('admin')] },
    async (req) => {
      const rows = (await db.execute(sql`
        UPDATE events SET status = 'published', updated_at = now()
        WHERE id = ${req.params.id} RETURNING id
      `)) as unknown as { id: string }[];
      if (rows.length === 0) throw notFound();

      await db.execute(sql`
        INSERT INTO moderation_log (entity_type, entity_id, action, admin_id)
        VALUES ('event', ${req.params.id}, 'approve', ${req.authUser!.id})
      `);
      return { ok: true };
    },
  );

  app.post<{ Params: { id: string } }>(
    '/admin/events/:id/reject',
    { preHandler: [app.requireRole('admin')] },
    async (req) => {
      const rows = (await db.execute(sql`
        UPDATE events SET status = 'rejected', updated_at = now()
        WHERE id = ${req.params.id} RETURNING id
      `)) as unknown as { id: string }[];
      if (rows.length === 0) throw notFound();

      await db.execute(sql`
        INSERT INTO moderation_log (entity_type, entity_id, action, admin_id)
        VALUES ('event', ${req.params.id}, 'reject', ${req.authUser!.id})
      `);
      return { ok: true };
    },
  );

  /** Statistiques globales — agregats reels, plus un reduce cote client sur des donnees locales. */
  app.get('/admin/stats', { preHandler: [app.requireRole('admin')] }, async () => {
    const rows = (await db.execute(sql`
      SELECT
        (SELECT count(*) FROM events WHERE status = 'pending')::int AS "pendingEvents",
        (SELECT count(*) FROM events WHERE status = 'published')::int AS "publishedEvents",
        (SELECT coalesce(sum(quantity), 0) FROM bookings WHERE payment_status = 'paid')::int AS "ticketsSold",
        (SELECT coalesce(sum(total), 0) FROM bookings WHERE payment_status = 'paid')::int AS "revenue",
        (SELECT count(*) FROM users WHERE organizer_status = 'pending')::int AS "pendingOrganizers"
    `)) as unknown as unknown[];
    return rows[0];
  });

  app.get('/admin/moderation-log', { preHandler: [app.requireRole('admin')] }, async (req) => {
    const limit = Math.min(Number((req.query as { limit?: string }).limit ?? 100), 500);
    const rows = await db.execute(sql`
      SELECT m.id, m.entity_type AS "entityType", m.entity_id AS "entityId", m.action,
             m.created_at AS "createdAt", u.display_name AS "adminName"
      FROM moderation_log m
      LEFT JOIN users u ON u.id = m.admin_id
      ORDER BY m.created_at DESC
      LIMIT ${limit}
    `);
    return { items: rows };
  });
};

export default routes;
