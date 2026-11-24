ALTER TABLE meal_confirmations
ADD COLUMN user_id INT;

UPDATE meal_confirmations mc
SET user_id = s.user_id
FROM subscriptions s
WHERE s.subscription_id = mc.subscription_id;

DO $$
DECLARE
  conflicting_confirmations TEXT;
BEGIN
  SELECT string_agg(
    format(
      'meal_id=%s user_id=%s confirmation_ids=[%s] responses=[%s]',
      conflicts.meal_id,
      conflicts.user_id,
      conflicts.confirmation_ids,
      conflicts.responses
    ),
    E'\n'
  )
  INTO conflicting_confirmations
  FROM (
    SELECT
      mc.meal_id,
      mc.user_id,
      string_agg(mc.confirmation_id::TEXT, ', ' ORDER BY mc.confirmation_id)
        AS confirmation_ids,
      string_agg(DISTINCT mc.response, ', ' ORDER BY mc.response)
        AS responses
    FROM meal_confirmations mc
    GROUP BY mc.meal_id, mc.user_id
    HAVING COUNT(DISTINCT mc.response)
      FILTER (WHERE mc.response IN ('YES', 'NO')) > 1
    ORDER BY mc.meal_id, mc.user_id
    LIMIT 20
  ) conflicts;

  IF conflicting_confirmations IS NOT NULL THEN
    RAISE EXCEPTION
      'Conflicting explicit meal confirmations require manual review before migration: %',
      conflicting_confirmations;
  END IF;
END
$$;

WITH ranked_confirmations AS (
  SELECT
    confirmation_id,
    ROW_NUMBER() OVER (
      PARTITION BY meal_id, user_id
      ORDER BY
        CASE WHEN response = 'PENDING' THEN 1 ELSE 0 END,
        responded_at NULLS LAST,
        created_at,
        confirmation_id
    ) AS row_number
  FROM meal_confirmations
)
DELETE FROM meal_confirmations mc
USING ranked_confirmations ranked
WHERE mc.confirmation_id = ranked.confirmation_id
  AND ranked.row_number > 1;

ALTER TABLE meal_confirmations
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE meal_confirmations
ADD CONSTRAINT fk_meal_confirmations_user
FOREIGN KEY (user_id)
REFERENCES users(user_id)
ON DELETE CASCADE;

ALTER TABLE meal_confirmations
ADD CONSTRAINT unique_meal_user_confirmation
UNIQUE (meal_id, user_id);
