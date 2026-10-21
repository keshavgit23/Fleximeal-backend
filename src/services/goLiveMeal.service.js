const pool = require("../config/db");

const goLiveMeal = async (clerkId, mealId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Lock the meal and verify that it belongs to this owner.
    const existingMeal = await client.query(
      `
      SELECT
        m.meal_id,
        m.profile_id,
        m.meal_date,
        m.meal_type,
        m.status
      FROM meals m
      INNER JOIN mess_profiles mp
        ON mp.profile_id = m.profile_id
      INNER JOIN users u
        ON u.user_id = mp.user_id
      WHERE m.meal_id = $1
        AND u.clerk_id = $2
        AND u.user_role = 'mess_owner'
      FOR UPDATE OF m
      `,
      [mealId, clerkId]
    );

    if (existingMeal.rowCount === 0) {
      const error = new Error("Meal not found");
      error.statusCode = 404;
      throw error;
    }

    const meal = existingMeal.rows[0];

    if (meal.status !== "UPCOMING") {
      const error = new Error(
        `Cannot start meal with status ${meal.status}`
      );
      error.statusCode = 409;
      throw error;
    }

    // 2. Mark the meal as ACTIVE.
    const activatedMeal = await client.query(
      `
      UPDATE meals
      SET
        status = 'ACTIVE',
        updated_at = NOW()
      WHERE meal_id = $1
        AND status = 'UPCOMING'
      RETURNING meal_id, profile_id, status
      `,
      [meal.meal_id]
    );

    if (activatedMeal.rowCount === 0) {
      const error = new Error("Unable to activate meal");
      error.statusCode = 409;
      throw error;
    }

    // 3. Create PENDING confirmations for eligible subscribers.
    const confirmations = await client.query(
      `
      INSERT INTO meal_confirmations (
        meal_id,
        subscription_id,
        response
      )
      SELECT
        $1,
        s.subscription_id,
        'PENDING'
      FROM subscriptions s
      WHERE s.profile_id = $2
        AND s.meal_type = $3
        AND s.status = 'ACTIVE'
        AND s.start_date <= $4::date
        AND (
          s.end_date IS NULL
          OR s.end_date >= $4::date
        )
      ON CONFLICT (meal_id, subscription_id) DO NOTHING
      RETURNING confirmation_id
      `,
      [
        meal.meal_id,
        meal.profile_id,
        meal.meal_type,
        meal.meal_date,
      ]
    );

    // 4. Commit both operations together.
    await client.query("COMMIT");

    return {
      mealId: activatedMeal.rows[0].meal_id,
      profileId: activatedMeal.rows[0].profile_id,
      status: activatedMeal.rows[0].status,
      confirmationCount: confirmations.rowCount,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  goLiveMeal,
};
