const pool = require("../../config/db");

const getUserProfile = async (clerkId) => {
  const query = `
    SELECT
      user_id,
      full_name,
      phone,
      avatar_url,
      user_role,
      created_at
    FROM users
    WHERE clerk_id = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [clerkId]);

  if (rows.length === 0) {
    throw new Error("User not found");
  }

  return rows[0];
};

module.exports = {
  getUserProfile,
};
