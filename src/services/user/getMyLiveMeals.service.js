
const pool = require("../../config/db");

const getMyLiveMeals = async (clerkId) => {
  const result = await pool.query(
    `
      SELECT
        m.meal_id,
        TO_CHAR(m.meal_date, 'YYYY-MM-DD') AS meal_date,
        m.meal_type,
        m.start_time,
        m.end_time,
        m.cutoff_time,
        m.status AS meal_status,

        mp.profile_id,
        mp.mess_name,

        mc.confirmation_id,
        mc.response,

        (
          (m.meal_date + m.cutoff_time)
          AT TIME ZONE 'Asia/Kolkata'
        ) > NOW() AS response_open,

        COALESCE(
          json_agg(mi.item_name ORDER BY mi.menu_item_id)
            FILTER (WHERE mi.menu_item_id IS NOT NULL),
          '[]'::json
        ) AS menu_items

      FROM users u

      INNER JOIN subscriptions s
        ON s.user_id = u.user_id

      INNER JOIN meals m
        ON m.profile_id = s.profile_id
        AND m.meal_type = s.meal_type

      INNER JOIN mess_profiles mp
        ON mp.profile_id = m.profile_id

      INNER JOIN meal_confirmations mc
        ON mc.meal_id = m.meal_id
        AND mc.subscription_id = s.subscription_id

      LEFT JOIN meal_menu_items mi
        ON mi.meal_id = m.meal_id

      WHERE u.clerk_id = $1
        AND u.user_role = 'user'
        AND s.status = 'ACTIVE'
        AND s.start_date <= m.meal_date
        AND (
          s.end_date IS NULL
          OR s.end_date >= m.meal_date
        )
        AND m.status = 'ACTIVE'
        AND m.meal_date >=
          (NOW() AT TIME ZONE 'Asia/Kolkata')::date

      GROUP BY
        m.meal_id,
        m.meal_date,
        m.meal_type,
        m.start_time,
        m.end_time,
        m.cutoff_time,
        m.status,
        mp.profile_id,
        mp.mess_name,
        mc.confirmation_id,
        mc.response

      ORDER BY m.meal_date, m.start_time;
    `,
    [clerkId]
  );

  return result.rows.map((row) => ({
    id: String(row.meal_id),
    date: row.meal_date,
    mealType: row.meal_type,
    messId: String(row.profile_id),
    messName: row.mess_name,
    menu: row.menu_items,
    cutoffTime: row.cutoff_time,
    mealStatus: row.meal_status,
    confirmationId: row.confirmation_id,
    response: row.response,
    responseOpen: row.response_open,
  }));
};

module.exports = { getMyLiveMeals };
