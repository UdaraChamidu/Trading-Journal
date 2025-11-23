/*
  # Price Alerts Schema

  This migration adds support for cryptocurrency price alerts:

  1. New Tables
    - `price_alerts` - Store user's cryptocurrency price alerts for notifications
*/

CREATE TABLE IF NOT EXISTS price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  name text NOT NULL,
  target_price decimal(15,2) NOT NULL,
  current_price decimal(15,2) NOT NULL DEFAULT 0,
  condition text NOT NULL CHECK (condition IN ('above', 'below')),
  status text NOT NULL CHECK (status IN ('active', 'triggered', 'paused')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  triggered_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own price alerts"
  ON price_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own price alerts"
  ON price_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own price alerts"
  ON price_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own price alerts"
  ON price_alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_symbol ON price_alerts(symbol);
CREATE INDEX idx_price_alerts_status ON price_alerts(status);