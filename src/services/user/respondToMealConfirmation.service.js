const pool = require("../../config/db");

const respondToMealConfirmation = async (
  userId,
  confirmationId,
  response
) => {
  if (!["YES", "NO"].includes(response)) {
    throw new Error("Response must be YES or NO");
  }

  const result = await pool.query(
    `UPDATE meal_confirmations mc
     SET response = $1,
         responded_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     FROM meals m
     WHERE mc.confirmation_id = $2
       AND mc.meal_id = m.meal_id
       AND mc.user_id = $3
       AND m.status = 'ACTIVE'
       AND ((m.meal_date + m.cutoff_time)
            AT TIME ZONE 'Asia/Kolkata') > NOW()
       AND EXISTS (
         SELECT 1
         FROM subscriptions s
         WHERE s.user_id = mc.user_id
           AND s.profile_id = m.profile_id
           AND s.status = 'ACTIVE'
           AND s.start_date <= m.meal_date
           AND (
             s.end_date IS NULL
             OR s.end_date >= m.meal_date
           )
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
             OR
             (
               s.plan_id IS NULL
               AND s.meal_type = m.meal_type
             )
           )
       )
     RETURNING
       mc.confirmation_id,
       mc.meal_id,
       mc.response,
       mc.responded_at`,
    [response, confirmationId, userId]
  );

  if (result.rowCount === 0) {
    throw new Error(
      "Confirmation not found, response window closed, or meal unavailable"
    );
  }

  return result.rows[0];
};

module.exports = { respondToMealConfirmation };