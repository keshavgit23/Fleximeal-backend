const pool = require("../config/db");

const updateMeal = async ({
  clerkId,
  mealId,
  mealDate,
  mealType,
  startTime,
  endTime,
  cutoffTime,
  payAsYouGo,
  menuItems,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Verify meal belongs to the logged-in mess owner
    const mealResult = await client.query(
      `
      SELECT m.meal_id
      FROM meals m
      INNER JOIN mess_profiles mp
        ON mp.profile_id = m.profile_id
      INNER JOIN users u
        ON u.user_id = mp.user_id
      WHERE m.meal_id = $1
        AND u.clerk_id = $2
        AND u.user_role = 'mess_owner'
      LIMIT 1
      `,
      [mealId, clerkId]
    );

    if (mealResult.rowCount === 0) {
      throw new Error("Meal not found");
    }

    // 2. Server-side validation
    const validMealTypes = [
      "BREAKFAST",
      "LUNCH",
      "DINNER",
    ];

    if (!validMealTypes.includes(mealType)) {
      throw new Error("Invalid meal type");
    }

    if (!mealDate || !startTime || !endTime || !cutoffTime) {
      throw new Error("Required meal fields are missing");
    }

    if (endTime <= startTime) {
      throw new Error("End time must be after start time");
    }

    if (!Array.isArray(menuItems) || menuItems.length === 0) {
      throw new Error("At least one menu item is required");
    }

    const cleanedMenuItems = menuItems
      .map((item) => item.trim())
      .filter(Boolean);

    if (cleanedMenuItems.length === 0) {
      throw new Error("At least one valid menu item is required");
    }

    const uniqueMenuItems = [
      ...new Set(
        cleanedMenuItems.map((item) => item.toLowerCase())
      ),
    ];

    if (uniqueMenuItems.length !== cleanedMenuItems.length) {
      throw new Error("Duplicate menu items are not allowed");
    }

    // 3. Update meal
    const updateResult = await client.query(
      `
      UPDATE meals
      SET
        meal_date = $1,
        meal_type = $2,
        start_time = $3,
        end_time = $4,
        cutoff_time = $5,
        pay_as_you_go = $6,
        updated_at = NOW()
      WHERE meal_id = $7
      RETURNING
        meal_id,
        profile_id,
        meal_date,
        meal_type,
        start_time,
        end_time,
        cutoff_time,
        pay_as_you_go,
        status,
        updated_at
      `,
      [
        mealDate,
        mealType,
        startTime,
        endTime,
        cutoffTime,
        payAsYouGo,
        mealId,
      ]
    );

    const meal = updateResult.rows[0];

    // 4. Replace existing menu items
    await client.query(
      `
      DELETE FROM meal_menu_items
      WHERE meal_id = $1
      `,
      [mealId]
    );

    for (const itemName of cleanedMenuItems) {
      await client.query(
        `
        INSERT INTO meal_menu_items (
          meal_id,
          item_name
        )
        VALUES ($1, $2)
        `,
        [mealId, itemName]
      );
    }

    // 5. Commit everything
    await client.query("COMMIT");

    return {
      mealId: meal.meal_id,
      profileId: meal.profile_id,
      mealDate: meal.meal_date,
      mealType: meal.meal_type,
      startTime: meal.start_time,
      endTime: meal.end_time,
      cutoffTime: meal.cutoff_time,
      payAsYouGo: meal.pay_as_you_go,
      status: meal.status,
      menuItems: cleanedMenuItems,
      updatedAt: meal.updated_at,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  updateMeal,
};