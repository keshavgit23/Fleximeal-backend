
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
      mp.upi_id,
      mp.listing_status,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'plan_id', p.plan_id,
              'plan_name', p.plan_name,
              'target_gender', p.target_gender,
              'price', p.price,
              'meal_types', (
                SELECT COALESCE(
                  json_agg(pm.meal_type ORDER BY pm.meal_type),
                  '[]'::json
                )
                FROM mess_plan_meals pm
                WHERE pm.plan_id = p.plan_id
              )
            )
            ORDER BY p.created_at DESC
          )
          FROM mess_plans p
          WHERE p.profile_id = mp.profile_id
            AND p.is_active = true
        ),
        '[]'::json
      ) AS plans

    FROM mess_profiles mp
    WHERE mp.listing_status = 'LIVE'
    ORDER BY mp.created_at DESC
  `);

  return result.rows;
};

module.exports = {
  getPublishedMesses,
};