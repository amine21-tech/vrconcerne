import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../env.js';

/**
 * Client minimal pour Chargily Pay (checkout hebergee CIB / EDAHABIA).
 *
 * IMPORTANT : ecrit a partir de la documentation publique de l'API v2
 * (https://dev.chargily.com). A verifier une fois un vrai compte sandbox
 * ouvert : les noms de champs d'une passerelle de paiement evoluent, et
 * personne ne doit faire confiance a une integration de paiement qui n'a pas
 * ete testee contre l'API reelle avant mise en production.
 */

type CreateCheckoutParams = {
  amount: number;
  bookingId: string;
  description: string;
};

type ChargilyCheckout = {
  id: string;
  checkout_url: string;
};

export async function createCheckout(params: CreateCheckoutParams): Promise<ChargilyCheckout> {
  const response = await fetch(`${env.CHARGILY_BASE_URL}/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CHARGILY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: 'dzd',
      description: params.description,
      success_url: `${env.APP_RETURN_URL}?booking=${params.bookingId}&status=success`,
      failure_url: `${env.APP_RETURN_URL}?booking=${params.bookingId}&status=failure`,
      webhook_endpoint: `${env.PUBLIC_BASE_URL}/webhooks/chargily`,
      metadata: { bookingId: params.bookingId },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Chargily a refuse la creation du checkout (${response.status}) : ${body}`);
  }

  return (await response.json()) as ChargilyCheckout;
}

/**
 * Verifie la signature HMAC-SHA256 du webhook, calculee sur le corps brut de
 * la requete avec la cle secrete du compte. Sans cette verification,
 * n'importe qui pourrait poster un faux "paiement reussi".
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | undefined): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac('sha256', env.CHARGILY_WEBHOOK_SECRET).update(rawBody).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const receivedBuf = Buffer.from(signatureHeader, 'utf8');
  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}

export type ChargilyWebhookEvent = {
  type: 'checkout.paid' | 'checkout.failed' | string;
  data: {
    id: string;
    metadata?: { bookingId?: string };
    payment_method?: 'edahabia' | 'cib';
  };
};
