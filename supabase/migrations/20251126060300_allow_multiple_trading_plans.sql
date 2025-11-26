/*
  # Allow Multiple Trading Plans per User

  Remove the unique constraint on user_id to allow users to create multiple trading plans.
*/

ALTER TABLE trading_plan DROP CONSTRAINT IF EXISTS trading_plan_user_id_key;