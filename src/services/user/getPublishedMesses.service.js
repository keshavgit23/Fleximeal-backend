const pool = require("../../config/db");

const getPublishedMesses = async () => {
  const result = await pool.query(`
    SELECT
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
      mp.listing_status
    FROM mess_profiles mp
    WHERE mp.listing_status = 'LIVE'
    ORDER BY mp.created_at DESC
  `);

  return result.rows;
};

module.exports = {
  getPublishedMesses,
};