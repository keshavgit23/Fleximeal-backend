// 


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

      -- At least one active custom subscription plan must exist
      AND EXISTS (
        SELECT 1
        FROM mess_plans mplan
        WHERE mplan.profile_id = mp.profile_id
          AND mplan.is_active = TRUE
          AND mplan.price > 0
          AND EXISTS (
            SELECT 1
            FROM mess_plan_meals mpm
            WHERE mpm.plan_id = mplan.plan_id
          )
      )

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
