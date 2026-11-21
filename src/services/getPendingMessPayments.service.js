
const pool = require("../config/db");

const getPendingMessPayments = async (clerkId) => {
  const query = `
    SELECT
      p.payment_id,
      p.user_id,
      p.profile_id,
      p.amount,
      p.meal_type,
      p.plan_id,
      mp_plan.plan_name,
      COALESCE(
        (
          SELECT json_agg(pm.meal_type ORDER BY pm.meal_type)
          FROM mess_plan_meals pm
          WHERE pm.plan_id = p.plan_id
        ),
        '[]'::json
      ) AS meal_types,
      p.default_response,
      p.utr,
      p.proof_url,
      p.status,
      p.created_at,
      p.updated_at,
      mp.mess_name,
      u.full_name AS user_name
    FROM payments p
    INNER JOIN mess_profiles mp
      ON mp.profile_id = p.profile_id
    INNER JOIN users u
      ON u.user_id = mp.user_id
    LEFT JOIN mess_plans mp_plan
      ON mp_plan.plan_id = p.plan_id
    WHERE u.clerk_id = $1
      AND u.user_role = 'mess_owner'
      AND p.status = 'PENDING'
    ORDER BY p.created_at DESC
  `;

  const { rows } = await pool.query(query, [clerkId]);

  return rows;
};

module.exports = {
  getPendingMessPayments,
};
