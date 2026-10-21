CREATE TABLE payg_bookings (
    booking_id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    meal_id INTEGER NOT NULL
        REFERENCES meals(meal_id)
        ON DELETE CASCADE,

    booking_status VARCHAR(20) NOT NULL DEFAULT 'BOOKED'
        CHECK (
            booking_status IN (
                'BOOKED',
                'COLLECTED',
                'NO_SHOW',
                'CANCELLED'
            )
        ),

    booked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_user_payg_meal
        UNIQUE (user_id, meal_id)
);

CREATE INDEX idx_payg_bookings_meal_status
    ON payg_bookings(meal_id, booking_status);

CREATE INDEX idx_payg_bookings_user
    ON payg_bookings(user_id);