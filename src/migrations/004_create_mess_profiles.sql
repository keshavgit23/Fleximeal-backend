CREATE TABLE mess_profiles (
    profile_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    mess_name VARCHAR(255) NOT NULL,
    mess_address VARCHAR(500) NOT NULL,
    mess_city VARCHAR(255) NOT NULL,
    mess_state VARCHAR(255) NOT NULL,

    CONSTRAINT fk_mess_profiles_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);