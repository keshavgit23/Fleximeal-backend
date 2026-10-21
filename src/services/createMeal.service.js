const pool = require("../config/db");

const createMeal = async ({
  clerkId,
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

    // 1. Get mess owner's profile
    const profileResult = await client.query(
      `
      SELECT mp.profile_id
      FROM mess_profiles mp
      INNER JOIN users u
        ON u.user_id = mp.user_id
      WHERE u.clerk_id = $1
        AND u.user_role = 'mess_owner'
      LIMIT 1
      `,
      [clerkId]
    );

    if (profileResult.rowCount === 0) {
      throw new Error("Mess owner profile not found");
    }

    const profileId = profileResult.rows[0].profile_id;

    // 2. Server-side validation
    const validMealTypes = ["BREAKFAST", "LUNCH", "DINNER"];

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

    // 3. Create meal
    // status intentionally not supplied.
    // Database default = UPCOMING
    const mealResult = await client.query(
      `
      INSERT INTO meals (
        profile_id,
        meal_date,
        meal_type,
        start_time,
        end_time,
        cutoff_time,
        pay_as_you_go
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
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
        created_at
      `,
      [
        profileId,
        mealDate,
        mealType,
        startTime,
        endTime,
        cutoffTime,
        payAsYouGo,
      ]
    );

    const meal = mealResult.rows[0];

    // 4. Create menu items
    for (const itemName of cleanedMenuItems) {
      await client.query(
        `
        INSERT INTO meal_menu_items (
          meal_id,
          item_name
        )
        VALUES ($1, $2)
        `,
        [meal.meal_id, itemName]
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
      createdAt: meal.created_at,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createMeal,
};