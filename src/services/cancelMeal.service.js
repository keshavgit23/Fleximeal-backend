
const pool = require("../config/db");

const cancelMeal = async (clerkId, mealId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Lock the meal and verify ownership.
    const existingMeal = await client.query(
      `
      SELECT m.meal_id, m.status
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

    // 2. Only ACTIVE meals can be cancelled here.
    if (meal.status !== "ACTIVE") {
      const error = new Error(
        `Cannot cancel meal with status ${meal.status}`
      );
      error.statusCode = 409;
      throw error;
    }

    // 3. Cancel the meal without deleting its history.
    const result = await client.query(
      `
      UPDATE meals
      SET
        status = 'CANCELLED',
        updated_at = NOW()
      WHERE meal_id = $1
        AND status = 'ACTIVE'
      RETURNING meal_id, status
      `,
      [meal.meal_id]
    );

    if (result.rowCount === 0) {
      const error = new Error("Unable to cancel meal");
      error.statusCode = 409;
      throw error;
    }

    await client.query("COMMIT");

    return {
      mealId: result.rows[0].meal_id,
      status: result.rows[0].status,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { cancelMeal };
