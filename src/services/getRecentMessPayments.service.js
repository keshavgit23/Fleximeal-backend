const pool = require("../config/db");

const getRecentMessPayments = async (clerkId) => {
  const query = `
    SELECT
      p.payment_id,
      p.user_id,
      p.profile_id,
      p.amount,
      p.meal_type,
      p.default_response,
      p.utr,
      p.proof_url,
      p.status,
      p.verified_by,
      p.verified_at,
      p.rejection_reason,
      p.created_at,
      p.updated_at,
      mp.mess_name
    FROM payments p
    INNER JOIN mess_profiles mp
      ON mp.profile_id = p.profile_id
    INNER JOIN users u
      ON u.user_id = mp.user_id
    WHERE u.clerk_id = $1
      AND u.user_role = 'mess_owner'
      AND p.created_at >= NOW() - INTERVAL '24 hours'
    ORDER BY p.created_at DESC
  `;

  const { rows } = await pool.query(query, [clerkId]);

  return rows;
};

module.exports = {
  getRecentMessPayments,
};