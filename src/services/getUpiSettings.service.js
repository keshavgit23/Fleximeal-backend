
const pool = require("../config/db");

const getUpiSettings = async ({ clerkId }) => {
  const result = await pool.query(
    `
    SELECT mp.upi_id
    FROM mess_profiles mp
    INNER JOIN users u
      ON u.user_id = mp.user_id
    WHERE u.clerk_id = $1
      AND u.user_role = 'mess_owner'
    LIMIT 1
    `,
    [clerkId]
  );

  if (result.rowCount === 0) {
    throw new Error("Mess owner profile not found");
  }

  return {
    upi_id: result.rows[0].upi_id,
  };
};

module.exports = {
  getUpiSettings,
};
