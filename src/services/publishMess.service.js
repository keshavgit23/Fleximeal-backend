const pool = require("../config/db");

const publishMess = async (clerkId) => {
  const result = await pool.query(
    `
    UPDATE mess_profiles mp
    SET
      listing_status = 'LIVE',
      published_at = NOW()
    FROM users u
    WHERE mp.user_id = u.user_id
      AND u.clerk_id = $1
      AND u.user_role = 'mess_owner'

      -- Monthly price must be configured
      AND mp.monthly_price IS NOT NULL
      AND mp.monthly_price > 0

      -- Mess profile must be complete
      AND NULLIF(TRIM(mp.description), '') IS NOT NULL
      AND mp.food_type IS NOT NULL

      -- At least one meal must be available
      AND (
        mp.offers_breakfast = TRUE
        OR mp.offers_lunch = TRUE
        OR mp.offers_dinner = TRUE
      )

    RETURNING
      mp.profile_id,
      mp.listing_status,
      mp.published_at
    `,
    [clerkId]
  );

  if (result.rowCount === 0) {
    throw new Error("MESS_NOT_READY_TO_PUBLISH");
  }

  const row = result.rows[0];

  return {
    profileId: row.profile_id,
    listingStatus: row.listing_status,
    publishedAt: row.published_at,
  };
};

module.exports = {
  publishMess,
};