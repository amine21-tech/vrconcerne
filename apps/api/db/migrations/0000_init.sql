-- ---------------------------------------------------------------------------
-- VRconcerneDZ — schema initial
--
-- Remplace le localStorage du prototype : les evenements, comptes et
-- reservations vivent desormais en base, partages par tous les utilisateurs.
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------------------------
-- Comptes
-- ---------------------------------------------------------------------------

-- Remplace le selecteur de role client/organisateur/admin de Header.tsx, qui
-- etait un simple bouton sans aucune authentification.
CREATE TABLE IF NOT EXISTS users (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email             text NOT NULL UNIQUE,
  password_hash     text NOT NULL,
  display_name      text NOT NULL,
  role              text NOT NULL DEFAULT 'client'
                      CHECK (role IN ('client', 'organizer', 'admin')),
  -- Etat de la demande de partenariat organisateur : un compte 'organizer'
  -- ne peut publier directement qu'une fois 'approved' par un admin.
  organizer_status  text NOT NULL DEFAULT 'none'
                      CHECK (organizer_status IN ('none', 'pending', 'approved', 'rejected')),
  organizer_bio     text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  last_login_at     timestamptz
);

-- ---------------------------------------------------------------------------
-- Evenements  (ex EventItem cote client)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  singer           text NOT NULL,
  genre            text NOT NULL
                     CHECK (genre IN ('RAI', 'Jazz', 'Comedy', 'Chaabi', 'Rap DZ', 'Gnawa',
                                       'Sahraoui', 'Pop', 'Soiree')),
  description      text NOT NULL DEFAULT '',
  event_date       date NOT NULL,
  event_time       time NOT NULL,
  venue            text NOT NULL,
  wilaya           text NOT NULL,
  total_seats      integer NOT NULL CHECK (total_seats > 0),
  available_seats  integer NOT NULL CHECK (available_seats >= 0),
  price            integer NOT NULL CHECK (price >= 0),
  emoji            text NOT NULL DEFAULT '🎤',
  bg_color         text NOT NULL DEFAULT 'linear-gradient(135deg, #8B5CF6, #EC4899)',
  likes            integer NOT NULL DEFAULT 0,
  featured         boolean NOT NULL DEFAULT false,
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'published', 'rejected')),
  organizer_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CHECK (available_seats <= total_seats)
);

CREATE INDEX IF NOT EXISTS events_status_date_idx ON events (status, event_date);
CREATE INDEX IF NOT EXISTS events_genre_idx ON events (genre) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS events_wilaya_idx ON events (wilaya) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS events_search_trgm_idx ON events
  USING gin ((title || ' ' || singer || ' ' || venue) gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Reservations / billets  (ex TicketItem cote client)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bookings (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id           uuid NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity           integer NOT NULL CHECK (quantity > 0),
  total              integer NOT NULL CHECK (total >= 0),
  payment_method     text CHECK (payment_method IN ('cib', 'edahabia')),
  -- 'pending_payment' tant que Chargily n'a pas confirme via webhook : jamais
  -- 'paid' sur la seule foi du navigateur, contrairement a l'ancien
  -- BookingModal qui validait apres un simple setTimeout.
  payment_status     text NOT NULL DEFAULT 'pending_payment'
                       CHECK (payment_status IN ('pending_payment', 'paid', 'failed', 'refunded')),
  chargily_checkout_id text,
  confirm_code       text UNIQUE,
  created_at         timestamptz NOT NULL DEFAULT now(),
  paid_at            timestamptz
);

CREATE INDEX IF NOT EXISTS bookings_user_idx ON bookings (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_event_idx ON bookings (event_id);
CREATE INDEX IF NOT EXISTS bookings_checkout_idx ON bookings (chargily_checkout_id);

-- ---------------------------------------------------------------------------
-- Journal de moderation
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS moderation_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  text NOT NULL CHECK (entity_type IN ('event', 'organizer')),
  entity_id    uuid NOT NULL,
  action       text NOT NULL CHECK (action IN ('approve', 'reject', 'restore')),
  admin_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS moderation_log_created_idx ON moderation_log (created_at DESC);
