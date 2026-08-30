import { sql } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client.js';
import { badRequest, forbidden, notFound, parse } from '../lib/http.js';
import { createEventInput, eventsQuery } from '../lib/validation.js';

const EVENT_COLUMNS = sql`
  id, title, singer, genre, description,
  to_char(event_date, 'YYYY-MM-DD') AS date,
  to_char(event_time, 'HH24:MI') AS time,
  venue, wilaya, total_seats AS "totalSeats", available_seats AS "availableSeats",
  price, emoji, bg_color AS "bgColor", likes, featured, status,
  organizer_id AS "organizerId", created_at AS "createdAt"
`;

const routes: FastifyPluginAsync = async (app) => {
  /** Fil public : uniquement les evenements publies. */
  app.get('/events', async (req) => {
    const q = parse(eventsQuery, req.query);

    const conditions = [sql`status = 'published'`];
    if (q.genre) conditions.push(sql`genre = ${q.genre}`);
    if (q.wilaya) conditions.push(sql`wilaya = ${q.wilaya}`);
    if (q.featured) conditions.push(sql`featured = true`);
    if (q.weekendOnly) {
      conditions.push(sql`
        event_date BETWEEN current_date AND current_date + interval '7 days'
        AND extract(isodow FROM event_date) IN (5, 6, 7)
      `);
    }
    if (q.search) {
      conditions.push(sql`(title || ' ' || singer || ' ' || venue) ILIKE ${'%' + q.search + '%'}`);
    }

    const where = sql.join(conditions, sql` AND `);

    const rows = await db.execute(sql`
      SELECT ${EVENT_COLUMNS} FROM events
      WHERE ${where}
      ORDER BY event_date ASC, event_time ASC
      LIMIT ${q.limit} OFFSET ${q.offset}
    `);

    return { items: rows };
  });

  /** Evenements de l'organisateur connecte, tous statuts confondus. */
  app.get('/events/mine', { preHandler: [app.requireAuth] }, async (req) => {
    const rows = await db.execute(sql`
      SELECT ${EVENT_COLUMNS} FROM events
      WHERE organizer_id = ${req.authUser!.id}
      ORDER BY created_at DESC
    `);
    return { items: rows };
  });

  app.get<{ Params: { id: string } }>('/events/:id', { preHandler: [app.optionalAuth] }, async (req) => {
    const rows = (await db.execute(sql`
      SELECT ${EVENT_COLUMNS} FROM events WHERE id = ${req.params.id} LIMIT 1
    `)) as unknown as { status: string; organizerId: string }[];

    const event = rows[0];
    if (!event) throw notFound('Evenement introuvable.');

    const isOwner = req.authUser?.id === event.organizerId;
    const isAdmin = req.authUser?.role === 'admin';
    if (event.status !== 'published' && !isOwner && !isAdmin) throw notFound('Evenement introuvable.');

    return event;
  });

  /** Soumission d'un evenement : publie immediatement pour un admin, en attente sinon. */
  app.post('/events', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const input = parse(createEventInput, req.body);
    if (input.eventDate < new Date().toISOString().slice(0, 10)) {
      throw badRequest('date_passee', "La date de l'evenement ne peut pas etre dans le passe.");
    }
    const status = req.authUser!.role === 'admin' ? 'published' : 'pending';

    const rows = await db.execute(sql`
      INSERT INTO events (
        title, singer, genre, description, event_date, event_time, venue, wilaya,
        total_seats, available_seats, price, emoji, bg_color, status, organizer_id
      ) VALUES (
        ${input.title}, ${input.singer}, ${input.genre}, ${input.description},
        ${input.eventDate}, ${input.eventTime}, ${input.venue}, ${input.wilaya},
        ${input.totalSeats}, ${input.totalSeats}, ${input.price}, ${input.emoji},
        ${input.bgColor}, ${status}, ${req.authUser!.id}
      )
      RETURNING ${EVENT_COLUMNS}
    `);

    reply.code(201);
    return rows[0];
  });

  /** J'aime / retire mon like — compteur simple, pas de suivi par utilisateur pour le MVP. */
  app.post<{ Params: { id: string }; Body: { liked: boolean } }>(
    '/events/:id/like',
    { preHandler: [app.requireAuth] },
    async (req) => {
      const liked = req.body?.liked !== false;
      const rows = (await db.execute(sql`
        UPDATE events SET likes = GREATEST(0, likes + ${liked ? 1 : -1})
        WHERE id = ${req.params.id} AND status = 'published'
        RETURNING likes
      `)) as unknown as { likes: number }[];
      if (rows.length === 0) throw notFound();
      return { likes: rows[0]!.likes };
    },
  );

  app.patch<{ Params: { id: string } }>('/events/:id', { preHandler: [app.requireAuth] }, async (req) => {
    const input = parse(createEventInput.partial(), req.body);

    const existing = (await db.execute(sql`
      SELECT organizer_id AS "organizerId" FROM events WHERE id = ${req.params.id} LIMIT 1
    `)) as unknown as { organizerId: string }[];
    if (existing.length === 0) throw notFound();

    const isOwner = existing[0]!.organizerId === req.authUser!.id;
    const isAdmin = req.authUser!.role === 'admin';
    if (!isOwner && !isAdmin) throw forbidden("Vous ne pouvez modifier que vos propres evenements.");

    // Une modification par le proprietaire repasse l'evenement en moderation,
    // sauf si c'est un admin qui edite.
    const nextStatus = isAdmin ? sql`status` : sql`'pending'`;

    const rows = await db.execute(sql`
      UPDATE events SET
        title = COALESCE(${input.title ?? null}, title),
        singer = COALESCE(${input.singer ?? null}, singer),
        genre = COALESCE(${input.genre ?? null}, genre),
        description = COALESCE(${input.description ?? null}, description),
        venue = COALESCE(${input.venue ?? null}, venue),
        wilaya = COALESCE(${input.wilaya ?? null}, wilaya),
        price = COALESCE(${input.price ?? null}, price),
        status = ${nextStatus},
        updated_at = now()
      WHERE id = ${req.params.id}
      RETURNING ${EVENT_COLUMNS}
    `);

    return rows[0];
  });
};

export default routes;
