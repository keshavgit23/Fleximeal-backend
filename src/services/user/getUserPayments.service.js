// const pool = require("../../config/db");

// const getUserPayments = async (userId) => {
//   const query = `
//     SELECT
//       p.payment_id,
//       p.user_id,
//       p.profile_id,
//       p.amount,
//       p.meal_type,
//       p.default_response,
//       p.utr,
//       p.proof_url,
//       p.status,
//       p.verified_by,
//       p.verified_at,
//       p.rejection_reason,
//       p.created_at,
//       p.updated_at,
//       mp.mess_name
//     FROM payments p
//     INNER JOIN mess_profiles mp
//       ON mp.profile_id = p.profile_id
//     WHERE p.user_id = $1
//     ORDER BY p.created_at DESC
//   `;

//   const { rows } = await pool.query(query, [userId]);

//   return rows;
// };

// module.exports = {
//   getUserPayments,
// };

const pool = require("../../config/db");

const getUserPayments = async (clerkId) => {
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
    INNER JOIN users u
      ON u.user_id = p.user_id
    INNER JOIN mess_profiles mp
      ON mp.profile_id = p.profile_id
    WHERE u.clerk_id = $1
    ORDER BY p.created_at DESC
  `;

  const { rows } = await pool.query(query, [clerkId]);

  return rows;
};

module.exports = {
  getUserPayments,
};
