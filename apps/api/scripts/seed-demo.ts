/**
 * Insere un jeu d'evenements de demonstration, avec des dates a venir
 * (calculees a partir d'aujourd'hui plutot que codees en dur) pour qu'ils
 * apparaissent immediatement dans le fil "cette semaine".
 *
 *   npm run seed:demo
 */
import argon2 from 'argon2';
import { sqlClient } from '../src/db/client.js';

function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const DEMO_ORGANIZER_EMAIL = 'demo-organisateur@vrconcerne.dz';

const EVENTS = [
  { title: 'Soolking Live in Algiers', singer: 'Soolking', genre: 'Rap DZ', description: "Le phenomene de la Rap Algerienne en live ! Une nuit inoubliable au coeur d'Alger.", date: inDays(2), time: '21:00', venue: 'Stade du 5 Juillet', wilaya: 'Alger', totalSeats: 5000, price: 2500, emoji: '🎤', bgColor: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' },
  { title: "Festival International de Jazz d'Alger", singer: 'Omar Sosa Quartet + DZ Jazz All-Stars', genre: 'Jazz', description: "Le plus grand festival de Jazz d'Afrique du Nord revient !", date: inDays(3), time: '20:30', venue: "Opera d'Alger - Salle Ibn Zeydoun", wilaya: 'Alger', totalSeats: 800, price: 3500, emoji: '🎷', bgColor: 'linear-gradient(135deg, #0d1b2a, #1b263b, #415a77)' },
  { title: 'Cheb Khaled - Hommage RAI', singer: 'Cheb Khaled', genre: 'RAI', description: 'Le Roi du RAI revient sur scene pour une soiree exceptionnelle.', date: inDays(4), time: '22:00', venue: 'Theatre de Verdure d\'Oran', wilaya: 'Oran', totalSeats: 3000, price: 4000, emoji: '👑', bgColor: 'linear-gradient(135deg, #3d0000, #6b0000, #8b0000)' },
  { title: 'Nuit du Rire - Comedy Night Bejaia', singer: 'Mohamed Fellag + Guests Stars', genre: 'Comedy', description: "La grande soiree d'humour algerien !", date: inDays(5), time: '20:00', venue: 'Maison de la Culture Taos Amrouche', wilaya: 'Béjaïa', totalSeats: 600, price: 1500, emoji: '😂', bgColor: 'linear-gradient(135deg, #1a1500, #2d2500, #4a3d00)' },
  { title: 'Djalil Palermo - Summer Bash Annaba', singer: 'Djalil Palermo', genre: 'RAI', description: 'La star montante du RAI moderne electrise Annaba.', date: inDays(6), time: '22:30', venue: 'Hotel Sabri Beach Club', wilaya: 'Annaba', totalSeats: 1200, price: 3000, emoji: '🌟', bgColor: 'linear-gradient(135deg, #0d0020, #1a0040, #2d0060)' },
  { title: 'Freeklane - Chaabi Estival Constantine', singer: 'Freeklane', genre: 'Chaabi', description: 'Les rois du Chaabi moderne reviennent !', date: inDays(7), time: '21:30', venue: 'Palais de la Culture Malek Haddad', wilaya: 'Constantine', totalSeats: 1500, price: 2000, emoji: '🪘', bgColor: 'linear-gradient(135deg, #001a00, #003300, #004d00)' },
  { title: 'Nuit Gnawa - Tlemcen', singer: 'Maalem Mahmoud Guinia Ensemble', genre: 'Gnawa', description: 'Une nuit de transe et de spiritualite avec les maitres du Gnawa.', date: inDays(9), time: '21:00', venue: 'Medersa de Tlemcen', wilaya: 'Tlemcen', totalSeats: 400, price: 1800, emoji: '🌙', bgColor: 'linear-gradient(135deg, #0d0020, #200040, #1a0050)' },
  { title: 'El Dey - Pop Night Tizi Ouzou', singer: 'El Dey', genre: 'Pop', description: 'El Dey et ses musiciens transportent la Kabylie.', date: inDays(10), time: '20:00', venue: 'Stade du 1er Novembre', wilaya: 'Tizi Ouzou', totalSeats: 2000, price: 2200, emoji: '🎭', bgColor: 'linear-gradient(135deg, #001020, #002040, #003060)' },
];

const hash = await argon2.hash('demo-password-change-me', { type: argon2.argon2id });

const [organizer] = await sqlClient<{ id: string }[]>`
  INSERT INTO users (email, password_hash, display_name, role, organizer_status)
  VALUES (${DEMO_ORGANIZER_EMAIL}, ${hash}, 'Demo Events DZ', 'organizer', 'approved')
  ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
  RETURNING id`;

for (const e of EVENTS) {
  await sqlClient`
    INSERT INTO events (
      title, singer, genre, description, event_date, event_time, venue, wilaya,
      total_seats, available_seats, price, emoji, bg_color, status, organizer_id, featured
    ) VALUES (
      ${e.title}, ${e.singer}, ${e.genre}, ${e.description}, ${e.date}, ${e.time}, ${e.venue}, ${e.wilaya},
      ${e.totalSeats}, ${e.totalSeats}, ${e.price}, ${e.emoji}, ${e.bgColor}, 'published', ${organizer!.id},
      ${Math.random() < 0.25}
    )`;
}

console.log(`${EVENTS.length} evenements de demonstration inseres.`);
await sqlClient.end();
