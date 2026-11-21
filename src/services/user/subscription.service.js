
const pool = require("../../config/db");

const getUserActiveSubscriptions = async (clerkId) => {
  const query = `
    SELECT
      s.subscription_id,
      s.user_id,
      s.profile_id,
      s.meal_type,
      s.plan_id,
      s.default_response,
      s.status,
      s.start_date,
      s.end_date,
      s.created_at,
      s.updated_at,
      mp.mess_name,
      COALESCE(mp_plan.price, mp.monthly_price) AS monthly_price,
      mp_plan.plan_name,
      COALESCE(
        (
          SELECT json_agg(pm.meal_type ORDER BY pm.meal_type)
          FROM mess_plan_meals pm
          WHERE pm.plan_id = s.plan_id
        ),
        '[]'::json
      ) AS meal_types
    FROM subscriptions s
    INNER JOIN users u
      ON u.user_id = s.user_id
    INNER JOIN mess_profiles mp
      ON mp.profile_id = s.profile_id
    LEFT JOIN mess_plans mp_plan
      ON mp_plan.plan_id = s.plan_id
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
