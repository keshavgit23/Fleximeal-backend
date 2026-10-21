const pool = require("../../config/db");

const getUserActiveSubscriptions = async (clerkId) => {
  const query = `
    SELECT
      s.subscription_id,
      s.user_id,
      s.profile_id,
      s.meal_type,
      s.default_response,
      s.status,
      s.start_date,
      s.end_date,
      s.created_at,
      s.updated_at,
      mp.mess_name,
      mp.monthly_price
    FROM subscriptions s
    INNER JOIN users u
      ON u.user_id = s.user_id
    INNER JOIN mess_profiles mp
      ON mp.profile_id = s.profile_id
    WHERE u.clerk_id = $1
      AND s.status = 'ACTIVE'
    ORDER BY s.created_at DESC
  `;

  const { rows } = await pool.query(query, [clerkId]);

  return rows;
};

module.exports = {
  getUserActiveSubscriptions,
};
