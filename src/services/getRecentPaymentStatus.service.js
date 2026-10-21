const pool = require("../config/db");

const getRecentPaymentStatus = async (clerkId) => {
  const query = `
    SELECT
      COUNT(*)::int AS pending_count
    FROM payments p
    INNER JOIN mess_profiles mp
      ON mp.profile_id = p.profile_id
    INNER JOIN users owner
      ON owner.user_id = mp.user_id
    WHERE owner.clerk_id = $1
      AND owner.user_role = 'mess_owner'
      AND p.status = 'PENDING'
      AND p.created_at >= NOW() - INTERVAL '24 hours'
  `;

  const { rows } = await pool.query(query, [clerkId]);

  const pendingCount = rows[0].pending_count;

  return {
    hasRecentPayments: pendingCount > 0,
    pendingCount,
  };
};

module.exports = {
  getRecentPaymentStatus,
};