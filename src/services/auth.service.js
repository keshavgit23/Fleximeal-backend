const pool = require("../config/db");

const authenticateUserService = async (clerkId) => {
  const result = await pool.query(
    `
    SELECT
      user_id,
      clerk_id,
      user_role,
      onboarding_completed
    FROM users
    WHERE clerk_id = $1
    `,
    [clerkId]
  );

  if (result.rowCount > 0) {
    return result.rows[0];
  }

  const newUser = await pool.query(
    `
    INSERT INTO users (clerk_id)
    VALUES ($1)
    RETURNING
      user_id,
      clerk_id,
      user_role,
      onboarding_completed
    `,
    [clerkId]
  );

  return newUser.rows[0];
};

module.exports = {
  authenticateUserService,
};