ALTER TABLE subscriptions
ADD COLUMN plan_id INT
REFERENCES mess_plans(plan_id);

ALTER TABLE subscriptions
ALTER COLUMN meal_type DROP NOT NULL;

ALTER TABLE subscriptions
ADD CONSTRAINT subscription_meal_or_plan_required
CHECK (
    (plan_id IS NOT NULL AND meal_type IS NULL)
    OR
    (plan_id IS NULL AND meal_type IS NOT NULL)
);

CREATE UNIQUE INDEX unique_active_plan_subscription
ON subscriptions (user_id, profile_id, plan_id)
WHERE status = 'ACTIVE'
  AND plan_id IS NOT NULL;

ALTER TABLE payments
ADD COLUMN plan_id INT
REFERENCES mess_plans(plan_id);

ALTER TABLE payments
ALTER COLUMN meal_type DROP NOT NULL;

CREATE UNIQUE INDEX unique_active_plan_payment
ON payments (user_id, profile_id, plan_id)
WHERE status IN ('PENDING', 'VERIFIED')
  AND plan_id IS NOT NULL;