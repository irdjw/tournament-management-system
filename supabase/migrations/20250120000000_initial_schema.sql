-- ============================================
-- TOURNAMENT MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Multi-Sport Architecture (Darts, Pool, Snooker, etc.)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER MANAGEMENT & ROLES
-- ============================================

-- User roles enum
CREATE TYPE user_role AS ENUM (
  'system_admin',
  'venue_admin', 
  'tournament_admin',
  'scorer',
  'player'
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role user_role NOT NULL DEFAULT 'player',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- GAME TYPES & CONFIGURATION
-- ============================================

-- Game types (darts, pool, snooker, etc.)
CREATE TABLE game_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- 'darts', 'pool', 'snooker'
  display_name TEXT NOT NULL,
  scoring_system TEXT NOT NULL, -- 'countdown', 'race', 'frames'
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default darts game type
INSERT INTO game_types (name, display_name, scoring_system, config) VALUES 
(
  'darts',
  'Darts',
  'countdown',
  '{
    "default_starting_score": 501,
    "available_formats": [301, 501, 701],
    "checkout_required": true,
    "scoring_modes": ["single", "doubles"]
  }'::jsonb
);

-- ============================================
-- VENUES (For future expansion)
-- ============================================

CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  managed_by UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PLAYERS
-- ============================================

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  user_id UUID REFERENCES users(id), -- If player has user account
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TOURNAMENTS
-- ============================================

-- Tournament status enum
CREATE TYPE tournament_status AS ENUM (
  'setup',
  'in_progress',
  'completed',
  'cancelled'
);

-- Tournament format enum
CREATE TYPE tournament_format AS ENUM (
  'knockout',
  'league',
  'round_robin',
  'groups_to_knockout'
);

CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  game_type_id UUID NOT NULL REFERENCES game_types(id),
  venue_id UUID REFERENCES venues(id),
  format tournament_format NOT NULL DEFAULT 'knockout',
  status tournament_status NOT NULL DEFAULT 'setup',
  
  -- Match configuration (can be overridden per match)
  default_best_of_legs INTEGER NOT NULL DEFAULT 5,
  default_starting_score INTEGER NOT NULL DEFAULT 501,
  
  -- Admin/ownership
  managed_by UUID REFERENCES users(id), -- Tournament admin
  created_by UUID REFERENCES users(id) NOT NULL, -- System admin who created it
  
  -- Dates
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Game-specific settings
  settings JSONB NOT NULL DEFAULT '{}'
);

-- Tournament players (registration)
CREATE TABLE tournament_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  seed_number INTEGER,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, player_id)
);

-- ============================================
-- MATCHES
-- ============================================

-- Match status enum
CREATE TYPE match_status AS ENUM (
  'pending',
  'assigned',
  'in_progress', 
  'completed',
  'cancelled'
);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  
  -- Players
  player1_id UUID REFERENCES tournament_players(id),
  player2_id UUID REFERENCES tournament_players(id),
  
  -- Tournament structure
  round INTEGER NOT NULL, -- 1=final, 2=semi, 3=quarter, etc.
  position_in_round INTEGER NOT NULL, -- For bracket positioning
  
  -- Parent matches (for bracket progression)
  feeds_into_match_id UUID REFERENCES matches(id),
  player1_from_match_id UUID REFERENCES matches(id),
  player2_from_match_id UUID REFERENCES matches(id),
  
  -- Match configuration (inherits from tournament unless overridden)
  best_of_legs INTEGER,
  starting_score INTEGER,
  
  -- Scoring
  assigned_to_user_id UUID REFERENCES users(id), -- Scorer
  status match_status NOT NULL DEFAULT 'pending',
  
  -- Results
  winner_id UUID REFERENCES tournament_players(id),
  player1_legs_won INTEGER DEFAULT 0,
  player2_legs_won INTEGER DEFAULT 0,
  
  -- Timestamps
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- LEGS (Individual games within a match)
-- ============================================

CREATE TABLE legs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  leg_number INTEGER NOT NULL,
  
  -- Players (denormalized for easier querying)
  player1_id UUID NOT NULL REFERENCES tournament_players(id),
  player2_id UUID NOT NULL REFERENCES tournament_players(id),
  
  -- Leg result
  winner_id UUID REFERENCES tournament_players(id),
  
  -- Starting scores (for games that don't start at standard)
  player1_starting_score INTEGER NOT NULL,
  player2_starting_score INTEGER NOT NULL,
  
  -- Final scores
  player1_final_score INTEGER,
  player2_final_score INTEGER,
  
  -- Statistics
  total_darts_thrown INTEGER,
  checkout_dart INTEGER, -- Which dart won it (1-3)
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(match_id, leg_number)
);

-- ============================================
-- DART-BY-DART SCORING
-- ============================================

-- Turn (each player's throw of 3 darts)
CREATE TABLE turns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  leg_id UUID NOT NULL REFERENCES legs(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES tournament_players(id),
  turn_number INTEGER NOT NULL, -- 1, 2, 3, etc.
  
  -- Scores
  score_before INTEGER NOT NULL,
  score_after INTEGER NOT NULL,
  turn_total INTEGER NOT NULL, -- Sum of 3 darts
  
  -- Checkout attempt
  is_checkout_attempt BOOLEAN DEFAULT FALSE,
  is_successful_checkout BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(leg_id, player_id, turn_number)
);

-- Individual darts within a turn
CREATE TABLE darts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turn_id UUID NOT NULL REFERENCES turns(id) ON DELETE CASCADE,
  dart_number INTEGER NOT NULL CHECK (dart_number BETWEEN 1 AND 3),
  
  -- Dart value
  multiplier INTEGER NOT NULL CHECK (multiplier IN (1, 2, 3)), -- Single, Double, Treble
  number INTEGER NOT NULL CHECK (number BETWEEN 0 AND 20 OR number = 25), -- 0-20 or bullseye
  value INTEGER NOT NULL, -- Calculated: multiplier * number
  
  -- Bust tracking
  is_bust BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(turn_id, dart_number)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_by ON users(created_by);

-- Tournaments
CREATE INDEX idx_tournaments_game_type ON tournaments(game_type_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_managed_by ON tournaments(managed_by);
CREATE INDEX idx_tournaments_created_by ON tournaments(created_by);

-- Tournament players
CREATE INDEX idx_tournament_players_tournament ON tournament_players(tournament_id);
CREATE INDEX idx_tournament_players_player ON tournament_players(player_id);

-- Matches
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_assigned_to ON matches(assigned_to_user_id);
CREATE INDEX idx_matches_round ON matches(tournament_id, round);

-- Legs
CREATE INDEX idx_legs_match ON legs(match_id);
CREATE INDEX idx_legs_match_number ON legs(match_id, leg_number);

-- Turns
CREATE INDEX idx_turns_leg ON turns(leg_id);
CREATE INDEX idx_turns_player ON turns(player_id);
CREATE INDEX idx_turns_leg_player ON turns(leg_id, player_id);

-- Darts
CREATE INDEX idx_darts_turn ON darts(turn_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE darts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "System admins can manage users" ON users FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin'
  )
);

-- Game types policies (read-only for most users)
CREATE POLICY "Anyone can view game types" ON game_types FOR SELECT USING (true);
CREATE POLICY "System admins can manage game types" ON game_types FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin'
  )
);

-- Tournaments policies
CREATE POLICY "Anyone can view tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Admins can create tournaments" ON tournaments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('system_admin', 'venue_admin', 'tournament_admin')
  )
);
CREATE POLICY "Tournament owners can update" ON tournaments FOR UPDATE USING (
  managed_by = auth.uid() OR 
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin')
);

-- Matches policies
CREATE POLICY "Anyone can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Admins can manage matches" ON matches FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tournaments t
    WHERE t.id = matches.tournament_id
    AND (
      t.managed_by = auth.uid() OR
      t.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin')
    )
  )
);
CREATE POLICY "Assigned scorers can update matches" ON matches FOR UPDATE USING (
  assigned_to_user_id = auth.uid()
);

-- Legs, turns, darts policies (scorers can create/update)
CREATE POLICY "Anyone can view legs" ON legs FOR SELECT USING (true);
CREATE POLICY "Assigned scorers can manage legs" ON legs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = legs.match_id
    AND m.assigned_to_user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view turns" ON turns FOR SELECT USING (true);
CREATE POLICY "Assigned scorers can manage turns" ON turns FOR ALL USING (
  EXISTS (
    SELECT 1 FROM legs l
    JOIN matches m ON m.id = l.match_id
    WHERE l.id = turns.leg_id
    AND m.assigned_to_user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view darts" ON darts FOR SELECT USING (true);
CREATE POLICY "Assigned scorers can manage darts" ON darts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM turns t
    JOIN legs l ON l.id = t.leg_id
    JOIN matches m ON m.id = l.match_id
    WHERE t.id = darts.turn_id
    AND m.assigned_to_user_id = auth.uid()
  )
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER VIEWS
-- ============================================

-- Match details with player names
CREATE VIEW match_details AS
SELECT 
  m.id,
  m.tournament_id,
  t.name as tournament_name,
  m.round,
  m.position_in_round,
  m.status,
  m.best_of_legs,
  p1.name as player1_name,
  p2.name as player2_name,
  m.player1_legs_won,
  m.player2_legs_won,
  pw.name as winner_name,
  u.display_name as scorer_name,
  m.started_at,
  m.completed_at
FROM matches m
JOIN tournaments t ON t.id = m.tournament_id
LEFT JOIN tournament_players tp1 ON tp1.id = m.player1_id
LEFT JOIN players p1 ON p1.id = tp1.player_id
LEFT JOIN tournament_players tp2 ON tp2.id = m.player2_id
LEFT JOIN players p2 ON p2.id = tp2.player_id
LEFT JOIN tournament_players tpw ON tpw.id = m.winner_id
LEFT JOIN players pw ON pw.id = tpw.player_id
LEFT JOIN users u ON u.id = m.assigned_to_user_id;

-- Tournament standings
CREATE VIEW tournament_standings AS
SELECT 
  tp.tournament_id,
  p.id as player_id,
  p.name as player_name,
  COUNT(m.id) FILTER (WHERE m.winner_id = tp.id) as matches_won,
  COUNT(m.id) FILTER (WHERE m.status = 'completed' AND m.winner_id != tp.id) as matches_lost,
  COUNT(m.id) FILTER (WHERE m.status = 'completed') as matches_played
FROM tournament_players tp
JOIN players p ON p.id = tp.player_id
LEFT JOIN matches m ON (m.player1_id = tp.id OR m.player2_id = tp.id)
GROUP BY tp.tournament_id, p.id, p.name;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE game_types IS 'Defines different sports/games (darts, pool, snooker) with their scoring systems';
COMMENT ON TABLE tournaments IS 'Main tournament container - can be knockout, league, round robin, etc.';
COMMENT ON TABLE matches IS 'Individual matches within a tournament - tracks players, rounds, and results';
COMMENT ON TABLE legs IS 'Individual legs/games within a match - detailed scoring unit';
COMMENT ON TABLE turns IS 'Each player turn (3 darts in darts) - tracks score progression';
COMMENT ON TABLE darts IS 'Individual dart throws - granular dart-by-dart data';

-- ============================================
-- END OF SCHEMA
-- ============================================
