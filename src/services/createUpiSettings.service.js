
const pool = require("../config/db");

const createUpiSettings = async ({ clerkId, upiId }) => {
  if (
    typeof upiId !== "string" ||
    !upiId.trim() ||
    upiId.trim().length > 255 ||
    !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(upiId.trim())
  ) {
    throw new Error("A valid UPI ID is required");
  }

  const result = await pool.query(
    `
    UPDATE mess_profiles mp
    SET upi_id = $1
    FROM users u
    WHERE mp.user_id = u.user_id
      AND u.clerk_id = $2
      AND u.user_role = 'mess_owner'
    RETURNING mp.upi_id
    `,
    [upiId.trim(), clerkId]
  );

  if (result.rowCount === 0) {
    throw new Error("Mess owner profile not found");
  }

  return {
    upi_id: result.rows[0].upi_id,
  };
};

module.exports = {
  createUpiSettings,
};
