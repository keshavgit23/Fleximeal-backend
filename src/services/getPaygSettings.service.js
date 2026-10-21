
const pool = require("../config/db");

const getPaygSettings = async ({ clerkId }) => {
  const result = await pool.query(
    `
    SELECT
      mp.profile_id,
      p.meal_type,
      p.price,
      p.updated_at
    FROM mess_profiles mp
    INNER JOIN users u
      ON u.user_id = mp.user_id
    LEFT JOIN payg_prices p
      ON p.profile_id = mp.profile_id
    WHERE u.clerk_id = $1
      AND u.user_role = 'mess_owner'
    LIMIT 1
    `,
    [clerkId]
  );

  if (result.rowCount === 0) {
    throw new Error("Mess owner profile not found");
  }

  const profileId = result.rows[0].profile_id;

  // Initialize all meal types, including unconfigured prices.
  const prices = {
    BREAKFAST: null,
    LUNCH: null,
    DINNER: null,
  };

  let updatedAt = null;

  for (const row of result.rows) {
    if (row.meal_type) {
      prices[row.meal_type] = row.price;
      if (!updatedAt || row.updated_at > updatedAt) {
        updatedAt = row.updated_at;
      }
    }
  }

  return {
    profileId,
    prices,
    updatedAt,
  };
};

module.exports = {
  getPaygSettings,
};
