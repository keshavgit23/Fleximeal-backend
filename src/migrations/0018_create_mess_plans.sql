CREATE TABLE mess_plans (
    plan_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    profile_id INT NOT NULL
        REFERENCES mess_profiles(profile_id)
        ON DELETE CASCADE,

    plan_name VARCHAR(100) NOT NULL,

    target_gender VARCHAR(10) NOT NULL
        CHECK (target_gender IN ('MALE', 'FEMALE', 'ALL')),

    price NUMERIC(10, 2) NOT NULL
        CHECK (price > 0),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);