-- payments.user_id currently stores Clerk IDs as TEXT.
-- Convert those values to the application-level users.user_id.

UPDATE payments p
SET user_id = u.user_id::TEXT
FROM users u
WHERE p.user_id = u.clerk_id;


-- Change payments.user_id from TEXT to the application-level INT ID.
ALTER TABLE payments
ALTER COLUMN user_id TYPE INT
USING user_id::INT;


-- Enforce the application-level relationship.
ALTER TABLE payments
ADD CONSTRAINT fk_payments_user
FOREIGN KEY (user_id)
REFERENCES users(user_id)
ON DELETE CASCADE;
