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
     FROM subscriptions s, meals m
     WHERE mc.confirmation_id = $2
       AND mc.subscription_id = s.subscription_id
       AND mc.meal_id = m.meal_id
       AND s.user_id = $3
       AND s.status = 'ACTIVE'
       AND m.status = 'ACTIVE'
       AND ((m.meal_date + m.cutoff_time)
            AT TIME ZONE 'Asia/Kolkata') > NOW()
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