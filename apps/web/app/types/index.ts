export type GenreType =
  | 'Tout'
  | 'RAI'
  | 'Jazz'
  | 'Comedy'
  | 'Chaabi'
  | 'Rap DZ'
  | 'Gnawa'
  | 'Sahraoui'
  | 'Pop'
  | 'Soiree';

export type RoleType = 'client' | 'organizer' | 'admin';

export type EventStatus = 'published' | 'pending' | 'rejected';

export interface EventItem {
  id: string;
  title: string;
  singer: string;
  genre: GenreType;
  description: string;
  date: string;
  time: string;
  venue: string;
  wilaya: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  emoji: string;
  bgColor: string;
  likes: number;
  featured: boolean;
  status: EventStatus;
  organizerId: string;
  createdAt: string;
}

export type PaymentStatus = 'pending_payment' | 'paid' | 'failed' | 'refunded';

export interface TicketItem {
  id: string;
  eventId: string;
  eventTitle: string;
  singer: string;
  genre: GenreType;
  emoji: string;
  date: string;
  time: string;
  venue: string;
  wilaya: string;
  quantity: number;
  total: number;
  paymentMethod: 'cib' | 'edahabia' | null;
  paymentStatus: PaymentStatus;
  confirmCode: string | null;
  bookedAt: string;
}

export interface ArtistStory {
  id: string;
  name: string;
  emoji: string;
  genre: string;
  seen: boolean;
}

export interface AuthUser {
  id: string;
  displayName: string;
  role: RoleType;
  organizerStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface ToastMessage {
  id: number;
  msg: string;
  type: 'success' | 'error' | 'info';
}
