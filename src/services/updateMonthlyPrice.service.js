const pool = require("../config/db");

const updateMonthlyPrice = async (clerkId, monthlyPrice) => {
  const result = await pool.query(
    `
    UPDATE mess_profiles mp
    SET monthly_price = $1
    FROM users u
    WHERE mp.user_id = u.user_id
      AND u.clerk_id = $2
      AND u.user_role = 'mess_owner'
    RETURNING
      mp.profile_id,
      mp.monthly_price
    `,
    [monthlyPrice, clerkId]
  );

  if (result.rowCount === 0) {
    throw new Error("Mess owner profile not found");
  }

  return {
    profileId: result.rows[0].profile_id,
    monthlyPrice: result.rows[0].monthly_price,
  };
};

module.exports = {
  updateMonthlyPrice,
};