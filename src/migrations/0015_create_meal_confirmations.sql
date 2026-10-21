CREATE TABLE meal_confirmations (
    confirmation_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    meal_id INT NOT NULL
        REFERENCES meals(meal_id) ON DELETE CASCADE,

    subscription_id INT NOT NULL
        REFERENCES subscriptions(subscription_id) ON DELETE CASCADE,

    response VARCHAR(10) NOT NULL DEFAULT 'PENDING'
        CHECK (response IN ('PENDING', 'YES', 'NO')),

    responded_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_meal_confirmation
        UNIQUE (meal_id, subscription_id)
);

CREATE INDEX idx_meal_confirmations_meal_response
    ON meal_confirmations (meal_id, response);