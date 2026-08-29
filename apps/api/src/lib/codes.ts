import { randomBytes } from 'node:crypto';

/** Code de confirmation lisible, affiche sur le billet et au controle a l'entree. */
export function generateConfirmCode(): string {
  return 'VRC' + randomBytes(5).toString('hex').toUpperCase();
}
