CREATE UNIQUE INDEX IF NOT EXISTS unique_active_payment_intent
ON payments (user_id, profile_id, meal_type)
WHERE status IN ('PENDING', 'VERIFIED');