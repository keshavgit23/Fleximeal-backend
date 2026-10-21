CREATE TABLE subscriptions (
    subscription_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INT NOT NULL,
    profile_id INT NOT NULL,

    meal_type VARCHAR(20) NOT NULL
        CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER')),

    default_response VARCHAR(3) NOT NULL DEFAULT 'YES'
        CHECK (default_response IN ('YES', 'NO')),

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'CANCELLED')),

    start_date DATE NOT NULL,
    end_date DATE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_subscriptions_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_subscriptions_mess
        FOREIGN KEY (profile_id)
        REFERENCES mess_profiles(profile_id)
        ON DELETE CASCADE,

    CONSTRAINT valid_subscription_dates
        CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE UNIQUE INDEX unique_active_subscription
ON subscriptions (user_id, profile_id, meal_type)
WHERE status = 'ACTIVE';