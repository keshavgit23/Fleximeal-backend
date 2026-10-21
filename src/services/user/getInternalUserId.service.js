const pool = require("../../config/db");

const getInternalUserId = async (clerkId) => {
  const result = await pool.query(
    `
      SELECT user_id
      FROM users
      WHERE clerk_id = $1
        AND user_role = 'user'
    `,
    [clerkId]
  );

  if (result.rowCount === 0) {
    throw new Error("Application user not found");
  }

  return result.rows[0].user_id;
};

module.exports = { getInternalUserId };
