import { ArtistStory, GenreType } from '../types';

export const GENRES: { id: GenreType; label: string; emoji: string }[] = [
  { id: 'Tout', label: '🎵 Tout', emoji: '🎵' },
  { id: 'RAI', label: '🎤 RAI', emoji: '🎤' },
  { id: 'Jazz', label: '🎷 Jazz', emoji: '🎷' },
  { id: 'Comedy', label: '😂 Humour', emoji: '😂' },
  { id: 'Chaabi', label: '🪘 Chaabi', emoji: '🪘' },
  { id: 'Rap DZ', label: '🎧 Rap DZ', emoji: '🎧' },
  { id: 'Gnawa', label: '🌙 Gnawa', emoji: '🌙' },
  { id: 'Sahraoui', label: '🏜️ Sahraoui', emoji: '🏜️' },
  { id: 'Pop', label: '⭐ Pop', emoji: '⭐' },
  { id: 'Soiree', label: '🎉 Soirées', emoji: '🎉' },
];

export const WILAYAS: string[] = [
  'Toutes les Wilayas',
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Béjaïa',
  'Tlemcen', 'Sétif', 'Blida', 'Batna', 'Skikda',
  'Tizi Ouzou', 'Médéa', 'Biskra', 'Tipaza', 'Jijel',
  'Bouira', 'Ghardaïa', 'Tamanrasset', 'Adrar'
];

export const ARTISTS_STORIES: ArtistStory[] = [
  { id: 's1', name: 'Soolking', emoji: '🎤', genre: 'Rap DZ', seen: false },
  { id: 's2', name: 'Cheb Khaled', emoji: '👑', genre: 'RAI', seen: false },
  { id: 's3', name: 'Djalil Palermo', emoji: '🌟', genre: 'RAI', seen: false },
  { id: 's4', name: 'Freeklane', emoji: '🎵', genre: 'Chaabi', seen: true },
  { id: 's5', name: 'El Dey', emoji: '🎭', genre: 'Pop', seen: false },
  { id: 's6', name: 'Massinissa', emoji: '🏔️', genre: 'Chaabi', seen: true },
  { id: 's7', name: 'Reda Taliani', emoji: '🎶', genre: 'RAI', seen: false },
  { id: 's8', name: 'Cheba Djenet', emoji: '🌸', genre: 'RAI', seen: false },
];

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-DZ', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });
};

export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-DZ', { 
    day: 'numeric', month: 'short'
  });
};

/**
 * Motif de QR purement visuel, derive du code de confirmation renvoye par le
 * serveur : le meme code redonne toujours le meme motif (contrairement a
 * l'ancien tirage aleatoire, qui changeait a chaque re-render).
 */
export const qrPatternFromCode = (code: string): boolean[] => {
  let seed = 0;
  for (let i = 0; i < code.length; i++) seed = (seed * 31 + code.charCodeAt(i)) >>> 0;

  const pattern: boolean[] = [];
  for (let i = 0; i < 25; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    pattern.push((seed >>> 16) % 100 > 45);
  }
  [0, 1, 5, 6, 4, 9].forEach((i) => (pattern[i] = true));
  [20, 21, 24, 19, 14, 15].forEach((i) => (pattern[i] = true));
  return pattern;
};
