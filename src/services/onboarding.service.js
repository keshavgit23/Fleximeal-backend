const pool = require("../config/db");

const completeOnboardingService = async (clerkId, onboardingData) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `
      SELECT
        user_id,
        user_role,
        onboarding_completed
      FROM users
      WHERE clerk_id = $1
      `,
      [clerkId]
    );

    if (userResult.rowCount === 0) {
      throw new Error("User not found");
    }

    const user = userResult.rows[0];

    // Onboarding already completed
    if (user.onboarding_completed) {
      await client.query("COMMIT");

      return {
        role: user.user_role,
        onboardingCompleted: true,
      };
    }

    const {
      fullName,
      phone,
      avatarUrl,
      role,
      college,
      city,
      dietaryPreference,
      messName,
      messAddress,
      messCity,
      messState,
    } = onboardingData;

    if (!["user", "mess_owner"].includes(role)) {
      throw new Error("Invalid role");
    }

    // Update common user details
    const updatedUser = await client.query(
      `
      UPDATE users
      SET
        full_name = $1,
        phone = $2,
        avatar_url = $3,
        user_role = $4,
        onboarding_completed = TRUE
      WHERE user_id = $5
      RETURNING
        user_id,
        user_role,
        onboarding_completed
      `,
      [fullName, phone, avatarUrl, role, user.user_id]
    );

    // Save role-specific profile
    if (role === "user") {
      await client.query(
        `
        INSERT INTO student_profiles (
          user_id,
          college_name,
          college_city,
          dietary_preference
        )
        VALUES ($1, $2, $3, $4)
        `,
        [
          user.user_id,
          college,
          city,
          dietaryPreference,
        ]
      );
    }

    if (role === "mess_owner") {
      await client.query(
        `
        INSERT INTO mess_profiles (
          user_id,
          mess_name,
          mess_address,
          mess_city,
          mess_state
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          user.user_id,
          messName,
          messAddress,
          messCity,
          messState,
        ]
      );
    }

    await client.query("COMMIT");

    return {
      role: updatedUser.rows[0].user_role,
      onboardingCompleted:
        updatedUser.rows[0].onboarding_completed,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  completeOnboardingService,
};