CREATE TABLE meals (
    meal_id SERIAL PRIMARY KEY,

    profile_id INTEGER NOT NULL
        REFERENCES mess_profiles(profile_id)
        ON DELETE CASCADE,

    meal_date DATE NOT NULL,

    meal_type VARCHAR(20) NOT NULL
        CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER')),

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    cutoff_time TIME NOT NULL,

    pay_as_you_go BOOLEAN NOT NULL DEFAULT FALSE,

    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING'
        CHECK (status IN ('UPCOMING', 'ACTIVE', 'ENDED', 'CANCELLED')),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_meal_per_type_per_day
        UNIQUE (profile_id, meal_date, meal_type),

    CONSTRAINT valid_meal_time
        CHECK (end_time > start_time)
);