
const pool = require("../config/db");

const createMessPlan = async (clerkId, planData) => {
  const {
    plan_name,
    target_gender,
    price,
    meal_types,
  } = planData;

  // Validate plan name
  if (
    typeof plan_name !== "string" ||
    !plan_name.trim() ||
    plan_name.trim().length > 100
  ) {
    throw new Error("INVALID_PLAN_NAME");
  }

  // Validate target gender
  const allowedGenders = ["MALE", "FEMALE", "ALL"];

  if (!allowedGenders.includes(target_gender)) {
    throw new Error("INVALID_TARGET_GENDER");
  }

  // Validate price
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    throw new Error("INVALID_PLAN_PRICE");
  }

  // Validate meal types
  const allowedMeals = ["BREAKFAST", "LUNCH", "DINNER"];

  if (
    !Array.isArray(meal_types) ||
    meal_types.length === 0 ||
    !meal_types.every((meal) => allowedMeals.includes(meal))
  ) {
    throw new Error("INVALID_MEAL_TYPES");
  }

  if (new Set(meal_types).size !== meal_types.length) {
    throw new Error("DUPLICATE_MEAL_TYPES");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Resolve the authenticated owner's mess profile
    const ownerResult = await client.query(
      `
      SELECT mp.profile_id
      FROM mess_profiles mp
      INNER JOIN users u
        ON u.user_id = mp.user_id
      WHERE u.clerk_id = $1
        AND u.user_role = 'mess_owner'
      `,
      [clerkId]
    );

    if (ownerResult.rowCount === 0) {
      throw new Error("MESS_PARTNER_PROFILE_NOT_FOUND");
    }

    const profileId = ownerResult.rows[0].profile_id;

    // Insert the main plan
    const planResult = await client.query(
      `
      INSERT INTO mess_plans (
        profile_id,
        plan_name,
        target_gender,
        price
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        plan_id,
        profile_id,
        plan_name,
        target_gender,
        price,
        is_active,
        created_at
      `,
      [
        profileId,
        plan_name.trim(),
        target_gender,
        numericPrice,
      ]
    );

    const plan = planResult.rows[0];

    // Insert all included meal types
    await client.query(
      `
      INSERT INTO mess_plan_meals (
        plan_id,
        meal_type
      )
      SELECT $1, meal_type
      FROM UNNEST($2::varchar[]) AS meals(meal_type)
      `,
      [plan.plan_id, meal_types]
    );

    await client.query("COMMIT");

    return {
      ...plan,
      meal_types,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createMessPlan,
};
