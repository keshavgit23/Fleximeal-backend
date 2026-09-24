const pool = require("../config/db");

const updateMessPhoto = async (clerkId, photoUrl) => {
  const result = await pool.query(
    `
    UPDATE mess_profiles mp
    SET photo_url = $1
    FROM users u
    WHERE mp.user_id = u.user_id
      AND u.clerk_id = $2
      AND u.user_role = 'mess_owner'
    RETURNING
      mp.profile_id,
      mp.photo_url
    `,
    [photoUrl, clerkId]
  );

  if (result.rowCount === 0) {
    throw new Error("MESS_PARTNER_PROFILE_NOT_FOUND");
  }

  const row = result.rows[0];

  return {
    profileId: row.profile_id,
    photoUrl: row.photo_url,
  };
};

module.exports = {
  updateMessPhoto,
};