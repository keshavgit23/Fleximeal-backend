const pool = require("../../config/db");

const newSubscription = async ({
  userId,
  profileId,
  mealType,
  defaultResponse,
}) => {
  // 1. Check that the mess exists and is LIVE
  const messResult = await pool.query(
    `
      SELECT
        profile_id,
        offers_breakfast,
        offers_lunch,
        offers_dinner
      FROM mess_profiles
      WHERE profile_id = $1
        AND listing_status = 'LIVE'
    `,
    [profileId]
  );

  if (messResult.rows.length === 0) {
    throw new Error("Mess not found or is not currently live");
  }

  const mess = messResult.rows[0];

  // 2. Check whether this meal is offered by the mess
  const mealAvailability = {
    breakfast: mess.offers_breakfast,
    lunch: mess.offers_lunch,
    dinner: mess.offers_dinner,
  };

  if (!mealAvailability[mealType]) {
    throw new Error(
      `${mealType} is not available at this mess`
    );
  }

  // 3. Check for an existing active subscription
  const existingSubscription = await pool.query(
    `
      SELECT subscription_id
      FROM subscriptions
      WHERE user_id = $1
        AND profile_id = $2
        AND meal_type = $3
        AND status = 'ACTIVE'
      LIMIT 1
    `,
    [userId, profileId, mealType]
  );

  if (existingSubscription.rows.length > 0) {
    throw new Error(
      "You already have an active subscription for this meal"
    );
  }

  // 4. Create subscription
  const result = await pool.query(
    `
      INSERT INTO subscriptions (
        user_id,
        profile_id,
        meal_type,
        default_response,
        status
      )
      VALUES ($1, $2, $3, $4, 'ACTIVE')
      RETURNING
        subscription_id,
        user_id,
        profile_id,
        meal_type,
        default_response,
        status,
        start_date,
        end_date,
        created_at
    `,
    [
      userId,
      profileId,
      mealType,
      defaultResponse,
    ]
  );

  return result.rows[0];
};

module.exports = {
  newSubscription,
};