const pool = require("../config/db");

const getMessPlans = async (clerkId) => {
  const query = `
    SELECT
      mp.plan_id,
      mp.profile_id,
      mp.plan_name,
      mp.target_gender,
      mp.price,
      mp.is_active,
      mp.created_at,
      COALESCE(
        ARRAY_AGG(mpm.meal_type)
          FILTER (WHERE mpm.meal_type IS NOT NULL),
        ARRAY[]::VARCHAR[]
      ) AS meal_types
    FROM mess_plans mp
    INNER JOIN mess_profiles profile
      ON profile.profile_id = mp.profile_id
    INNER JOIN users u
      ON u.user_id = profile.user_id
    LEFT JOIN mess_plan_meals mpm
      ON mpm.plan_id = mp.plan_id
    WHERE u.clerk_id = $1
      AND u.user_role = 'mess_owner'
      AND mp.is_active = TRUE
    GROUP BY mp.plan_id
    ORDER BY mp.created_at DESC;
  `;

  const result = await pool.query(query, [clerkId]);

  return result.rows;
};

module.exports = {
  getMessPlans,
};