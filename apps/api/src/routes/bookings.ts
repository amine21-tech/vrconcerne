import { sql } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { createCheckout } from '../lib/chargily.js';
import { conflict, notFound, parse } from '../lib/http.js';
import { createBookingInput } from '../lib/validation.js';
import { db } from '../db/client.js';

const routes: FastifyPluginAsync = async (app) => {
  /**
   * Reservation. Le decrement des places disponibles se fait dans la meme
   * requete SQL que la lecture, a l'interieur d'une transaction : c'est ce
   * qui empeche deux utilisateurs de reserver simultanement les memes
   * dernieres places (aucune fenetre entre "lire le nombre de places" et
   * "l'ecrire" ou un autre client pourrait s'intercaler).
   */
  app.post('/bookings', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const input = parse(createBookingInput, req.body);

    const booking = await db.transaction(async (tx) => {
      const decremented = (await tx.execute(sql`
        UPDATE events
        SET available_seats = available_seats - ${input.quantity}
        WHERE id = ${input.eventId} AND status = 'published'
          AND available_seats >= ${input.quantity}
        RETURNING price, title, singer
      `)) as unknown as { price: number; title: string; singer: string }[];

      const event = decremented[0];
      if (!event) {
        throw conflict('places_insuffisantes', 'Plus assez de places disponibles pour cette quantite.');
      }

      const total = event.price * input.quantity;

      const rows = (await tx.execute(sql`
        INSERT INTO bookings (event_id, user_id, quantity, total)
        VALUES (${input.eventId}, ${req.authUser!.id}, ${input.quantity}, ${total})
        RETURNING id, total
      `)) as unknown as { id: string; total: number }[];

      return { id: rows[0]!.id, total: rows[0]!.total, title: event.title, singer: event.singer };
    });

    try {
      const checkout = await createCheckout({
        amount: booking.total,
        bookingId: booking.id,
        description: `${booking.title} — ${booking.singer}`,
      });

      await db.execute(sql`
        UPDATE bookings SET chargily_checkout_id = ${checkout.id} WHERE id = ${booking.id}
      `);

      reply.code(201);
      return { bookingId: booking.id, checkoutUrl: checkout.checkout_url };
    } catch (error) {
      // Le checkout n'a pas pu etre cree : on annule la reservation et on
      // recredite les places plutot que de laisser un client bloque en
      // 'pending_payment' sans aucun moyen de payer.
      await db.transaction(async (tx) => {
        await tx.execute(sql`
          UPDATE bookings SET payment_status = 'failed' WHERE id = ${booking.id}
        `);
        await tx.execute(sql`
          UPDATE events SET available_seats = available_seats + ${input.quantity}
          WHERE id = ${input.eventId}
        `);
      });
      throw error;
    }
  });

  app.get('/bookings/mine', { preHandler: [app.requireAuth] }, async (req) => {
    const rows = await db.execute(sql`
      SELECT b.id, b.quantity, b.total, b.payment_method AS "paymentMethod",
             b.payment_status AS "paymentStatus", b.confirm_code AS "confirmCode",
             b.created_at AS "bookedAt",
             e.id AS "eventId", e.title AS "eventTitle", e.singer, e.genre, e.emoji,
             to_char(e.event_date, 'YYYY-MM-DD') AS date, to_char(e.event_time, 'HH24:MI') AS time,
             e.venue, e.wilaya
      FROM bookings b
      JOIN events e ON e.id = b.event_id
      WHERE b.user_id = ${req.authUser!.id}
      ORDER BY b.created_at DESC
    `);
    return { items: rows };
  });

  app.get<{ Params: { id: string } }>('/bookings/:id', { preHandler: [app.requireAuth] }, async (req) => {
    const rows = (await db.execute(sql`
      SELECT b.id, b.quantity, b.total, b.payment_method AS "paymentMethod",
             b.payment_status AS "paymentStatus", b.confirm_code AS "confirmCode",
             b.user_id AS "userId", b.created_at AS "bookedAt",
             e.title AS "eventTitle", e.singer, e.emoji,
             to_char(e.event_date, 'YYYY-MM-DD') AS date, to_char(e.event_time, 'HH24:MI') AS time,
             e.venue, e.wilaya
      FROM bookings b
      JOIN events e ON e.id = b.event_id
      WHERE b.id = ${req.params.id}
      LIMIT 1
    `)) as unknown as { userId: string }[];

    const booking = rows[0];
    if (!booking || (booking.userId !== req.authUser!.id && req.authUser!.role !== 'admin')) {
      throw notFound('Reservation introuvable.');
    }
    return booking;
  });
};

export default routes;
