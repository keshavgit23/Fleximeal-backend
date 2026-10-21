CREATE TABLE payg_prices (
    payg_price_id SERIAL PRIMARY KEY,

    profile_id INTEGER NOT NULL
        REFERENCES mess_profiles(profile_id)
        ON DELETE CASCADE,

    meal_type VARCHAR(20) NOT NULL
        CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER')),

    price NUMERIC(10, 2) NOT NULL
        CHECK (price > 0),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE (profile_id, meal_type)
);