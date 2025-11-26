/*
  # Expand Trading Plan Schema

  Add more fields to the trading_plan table to support detailed editing of all plan sections.
*/

ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS plan_title text DEFAULT 'BTC ICT Trading Plan';
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS plan_version text DEFAULT '1.0';
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS plan_status text DEFAULT 'Practice/Learning Phase';
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS starting_capital decimal(15,2) DEFAULT 100;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS risk_per_trade text DEFAULT '1-2%';
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS primary_asset text DEFAULT 'BTC/USD';
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS trading_style text DEFAULT 'Multi-timeframe ICT (Smart Money Concepts)';

-- Methodology sections
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS h4_analysis text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS m15_confirmation text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS m1_execution text;

-- Management sections
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS entry_rules text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS special_entries text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS position_size_formula text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS stop_loss_placement text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS take_profit_strategy text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS risk_reward_expectations text;

-- Schedule
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS trading_schedule text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS optimal_hours text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS news_considerations text;

-- Checklists
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS pre_trade_checklist text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS h4_checklist text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS m15_checklist text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS m1_checklist text;

-- Psychology
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS mental_rules text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS red_flags text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS green_flags text;

-- Improvement
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS weekly_review text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS monthly_review text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS tracking_items text;

-- Warnings
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS risk_warnings text;

-- Metrics
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS process_goals text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS outcome_goals text;

-- Notes
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS final_notes text;
ALTER TABLE trading_plan ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;