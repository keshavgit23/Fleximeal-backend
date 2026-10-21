
// const pool = require("../config/db");

// const getMealConfirmationsSummary = async (clerkId, mealId) => {
//   const result = await pool.query(
//     `
//     SELECT
//       COUNT(mc.confirmation_id)::int AS total,
//       COUNT(*) FILTER (
//         WHERE mc.response = 'YES'
//       )::int AS yes,
//       COUNT(*) FILTER (
//         WHERE mc.response = 'NO'
//       )::int AS no,
//       COUNT(*) FILTER (
//         WHERE mc.response = 'PENDING'
//       )::int AS pending,
//       (
//         SELECT COUNT(*)::int
//         FROM payg_bookings pb
//         WHERE pb.meal_id = m.meal_id
//           AND pb.booking_status = 'BOOKED'
//       ) AS payg
//     FROM meals m
//     INNER JOIN mess_profiles mp
//       ON mp.profile_id = m.profile_id
//     INNER JOIN users u
//       ON u.user_id = mp.user_id
//     LEFT JOIN meal_confirmations mc
//       ON mc.meal_id = m.meal_id
//     WHERE m.meal_id = $1
//       AND u.clerk_id = $2
//       AND u.user_role = 'mess_owner'
//     GROUP BY m.meal_id
//     `,
//     [mealId, clerkId]
//   );

//   if (result.rowCount === 0) {
//     const error = new Error("Meal not found");
//     error.statusCode = 404;
//     throw error;
//   }

//   const row = result.rows[0];

//   return {
//     total: row.total,
//     yes: row.yes,
//     no: row.no,
//     pending: row.pending,
//     payg: row.payg,
//   };
// };

// module.exports = {
//   getMealConfirmationsSummary,
// };

const pool = require("../config/db");

const getMealConfirmationsSummary = async (clerkId, mealId) => {
  const result = await pool.query(
    `
    SELECT
      COUNT(mc.confirmation_id) FILTER (
        WHERE mc.response = 'YES'
      )::int AS "explicitYes",

      COUNT(s.subscription_id) FILTER (
        WHERE s.default_response = 'YES'
          AND COALESCE(mc.response, 'PENDING') = 'PENDING'
      )::int AS "defaultYes",

      COUNT(mc.confirmation_id) FILTER (
        WHERE mc.response = 'NO'
      )::int AS no,

      COUNT(mc.confirmation_id) FILTER (
        WHERE mc.response = 'PENDING'
      )::int AS pending,

      (
        SELECT COUNT(*)::int
        FROM payg_bookings pb
        WHERE pb.meal_id = m.meal_id
          AND pb.booking_status = 'BOOKED'
      ) AS payg

    FROM meals m
    INNER JOIN mess_profiles mp
      ON mp.profile_id = m.profile_id
    INNER JOIN users u
      ON u.user_id = mp.user_id

    LEFT JOIN subscriptions s
      ON s.profile_id = m.profile_id
      AND s.meal_type = m.meal_type
      AND s.status = 'ACTIVE'
      AND s.start_date <= m.meal_date
      AND (s.end_date IS NULL OR s.end_date >= m.meal_date)

    LEFT JOIN meal_confirmations mc
      ON mc.meal_id = m.meal_id
      AND mc.subscription_id = s.subscription_id

    WHERE m.meal_id = $1
      AND u.clerk_id = $2
      AND u.user_role = 'mess_owner'

    GROUP BY m.meal_id
    `,
    [mealId, clerkId]
  );

  if (result.rowCount === 0) {
    const error = new Error("Meal not found");
    error.statusCode = 404;
    throw error;
  }

  const row = result.rows[0];

  const explicitYes = row.explicitYes;
  const defaultYes = row.defaultYes;
  const payg = row.payg;

  return {
    total: explicitYes + defaultYes + payg,
    explicitYes,
    defaultYes,
    no: row.no,
    pending: row.pending,
    payg,
  };
};

module.exports = {
  getMealConfirmationsSummary,
};