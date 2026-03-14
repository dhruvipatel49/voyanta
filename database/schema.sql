-- ============================================
-- TravelMind — Supabase PostgreSQL Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- TABLE: users
-- Synced with Supabase Auth (auth.users)
-- ──────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

-- ──────────────────────────────────────────────
-- TABLE: trips
-- ──────────────────────────────────────────────
CREATE TABLE trips (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  destination_city  TEXT NOT NULL,
  days              INTEGER NOT NULL CHECK (days > 0),
  budget            NUMERIC(10, 2),
  invite_code       TEXT UNIQUE NOT NULL,
  created_by        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trips_created_by ON trips(created_by);
CREATE INDEX idx_trips_invite_code ON trips(invite_code);
CREATE INDEX idx_trips_destination ON trips(destination_city);

-- ──────────────────────────────────────────────
-- TABLE: trip_members
-- ──────────────────────────────────────────────
CREATE TABLE trip_members (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id   UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

CREATE INDEX idx_trip_members_trip ON trip_members(trip_id);
CREATE INDEX idx_trip_members_user ON trip_members(user_id);

-- ──────────────────────────────────────────────
-- TABLE: places
-- Pre-seeded tourist places dataset
-- ──────────────────────────────────────────────
CREATE TABLE places (
  id                          SERIAL PRIMARY KEY,
  name                        TEXT NOT NULL,
  city                        TEXT NOT NULL,
  category                    TEXT NOT NULL CHECK (category IN (
                                'beach', 'historical', 'restaurant',
                                'nightlife', 'nature', 'shopping', 'cultural'
                              )),
  latitude                    DOUBLE PRECISION NOT NULL,
  longitude                   DOUBLE PRECISION NOT NULL,
  rating                      NUMERIC(2, 1) CHECK (rating >= 1 AND rating <= 5),
  average_visit_duration_hours NUMERIC(3, 1),
  best_time_of_day            TEXT CHECK (best_time_of_day IN (
                                'morning', 'afternoon', 'evening', 'night'
                              ))
);

CREATE INDEX idx_places_city ON places(city);
CREATE INDEX idx_places_category ON places(category);
CREATE INDEX idx_places_city_category ON places(city, category);

-- ──────────────────────────────────────────────
-- TABLE: wishlist
-- Places users want to visit on a trip
-- ──────────────────────────────────────────────
CREATE TABLE wishlist (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id   UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  place_id  INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  added_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trip_id, place_id, added_by)
);

CREATE INDEX idx_wishlist_trip ON wishlist(trip_id);
CREATE INDEX idx_wishlist_place ON wishlist(place_id);

-- ──────────────────────────────────────────────
-- TABLE: votes
-- Votes on wishlisted places
-- ──────────────────────────────────────────────
CREATE TABLE votes (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id   UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  place_id  INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote      INTEGER NOT NULL DEFAULT 1 CHECK (vote IN (-1, 1)),
  voted_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trip_id, place_id, user_id)
);

CREATE INDEX idx_votes_trip ON votes(trip_id);
CREATE INDEX idx_votes_trip_place ON votes(trip_id, place_id);

-- ──────────────────────────────────────────────
-- TABLE: itinerary
-- AI-generated itinerary stored per trip
-- ──────────────────────────────────────────────
CREATE TABLE itinerary (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number  INTEGER NOT NULL CHECK (day_number > 0),
  place_id    INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  time_of_day TEXT NOT NULL CHECK (time_of_day IN (
                'morning', 'afternoon', 'evening', 'night'
              )),
  "order"     INTEGER NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trip_id, day_number, "order")
);

CREATE INDEX idx_itinerary_trip ON itinerary(trip_id);
CREATE INDEX idx_itinerary_trip_day ON itinerary(trip_id, day_number);

-- ──────────────────────────────────────────────
-- TABLE: expenses
-- Expense tracking & splitting
-- ──────────────────────────────────────────────
CREATE TABLE expenses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  paid_by     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount      NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  category    TEXT DEFAULT 'general',
  split_among UUID[] NOT NULL,       -- array of user UUIDs
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_expenses_trip ON expenses(trip_id);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users read own profile"
  ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON users FOR UPDATE USING (auth.uid() = id);

-- Trip members can read their trips
CREATE POLICY "Members read trips"
  ON trips FOR SELECT USING (
    id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

-- Trip creator can manage trips
CREATE POLICY "Creator manages trips"
  ON trips FOR ALL USING (created_by = auth.uid());

-- Members can read member list
CREATE POLICY "Members read members"
  ON trip_members FOR SELECT USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

-- Places are publicly readable
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Places are public"
  ON places FOR SELECT USING (true);
