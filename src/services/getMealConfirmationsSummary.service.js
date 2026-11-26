
const pool = require("../config/db");

const getMealConfirmationsSummary = async (clerkId, mealId) => {
  const result = await pool.query(
    `
    WITH target_meal AS (
      SELECT
        m.meal_id,
        m.profile_id,
        m.meal_date,
        m.meal_type
      FROM meals m
      INNER JOIN mess_profiles mp
        ON mp.profile_id = m.profile_id
      INNER JOIN users u
        ON u.user_id = mp.user_id
      WHERE m.meal_id = $1
        AND u.clerk_id = $2
        AND u.user_role = 'mess_owner'
    ),
    booked_payg AS (
      SELECT DISTINCT
        pb.meal_id,
        pb.user_id
      FROM payg_bookings pb
      INNER JOIN target_meal tm
        ON tm.meal_id = pb.meal_id
      WHERE pb.booking_status = 'BOOKED'
    ),
    eligible_subscriptions AS (
      SELECT DISTINCT ON (tm.meal_id, s.user_id)
        tm.meal_id,
        s.user_id,
        s.subscription_id,
        s.default_response
      FROM target_meal tm
      INNER JOIN subscriptions s
        ON s.profile_id = tm.profile_id
        AND s.status = 'ACTIVE'
        AND s.start_date <= tm.meal_date
        AND (
          s.end_date IS NULL
          OR s.end_date >= tm.meal_date
        )
        AND (
          (
            s.plan_id IS NOT NULL
            AND EXISTS (
              SELECT 1
              FROM mess_plan_meals pm
              WHERE pm.plan_id = s.plan_id
                AND pm.meal_type = tm.meal_type
            )
          )
          OR
          (
            s.plan_id IS NULL
            AND s.meal_type = tm.meal_type
          )
        )
      ORDER BY tm.meal_id, s.user_id, s.subscription_id
    ),
    subscription_counts AS (
      SELECT
        es.meal_id,
        COUNT(*) FILTER (
          WHERE mc.response = 'YES'
        )::int AS "explicitYes",
        COUNT(*) FILTER (
          WHERE es.default_response = 'YES'
            AND mc.response = 'PENDING'
        )::int AS "defaultYes",
        COUNT(*) FILTER (
          WHERE mc.response = 'NO'
        )::int AS no,
        COUNT(*) FILTER (
          WHERE mc.response = 'PENDING'
        )::int AS pending
      FROM eligible_subscriptions es
      LEFT JOIN meal_confirmations mc
        ON mc.meal_id = es.meal_id
        AND mc.user_id = es.user_id
      LEFT JOIN booked_payg bp
        ON bp.meal_id = es.meal_id
        AND bp.user_id = es.user_id
      WHERE bp.user_id IS NULL
      GROUP BY es.meal_id
    ),
    payg_counts AS (
      SELECT
        meal_id,
        COUNT(DISTINCT user_id)::int AS payg
      FROM booked_payg
      GROUP BY meal_id
    )
    SELECT
      (
        COALESCE(sc."explicitYes", 0)
        + COALESCE(sc."defaultYes", 0)
        + COALESCE(pc.payg, 0)
      )::int AS total,
      COALESCE(sc."explicitYes", 0)::int AS "explicitYes",
      COALESCE(sc."defaultYes", 0)::int AS "defaultYes",
      COALESCE(sc.no, 0)::int AS no,
      COALESCE(sc.pending, 0)::int AS pending,
      COALESCE(pc.payg, 0)::int AS payg
    FROM target_meal tm
    LEFT JOIN subscription_counts sc
      ON sc.meal_id = tm.meal_id
    LEFT JOIN payg_counts pc
      ON pc.meal_id = tm.meal_id
    `,
    [mealId, clerkId]
  );

  if (result.rowCount === 0) {
    const error = new Error("Meal not found");
    error.statusCode = 404;
    throw error;
  }

  const row = result.rows[0];

  return {
    total: row.total,
    explicitYes: row.explicitYes,
    defaultYes: row.defaultYes,
    no: row.no,
    pending: row.pending,
    payg: row.payg,
  };
};

module.exports = {
  getMealConfirmationsSummary,
};