-- Spots Database Schema
-- PostgreSQL with PostGIS extension

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users (synced from Firebase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories with emojis
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) NOT NULL
);

INSERT INTO categories (slug, name, emoji) VALUES
  ('restaurant', 'Restaurante', '🍽️'),
  ('bar', 'Bar', '🍺'),
  ('cafe', 'Cafe', '☕'),
  ('beach', 'Playa', '🏖️'),
  ('club', 'Club', '🎶'),
  ('hotel', 'Hotel', '🏨'),
  ('park', 'Parque', '🌳'),
  ('museum', 'Museo', '🏛️'),
  ('shop', 'Tienda', '🛍️'),
  ('viewpoint', 'Mirador', '🌄'),
  ('other', 'Otro', '📍');

-- Lists / Collections
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  emoji VARCHAR(10) DEFAULT '📋',
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lists_user ON lists(user_id);

-- Places / Pins
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  list_id UUID REFERENCES lists(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES categories(id),

  -- Place info
  name VARCHAR(300) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  location GEOGRAPHY(POINT, 4326) NOT NULL,

  -- Source metadata
  source_url TEXT,
  source_type VARCHAR(20) CHECK (source_type IN ('instagram', 'tiktok', 'manual', 'google_maps')),
  source_title TEXT,
  source_author VARCHAR(200),
  thumbnail_url TEXT,

  -- User data
  notes TEXT,
  rating SMALLINT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  visited BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_places_user ON places(user_id);
CREATE INDEX idx_places_list ON places(list_id);
CREATE INDEX idx_places_category ON places(category_id);
CREATE INDEX idx_places_location ON places USING GIST(location);
CREATE INDEX idx_places_source_type ON places(source_type);
