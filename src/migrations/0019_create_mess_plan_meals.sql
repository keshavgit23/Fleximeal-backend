CREATE TABLE mess_plan_meals (
    plan_id INT NOT NULL
        REFERENCES mess_plans(plan_id)
        ON DELETE CASCADE,

    meal_type VARCHAR(20) NOT NULL
        CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER')),

    PRIMARY KEY (plan_id, meal_type)
);