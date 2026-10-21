
// const pool = require("../../config/db");

// const getPaygMeals = async () => {
//   const result = await pool.query(`
//     SELECT
//       mp.profile_id,
//       mp.mess_name,
//       mp.mess_address,
//       mp.mess_city,
//       mp.mess_state,
//       mp.food_type,
//       mp.photo_url,

//       m.meal_id,
//       m.meal_date,
//       m.meal_type,
//       m.start_time,
//       m.end_time,
//       m.cutoff_time,
//       m.status,

//       pp.price

//     FROM meals m

//     INNER JOIN mess_profiles mp
//       ON mp.profile_id = m.profile_id

//     INNER JOIN payg_prices pp
//       ON pp.profile_id = m.profile_id
//       AND pp.meal_type = m.meal_type

//     WHERE
//       mp.listing_status = 'LIVE'
//       AND m.pay_as_you_go = TRUE
//       AND m.status IN ('UPCOMING', 'ACTIVE')
//       AND m.meal_date >= CURRENT_DATE

//     ORDER BY
//       m.meal_date ASC,
//       m.start_time ASC,
//       mp.mess_name ASC
//   `);

//   return result.rows;
// };

// module.exports = {
//   getPaygMeals,
// };


const pool = require("../../config/db");

const getPaygMeals = async () => {
  const result = await pool.query(`
    SELECT
      mp.profile_id,
      mp.mess_name,
      mp.mess_address,
      mp.mess_city,
      mp.mess_state,
      mp.food_type,
      mp.photo_url,

      m.meal_id,
      m.meal_date,
      m.meal_type,
      m.start_time,
      m.end_time,
      m.cutoff_time,
      m.status,

      pp.price,

      COALESCE(
        (
          SELECT json_agg(
            mmi.item_name ORDER BY mmi.item_name
          )
          FROM meal_menu_items mmi
          WHERE mmi.meal_id = m.meal_id
        ),
        '[]'::json
      ) AS menu_items

    FROM meals m

    INNER JOIN mess_profiles mp
      ON mp.profile_id = m.profile_id

    INNER JOIN payg_prices pp
      ON pp.profile_id = m.profile_id
      AND pp.meal_type = m.meal_type

    WHERE
      mp.listing_status = 'LIVE'
      AND m.pay_as_you_go = TRUE
      AND m.status IN ('UPCOMING', 'ACTIVE')
      AND m.cutoff_time IS NOT NULL
      AND (
        m.meal_date + m.cutoff_time
      ) > (
        CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
      )

    ORDER BY
      m.meal_date ASC,
      m.start_time ASC,
      mp.mess_name ASC
  `);

  return result.rows;
};

module.exports = { getPaygMeals };
