
const pool = require("../config/db");

const updatePaygSettings = async ({ clerkId, prices }) => {
  const validMealTypes = ["BREAKFAST", "LUNCH", "DINNER"];

  if (
    !prices ||
    typeof prices !== "object" ||
    Array.isArray(prices)
  ) {
    throw new Error("Valid meal prices are required");
  }

  const entries = Object.entries(prices);

  if (entries.length === 0) {
    throw new Error("At least one meal price is required");
  }

  // Validate only the meal types supplied by the client.
  for (const [mealType, price] of entries) {
    if (!validMealTypes.includes(mealType)) {
      throw new Error(`Invalid meal type: ${mealType}`);
    }

    if (
      price === null ||
      price === undefined ||
      price === "" ||
      !/^\d+(\.\d{1,2})?$/.test(String(price)) ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      throw new Error(
        `A valid positive price is required for ${mealType}`
      );
    }
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const profileResult = await client.query(
      `
      SELECT mp.profile_id
      FROM mess_profiles mp
      INNER JOIN users u ON u.user_id = mp.user_id
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

    for (const [mealType, price] of entries) {
      await client.query(
        `
        INSERT INTO payg_prices (profile_id, meal_type, price)
        VALUES ($1, $2, $3)
        ON CONFLICT (profile_id, meal_type)
        DO UPDATE SET
          price = EXCLUDED.price,
          updated_at = NOW()
        `,
        [profileId, mealType, price]
      );
    }

    // Return all saved prices, including unchanged meal types.
    const result = await client.query(
      `
      SELECT meal_type, price, updated_at
      FROM payg_prices
      WHERE profile_id = $1
      `,
      [profileId]
    );

    await client.query("COMMIT");

    const savedPrices = {
      BREAKFAST: null,
      LUNCH: null,
      DINNER: null,
    };

    let updatedAt = null;

    for (const row of result.rows) {
      savedPrices[row.meal_type] = row.price;

      if (!updatedAt || row.updated_at > updatedAt) {
        updatedAt = row.updated_at;
      }
    }

    return {
      profileId,
      prices: savedPrices,
      updatedAt,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  updatePaygSettings,
};
