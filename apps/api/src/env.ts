import { existsSync } from 'node:fs';
import { z } from 'zod';

// En developpement, un fichier .env a la racine du paquet est charge
// automatiquement. En production, les variables viennent de l'environnement
// du conteneur — jamais d'un fichier committe par erreur.
if (existsSync('.env')) {
  try {
    process.loadEnvFile('.env');
  } catch {
    /* Node < 21.7 : on continue avec l'environnement tel quel */
  }
}

/**
 * Toute la configuration passe par ici et est validee au demarrage. Une
 * variable manquante arrete le serveur avec un message explicite plutot que
 * de le laisser demarrer a moitie configure.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3101),
  HOST: z.string().default('0.0.0.0'),

  DATABASE_URL: z.string().url(),

  /** Secret de signature des jetons utilisateur. */
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caracteres'),

  /** Base publique de l'API, utilisee pour construire les URL de callback. */
  PUBLIC_BASE_URL: z.string().url(),

  /** Origines autorisees, separees par des virgules. `*` en developpement. */
  CORS_ORIGINS: z.string().default('*'),

  /**
   * Chargily Pay (passerelle CIB / EDAHABIA). Les cles "test_" du tableau de
   * bord sandbox suffisent tant qu'aucun compte marchand n'est ouvert.
   */
  CHARGILY_API_KEY: z.string().min(1).default('test_placeholder_key'),
  CHARGILY_API_SECRET: z.string().min(1).default('test_placeholder_secret'),
  CHARGILY_WEBHOOK_SECRET: z.string().min(1).default('test_placeholder_webhook_secret'),
  CHARGILY_BASE_URL: z.string().url().default('https://pay.chargily.net/test/api/v2'),

  /** URL de retour de l'app apres paiement (deep link mobile ou page web). */
  APP_RETURN_URL: z.string().default('https://vrconcerne.dz/payment/return'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((i) => `  - ${i.path.join('.')} : ${i.message}`)
    .join('\n');
  console.error(`Configuration invalide, le serveur ne peut pas demarrer :\n${details}`);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

export const isProduction = env.NODE_ENV === 'production';
