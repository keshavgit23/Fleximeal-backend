const pool = require("../../config/db");

const getMealHistory = async (clerkId, { limit, offset }) => {
  const result = await pool.query(
    `
      SELECT
        m.meal_id,
        TO_CHAR(m.meal_date, 'YYYY-MM-DD') AS meal_date,
        m.meal_type,
        m.status,
        ((m.meal_date + m.start_time) AT TIME ZONE 'Asia/Kolkata') AS start_at,
        ((m.meal_date + m.end_time) AT TIME ZONE 'Asia/Kolkata') AS end_at,
        mp.profile_id,
        mp.mess_name,
        mc.confirmation_id,
        mc.response AS confirmation_status,
        eligible_subscription.default_response,
        payg_booking.booking_status,
        payg_price.price AS payg_price,
        COALESCE(menu.menu_items, '[]'::json) AS menu_items
      FROM users u
      INNER JOIN meals m
        ON m.status IN ('ACTIVE', 'ENDED')
       AND ((m.meal_date + m.end_time)
         AT TIME ZONE 'Asia/Kolkata') <= NOW()
      INNER JOIN mess_profiles mp
        ON mp.profile_id = m.profile_id
      LEFT JOIN meal_confirmations mc
        ON mc.meal_id = m.meal_id
       AND mc.user_id = u.user_id
      LEFT JOIN LATERAL (
        SELECT s.subscription_id, s.default_response
        FROM subscriptions s
        WHERE s.user_id = u.user_id
          AND s.profile_id = m.profile_id
          AND s.status = 'ACTIVE'
          AND s.start_date <= m.meal_date
          AND (s.end_date IS NULL OR s.end_date >= m.meal_date)
          AND (
            (
              s.plan_id IS NOT NULL
              AND EXISTS (
                SELECT 1
                FROM mess_plan_meals pm
                WHERE pm.plan_id = s.plan_id
                  AND pm.meal_type = m.meal_type
              )
            )
            OR (
              s.plan_id IS NULL
              AND s.meal_type = m.meal_type
            )
          )
        ORDER BY s.subscription_id
        LIMIT 1
      ) eligible_subscription ON TRUE
      LEFT JOIN payg_bookings payg_booking
        ON payg_booking.user_id = u.user_id
       AND payg_booking.meal_id = m.meal_id
       AND payg_booking.booking_status IN ('BOOKED', 'COLLECTED', 'NO_SHOW')
      LEFT JOIN payg_prices payg_price
        ON payg_price.profile_id = m.profile_id
       AND payg_price.meal_type = m.meal_type
      LEFT JOIN LATERAL (
        SELECT json_agg(mi.item_name ORDER BY mi.menu_item_id) AS menu_items
        FROM meal_menu_items mi
        WHERE mi.meal_id = m.meal_id
      ) menu ON TRUE
      WHERE u.clerk_id = $1
        AND u.user_role = 'user'
        AND (
          mc.confirmation_id IS NOT NULL
          OR eligible_subscription.subscription_id IS NOT NULL
          OR payg_booking.booking_id IS NOT NULL
        )
      ORDER BY m.meal_date DESC, m.start_time DESC, m.meal_id DESC
      LIMIT $2
      OFFSET $3;
    `,
    [clerkId, limit + 1, offset]
  );

  const hasMore = result.rows.length > limit;

  return {
    data: result.rows.slice(0, limit).map((row) => ({
      meal_id: row.meal_id,
      meal_date: row.meal_date,
      meal_type: row.meal_type,
      status: row.status,
      start_at: row.start_at,
      end_at: row.end_at,
      mess_id: String(row.profile_id),
      mess_name: row.mess_name,
      menu_items: row.menu_items,
      confirmation_id: row.confirmation_id,
      confirmation_status: row.confirmation_status,
      default_response: row.default_response,
      is_payg: row.booking_status !== null,
      booking_status: row.booking_status,
      payg_price: row.booking_status !== null ? row.payg_price : null,
    })),
    pagination: {
      limit,
      offset,
      hasMore,
    },
  };
};

module.exports = { getMealHistory };
