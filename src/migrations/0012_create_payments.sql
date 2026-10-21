-- 0012_create_payments.sql

CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,

    user_id TEXT NOT NULL,

    profile_id INTEGER NOT NULL
        REFERENCES mess_profiles(profile_id)
        ON DELETE RESTRICT,

    amount NUMERIC(10, 2) NOT NULL
        CHECK (amount > 0),

    meal_type VARCHAR(20) NOT NULL
        CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER')),

    default_response VARCHAR(3) NOT NULL
        CHECK (default_response IN ('YES', 'NO')),

    utr VARCHAR(100) NOT NULL,

    proof_url TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),

    verified_by TEXT,

    verified_at TIMESTAMPTZ,

    rejection_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);