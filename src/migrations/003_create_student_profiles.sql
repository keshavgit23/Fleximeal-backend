CREATE TABLE student_profiles (
    profile_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    college_name VARCHAR(255) NOT NULL,
    college_city VARCHAR(255) NOT NULL,
    dietary_preference VARCHAR(50) NOT NULL,

    CONSTRAINT fk_student_profiles_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);