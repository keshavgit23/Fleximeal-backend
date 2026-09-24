const pool = require("../config/db");

const updateMessProfile = async (
  clerkId,
  {
    description,
    foodType,
    offersBreakfast,
    offersLunch,
    offersDinner,
  }
) => {
  const result = await pool.query(
    `
    UPDATE mess_profiles mp
    SET
      description = $1,
      food_type = $2,
      offers_breakfast = $3,
      offers_lunch = $4,
      offers_dinner = $5
    FROM users u
    WHERE mp.user_id = u.user_id
      AND u.clerk_id = $6
      AND u.user_role = 'mess_owner'
    RETURNING
      mp.profile_id,
      mp.description,
      mp.food_type,
      mp.offers_breakfast,
      mp.offers_lunch,
      mp.offers_dinner
    `,
    [
      description,
      foodType,
      offersBreakfast,
      offersLunch,
      offersDinner,
      clerkId,
    ]
  );

  if (result.rowCount === 0) {
    throw new Error("Mess owner profile not found");
  }

  const row = result.rows[0];

  return {
    profileId: row.profile_id,
    description: row.description,
    foodType: row.food_type,
    offersBreakfast: row.offers_breakfast,
    offersLunch: row.offers_lunch,
    offersDinner: row.offers_dinner,
  };
};

module.exports = {
  updateMessProfile,
};