import { sql } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client.js';
import { generateConfirmCode } from '../lib/codes.js';
import type { ChargilyWebhookEvent } from '../lib/chargily.js';
import { verifyWebhookSignature } from '../lib/chargily.js';

const routes: FastifyPluginAsync = async (app) => {
  /**
   * Chargily notifie ici le resultat reel du paiement. Le billet ne passe
   * JAMAIS a "paye" sur la seule foi du navigateur du client — uniquement
   * via cette confirmation serveur-a-serveur, dont la signature est verifiee.
   */
  app.post('/webhooks/chargily', async (req, reply) => {
    const signature = req.headers['signature'] as string | undefined;
    const rawBody = req.rawBody ?? '';

    if (!verifyWebhookSignature(rawBody, signature)) {
      req.log.warn('Signature de webhook Chargily invalide.');
      return reply.code(401).send({ error: 'signature_invalide' });
    }

    const event = req.body as ChargilyWebhookEvent;
    const bookingId = event.data?.metadata?.bookingId;
    if (!bookingId) {
      return reply.code(200).send({ ok: true, ignored: true });
    }

    if (event.type === 'checkout.paid') {
      await db.execute(sql`
        UPDATE bookings
        SET payment_status = 'paid',
            paid_at = now(),
            confirm_code = COALESCE(confirm_code, ${generateConfirmCode()}),
            payment_method = COALESCE(payment_method, ${event.data.payment_method ?? null})
        WHERE id = ${bookingId} AND payment_status = 'pending_payment'
      `);
    } else if (event.type === 'checkout.failed') {
      await db.transaction(async (tx) => {
        const rows = (await tx.execute(sql`
          UPDATE bookings SET payment_status = 'failed'
          WHERE id = ${bookingId} AND payment_status = 'pending_payment'
          RETURNING event_id AS "eventId", quantity
        `)) as unknown as { eventId: string; quantity: number }[];

        const failed = rows[0];
        if (failed) {
          await tx.execute(sql`
            UPDATE events SET available_seats = available_seats + ${failed.quantity}
            WHERE id = ${failed.eventId}
          `);
        }
      });
    }

    return reply.code(200).send({ ok: true });
  });
};

export default routes;
