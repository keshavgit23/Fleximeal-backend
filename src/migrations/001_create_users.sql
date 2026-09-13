CREATE TYPE user_role AS ENUM (
    'admin',
    'mess_owner',
    'user'
);

CREATE TABLE users (
    user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    user_role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);