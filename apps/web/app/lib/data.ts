import { EventItem, ArtistStory, GenreType } from '../types';

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

export const generateId = (): string => Math.random().toString(36).substring(2, 11);

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    title: "Soolking Live in Algiers",
    singer: "Soolking",
    genre: "Rap DZ",
    description: "Le phénomène de la Rap Algérienne en live ! Une nuit inoubliable au cœur d'Alger avec les plus grands hits de Soolking.",
    date: "2026-07-25",
    time: "21:00",
    venue: "Stade du 5 Juillet",
    wilaya: "Alger",
    totalSeats: 5000,
    availableSeats: 3200,
    price: 2500,
    emoji: "🎤",
    bgColor: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
    likes: 1847,
    status: "published",
    organizerId: "org1",
    organizerName: "Live DZ Events",
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-2',
    title: "Festival International de Jazz d'Alger",
    singer: "Omar Sosa Quartet + DZ Jazz All-Stars",
    genre: "Jazz",
    description: "Le plus grand festival de Jazz d'Afrique du Nord revient ! Une fusion extraordinaire entre le Jazz international et les rythmes algériens.",
    date: "2026-07-26",
    time: "20:30",
    venue: "Opéra d'Alger - Salle Ibn Zeydoun",
    wilaya: "Alger",
    totalSeats: 800,
    availableSeats: 120,
    price: 3500,
    emoji: "🎷",
    bgColor: "linear-gradient(135deg, #0d1b2a, #1b263b, #415a77)",
    likes: 942,
    status: "published",
    organizerId: "org2",
    organizerName: "AlJazz Production",
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-3',
    title: "Cheb Khaled - Hommage RAI",
    singer: "Cheb Khaled",
    genre: "RAI",
    description: "Le Roi du RAI revient sur scène pour une soirée exceptionnelle. 40 ans de musique RAI à célébrer ensemble !",
    date: "2026-07-27",
    time: "22:00",
    venue: "Théâtre de Verdure d'Oran",
    wilaya: "Oran",
    totalSeats: 3000,
    availableSeats: 890,
    price: 4000,
    emoji: "👑",
    bgColor: "linear-gradient(135deg, #3d0000, #6b0000, #8b0000)",
    likes: 3201,
    status: "published",
    organizerId: "org3",
    organizerName: "Oran Spectacles",
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-4',
    title: "Nuit du Rire - Comedy Night Béjaïa",
    singer: "Mohamed Fellag + Guests Stars",
    genre: "Comedy",
    description: "La grande soirée d'humour algérien ! Fellag et ses invités surprises vous feront rire aux larmes. Spectacle tout public.",
    date: "2026-07-28",
    time: "20:00",
    venue: "Maison de la Culture Taos Amrouche",
    wilaya: "Béjaïa",
    totalSeats: 600,
    availableSeats: 250,
    price: 1500,
    emoji: "😂",
    bgColor: "linear-gradient(135deg, #1a1500, #2d2500, #4a3d00)",
    likes: 1122,
    status: "published",
    organizerId: "org4",
    organizerName: "Béjaïa Cultural Events",
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-5',
    title: "Djalil Palermo - Summer Bash Annaba",
    singer: "Djalil Palermo",
    genre: "RAI",
    description: "La star montante du RAI moderne s'installe à Annaba pour une nuit électrisante ! New sounds, new vibes, pure DZ energy.",
    date: "2026-07-29",
    time: "22:30",
    venue: "Hotel Sabri Beach Club",
    wilaya: "Annaba",
    totalSeats: 1200,
    availableSeats: 50,
    price: 3000,
    emoji: "🌟",
    bgColor: "linear-gradient(135deg, #0d0020, #1a0040, #2d0060)",
    likes: 2567,
    status: "published",
    organizerId: "org5",
    organizerName: "Annaba Party Pro",
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-6',
    title: "Freeklane - Chaabi Estival Constantine",
    singer: "Freeklane",
    genre: "Chaabi",
    description: "Les rois du Chaabi moderne reviennent ! Un voyage musical entre tradition et modernité dans la magnifique ville des ponts.",
    date: "2026-07-30",
    time: "21:30",
    venue: "Palais de la Culture Malek Haddad",
    wilaya: "Constantine",
    totalSeats: 1500,
    availableSeats: 780,
    price: 2000,
    emoji: "🪘",
    bgColor: "linear-gradient(135deg, #001a00, #003300, #004d00)",
    likes: 1834,
    status: "published",
    organizerId: "org6",
    organizerName: "Constantine Live",
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-7',
    title: "Nuit Gnawa - Tlemcen",
    singer: "Maâlem Mahmoud Guinia Ensemble",
    genre: "Gnawa",
    description: "Une nuit de transe et de spiritualité avec les maîtres du Gnawa. Une expérience mystique et musicale unique en son genre.",
    date: "2026-08-01",
    time: "21:00",
    venue: "Médersa de Tlemcen",
    wilaya: "Tlemcen",
    totalSeats: 400,
    availableSeats: 180,
    price: 1800,
    emoji: "🌙",
    bgColor: "linear-gradient(135deg, #0d0020, #200040, #1a0050)",
    likes: 756,
    status: "published",
    organizerId: "org7",
    organizerName: "Tlemcen Heritage",
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-8',
    title: "El Dey - Pop Night Tizi Ouzou",
    singer: "El Dey",
    genre: "Pop",
    description: "El Dey et ses musiciens vous transportent dans un univers musical unique. Pop, folk, et sons d'ailleurs dans le cœur de la Kabylie.",
    date: "2026-08-02",
    time: "20:00",
    venue: "Stade du 1er Novembre",
    wilaya: "Tizi Ouzou",
    totalSeats: 2000,
    availableSeats: 1300,
    price: 2200,
    emoji: "🎭",
    bgColor: "linear-gradient(135deg, #001020, #002040, #003060)",
    likes: 1203,
    status: "published",
    organizerId: "org8",
    organizerName: "KabylieLive",
    createdAt: new Date().toISOString(),
  },
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

export const generateCode = (): string => {
  return 'VRC' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const generateQRPattern = (): boolean[] => {
  const patterns: boolean[] = [];
  for (let i = 0; i < 25; i++) {
    patterns.push(Math.random() > 0.45);
  }
  [0, 1, 5, 6, 4, 9].forEach(i => patterns[i] = true);
  [20, 21, 24, 19, 14, 15].forEach(i => patterns[i] = true);
  return patterns;
};
