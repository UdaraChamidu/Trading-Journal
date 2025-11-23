export interface UserProfile {
  id: string;
  account_balance: number;
  starting_balance: number;
  timezone: string;
  default_risk_percent: number;
  dark_mode: boolean;
  daily_risk_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  trade_date: string;
  trade_time: string;
  day_of_week: string;
  session: 'London Close' | 'NY Session' | 'Asian Session';
  account_balance: number;
  news_event: boolean;
  news_details?: string;
  h4_trend?: 'Bullish' | 'Bearish' | 'Ranging';
  h4_poi_type?: 'Order Block' | 'FVG' | 'Liquidity Pool';
  h4_poi_price?: number;
  h4_target_price?: number;
  h4_notes?: string;
  m15_choch?: boolean;
  m15_choch_price?: number;
  m15_poi_type?: 'Order Block' | 'FVG' | 'Both';
  m15_poi_price?: number;
  m15_retracement?: boolean;
  m15_notes?: string;
  m1_choch?: boolean;
  m1_entry_type?: string;
  m1_entry_count?: number;
  m1_notes?: string;
  direction: 'Long' | 'Short';
  entry_price: number;
  position_size: number;
  stop_loss: number;
  take_profit?: number;
  exit_price?: number;
  risk_percent: number;
  break_even_applied: boolean;
  exit_reason?: string;
  risk_dollar: number;
  risk_reward_ratio?: number;
  pl_dollar?: number;
  pl_percent?: number;
  trade_result?: 'Win' | 'Loss' | 'Break Even';
  trade_duration?: string;
  pre_emotion?: string;
  during_emotion?: string;
  post_feeling?: string;
  plan_followed?: string;
  mistakes_made?: string;
  lesson_learned?: string;
  screenshot_url?: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  total_trades?: number;
  win_rate?: number;
  average_rr?: number;
  profit_factor?: number;
  best_trade_rr?: number;
  worst_trade_rr?: number;
  best_session?: string;
  best_entry_type?: string;
  insights?: string;
  reviewed_all_trades: boolean;
  identified_improvements?: string;
  plan_updated: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  month: string;
  process_goal: string;
  outcome_goal: string;
  process_progress: number;
  outcome_progress: number;
  created_at: string;
  updated_at: string;
}

export interface GeneralNote {
  id: string;
  user_id: string;
  note_date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TradingPlan {
  id: string;
  user_id: string;
  vision?: string;
  rules?: string;
  risk_management?: string;
  entry_strategy?: string;
  exit_strategy?: string;
  psychology_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
