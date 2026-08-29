import { z } from 'zod';

/**
 * Genres acceptes par la base (voir la contrainte CHECK de la table events).
 * 'Soiree' est prevu pour la Phase 3 (front pas encore branche dessus) mais
 * deja valide ici pour eviter une seconde migration.
 */
export const GENRE_VALUES = [
  'RAI',
  'Jazz',
  'Comedy',
  'Chaabi',
  'Rap DZ',
  'Gnawa',
  'Sahraoui',
  'Pop',
  'Soiree',
] as const;

/** Doit rester identique a WILAYAS dans apps/web/app/lib/data.ts (hors 'Toutes les Wilayas'). */
export const WILAYA_VALUES = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Béjaïa',
  'Tlemcen', 'Sétif', 'Blida', 'Batna', 'Skikda',
  'Tizi Ouzou', 'Médéa', 'Biskra', 'Tipaza', 'Jijel',
  'Bouira', 'Ghardaïa', 'Tamanrasset', 'Adrar',
] as const;

const emailSchema = z.string().trim().toLowerCase().email('Adresse courriel invalide.');
const passwordSchema = z.string().min(8, 'Le mot de passe doit faire au moins 8 caracteres.');

export const registerInput = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(2).max(80),
  role: z.enum(['client', 'organizer']).default('client'),
  organizerBio: z.string().trim().max(500).optional(),
});

export const loginInput = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const createEventInput = z.object({
  title: z.string().trim().min(3).max(120),
  singer: z.string().trim().min(2).max(120),
  genre: z.enum(GENRE_VALUES),
  description: z.string().trim().max(2000).default(''),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date attendue au format AAAA-MM-JJ.'),
  eventTime: z.string().regex(/^\d{2}:\d{2}$/, 'Heure attendue au format HH:MM.'),
  venue: z.string().trim().min(2).max(160),
  wilaya: z.enum(WILAYA_VALUES),
  totalSeats: z.coerce.number().int().min(1).max(200_000),
  price: z.coerce.number().int().min(0).max(1_000_000),
  emoji: z.string().trim().min(1).max(8).default('🎤'),
  bgColor: z.string().trim().min(1).max(200).default('linear-gradient(135deg, #8B5CF6, #EC4899)'),
});

export const eventsQuery = z.object({
  genre: z.enum(GENRE_VALUES).optional(),
  wilaya: z.enum(WILAYA_VALUES).optional(),
  search: z.string().trim().max(120).optional(),
  weekendOnly: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createBookingInput = z.object({
  eventId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(10),
});
