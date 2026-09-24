const pool = require("../config/db");

const getMessPartnerSetup = async (clerkId) => {
  const result = await pool.query(
    `
    SELECT
      u.user_id,
      u.full_name,
      u.phone,
      u.avatar_url,

      mp.profile_id,
      mp.mess_name,
      mp.mess_address,
      mp.mess_city,
      mp.mess_state,

      mp.monthly_price,
      mp.description,
      mp.food_type,
      mp.offers_breakfast,
      mp.offers_lunch,
      mp.offers_dinner,
      mp.photo_url,
      mp.listing_status,
      mp.published_at
    FROM users u
    INNER JOIN mess_profiles mp
      ON mp.user_id = u.user_id
    WHERE u.clerk_id = $1
      AND u.user_role = 'mess_owner'
    `,
    [clerkId]
  );

  if (result.rowCount === 0) {
    throw new Error("Mess owner profile not found");
  }

  const row = result.rows[0];

  const profileCompleted =
    Boolean(row.description?.trim()) &&
    Boolean(row.food_type) &&
    (
      row.offers_breakfast ||
      row.offers_lunch ||
      row.offers_dinner
    );
  return {
    user: {
      userId: row.user_id,
      fullName: row.full_name,
      phone: row.phone,
      avatarUrl: row.avatar_url,
    },

    mess: {
      profileId: row.profile_id,
      name: row.mess_name,
      address: row.mess_address,
      city: row.mess_city,
      state: row.mess_state,

      monthlyPrice: row.monthly_price,
      description: row.description,
      foodType: row.food_type,

      offersBreakfast: row.offers_breakfast,
      offersLunch: row.offers_lunch,
      offersDinner: row.offers_dinner,

      listingStatus: row.listing_status,
      publishedAt: row.published_at,

      profileCompleted,
      photoUrl: row.photo_url,
    },
  };
};

module.exports = {
  getMessPartnerSetup,
};