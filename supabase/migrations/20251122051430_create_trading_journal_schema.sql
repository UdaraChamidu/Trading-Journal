/*
  # Trading Journal Schema

  1. New Tables
    - `users_profile` - Store user profile data (balance, timezone, preferences)
    - `trades` - Main trades table with all trade details
    - `weekly_reviews` - Weekly review summaries
    - `goals` - User monthly goals
    - `general_notes` - General market observation notes
    - `trading_plan` - User's trading plan

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  account_balance decimal(15,2) NOT NULL DEFAULT 10000,
  starting_balance decimal(15,2) NOT NULL DEFAULT 10000,
  timezone text NOT NULL DEFAULT 'GMT+5:30',
  default_risk_percent decimal(3,1) NOT NULL DEFAULT 1,
  dark_mode boolean NOT NULL DEFAULT true,
  daily_risk_limit decimal(3,1) NOT NULL DEFAULT 6,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_auth_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  trade_date date NOT NULL,
  trade_time time NOT NULL,
  day_of_week text NOT NULL,
  session text NOT NULL CHECK (session IN ('London Close', 'NY Session', 'Asian Session')),
  account_balance decimal(15,2) NOT NULL,
  news_event boolean NOT NULL DEFAULT false,
  news_details text,
  
  -- 4H Analysis
  h4_trend text CHECK (h4_trend IN ('Bullish', 'Bearish', 'Ranging')),
  h4_poi_type text CHECK (h4_poi_type IN ('Order Block', 'FVG', 'Liquidity Pool')),
  h4_poi_price decimal(10,2),
  h4_target_price decimal(10,2),
  h4_notes text,
  
  -- 15m Confirmation
  m15_choch boolean,
  m15_choch_price decimal(10,2),
  m15_poi_type text CHECK (m15_poi_type IN ('Order Block', 'FVG', 'Both')),
  m15_poi_price decimal(10,2),
  m15_retracement boolean,
  m15_notes text,
  
  -- 1m Entry
  m1_choch boolean,
  m1_entry_type text CHECK (m1_entry_type IN ('Order Block', 'FVG', 'Fib 0.618', 'Fib 0.786', 'OB+FVG', 'FVG+Fib', 'Golden Pocket')),
  m1_entry_count integer,
  m1_notes text,
  
  -- Trade Execution
  direction text NOT NULL CHECK (direction IN ('Long', 'Short')),
  entry_price decimal(10,2) NOT NULL,
  position_size decimal(15,8) NOT NULL,
  stop_loss decimal(10,2) NOT NULL,
  take_profit decimal(10,2),
  exit_price decimal(10,2),
  risk_percent decimal(3,1) NOT NULL,
  break_even_applied boolean NOT NULL DEFAULT false,
  exit_reason text CHECK (exit_reason IN ('Hit TP', 'Hit SL', 'Manual Exit', 'BE Stop', '15min Reversal')),
  
  -- Calculated Fields
  risk_dollar decimal(15,2) NOT NULL,
  risk_reward_ratio decimal(10,3),
  pl_dollar decimal(15,2),
  pl_percent decimal(10,2),
  trade_result text CHECK (trade_result IN ('Win', 'Loss', 'Break Even')),
  trade_duration text,
  
  -- Psychology
  pre_emotion text CHECK (pre_emotion IN ('Calm', 'Anxious', 'Confident', 'Rushing', 'FOMO')),
  during_emotion text CHECK (during_emotion IN ('Patient', 'Nervous', 'Confident', 'Stressed')),
  post_feeling text CHECK (post_feeling IN ('Satisfied', 'Frustrated', 'Neutral', 'Excited')),
  plan_followed text CHECK (plan_followed IN ('100%', '90%', '75%', '50%', '<50%')),
  mistakes_made text,
  lesson_learned text,
  screenshot_url text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  total_trades integer,
  win_rate decimal(5,2),
  average_rr decimal(10,3),
  profit_factor decimal(10,3),
  best_trade_rr decimal(10,3),
  worst_trade_rr decimal(10,3),
  best_session text,
  best_entry_type text,
  insights text,
  reviewed_all_trades boolean DEFAULT false,
  identified_improvements text,
  plan_updated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly reviews"
  ON weekly_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own weekly reviews"
  ON weekly_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly reviews"
  ON weekly_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month date NOT NULL,
  process_goal text NOT NULL,
  outcome_goal text NOT NULL,
  process_progress integer DEFAULT 0,
  outcome_progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS general_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_date date NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE general_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes"
  ON general_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notes"
  ON general_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON general_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS trading_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vision text,
  rules text,
  risk_management text,
  entry_strategy text,
  exit_strategy text,
  psychology_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE trading_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trading plan"
  ON trading_plan FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own trading plan"
  ON trading_plan FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trading plan"
  ON trading_plan FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_trades_user_date ON trades(user_id, trade_date DESC);
CREATE INDEX idx_trades_user_result ON trades(user_id, trade_result);
CREATE INDEX idx_trades_user_session ON trades(user_id, session);
CREATE INDEX idx_weekly_reviews_user_date ON weekly_reviews(user_id, week_start_date DESC);
CREATE INDEX idx_goals_user_month ON goals(user_id, month DESC);
CREATE INDEX idx_notes_user_date ON general_notes(user_id, note_date DESC);
