ALTER TABLE meals
DROP CONSTRAINT unique_meal_per_type_per_day;

CREATE UNIQUE INDEX unique_meal_per_type_per_day
ON meals (profile_id, meal_date, meal_type)
WHERE status <> 'CANCELLED';