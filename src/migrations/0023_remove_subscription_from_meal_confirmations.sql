ALTER TABLE meal_confirmations
DROP CONSTRAINT unique_meal_confirmation;

ALTER TABLE meal_confirmations
DROP COLUMN subscription_id;
