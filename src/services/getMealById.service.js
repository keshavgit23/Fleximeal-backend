const pool = require("../config/db");

const getMealById = async ({ clerkId, mealId }) => {
  const result = await pool.query(
    `
    SELECT
      m.meal_id,
      m.profile_id,
      m.meal_date,
      m.meal_type,
      m.start_time,
      m.end_time,
      m.cutoff_time,
      m.pay_as_you_go,
      m.status,

      COALESCE(
        json_agg(
          json_build_object(
            'menuItemId', mi.menu_item_id,
            'itemName', mi.item_name
          )
          ORDER BY mi.menu_item_id
        ) FILTER (WHERE mi.menu_item_id IS NOT NULL),
        '[]'::json
      ) AS menu_items

    FROM meals m

    INNER JOIN mess_profiles mp
      ON mp.profile_id = m.profile_id

    INNER JOIN users u
      ON u.user_id = mp.user_id

    LEFT JOIN meal_menu_items mi
      ON mi.meal_id = m.meal_id

    WHERE m.meal_id = $1
      AND u.clerk_id = $2
      AND u.user_role = 'mess_owner'

    GROUP BY
      m.meal_id,
      m.profile_id,
      m.meal_date,
      m.meal_type,
      m.start_time,
      m.end_time,
      m.cutoff_time,
      m.pay_as_you_go,
      m.status
    `,
    [mealId, clerkId]
  );

  if (result.rowCount === 0) {
    throw new Error("Meal not found");
  }

  const row = result.rows[0];

  return {
    mealId: row.meal_id,
    profileId: row.profile_id,
    mealDate: row.meal_date,
    mealType: row.meal_type,
    startTime: row.start_time,
    endTime: row.end_time,
    cutoffTime: row.cutoff_time,
    payAsYouGo: row.pay_as_you_go,
    status: row.status,
    menuItems: row.menu_items,
  };
};

module.exports = {
  getMealById,
};