
const pool = require("../../config/db");
const { getInternalUserId } = require("./getInternalUserId.service");

const createPaygBooking = async ({ clerkId, mealId }) => {
    const userId = await getInternalUserId(clerkId);
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Lock the meal row to prevent concurrent booking operations
        // from bypassing meal availability checks.
        const mealResult = await client.query(
            `
        SELECT
          m.meal_id,
          m.profile_id,
          m.meal_type,
          m.meal_date,
          m.cutoff_time,
          m.status,
          m.pay_as_you_go,
          mp.listing_status
        FROM meals m
        JOIN mess_profiles mp
          ON mp.profile_id = m.profile_id
        WHERE m.meal_id = $1
        FOR UPDATE OF m
      `,
            [mealId]
        );

        if (mealResult.rowCount === 0) {
            const error = new Error("Meal not found");
            error.statusCode = 404;
            throw error;
        }

        const meal = mealResult.rows[0];

        if (meal.listing_status !== "LIVE") {
            const error = new Error("This mess is not currently available");
            error.statusCode = 400;
            throw error;
        }

        if (!meal.pay_as_you_go) {
            const error = new Error("PAYG booking is not enabled for this meal");
            error.statusCode = 400;
            throw error;
        }

        if (!["UPCOMING", "ACTIVE"].includes(meal.status)) {
            const error = new Error(
                "This meal is no longer available for booking"
            );
            error.statusCode = 400;
            throw error;
        }

        if (!meal.cutoff_time) {
            const error = new Error("Booking cutoff is not configured for this meal");
            error.statusCode = 400;
            throw error;
        }

        // Check the cutoff using the meal's local date and time in India.
        const cutoffResult = await client.query(
            `
        SELECT
          (
            ($1::date + $2::time)
            >
            (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
          ) AS booking_open
      `,
            [meal.meal_date, meal.cutoff_time]
        );

        if (!cutoffResult.rows[0].booking_open) {
            const error = new Error("The booking cutoff time has passed");
            error.statusCode = 400;
            throw error;
        }

        // Ensure a price is configured for this mess and meal type.
        const priceResult = await client.query(
            `
        SELECT payg_price_id
        FROM payg_prices
        WHERE profile_id = $1
          AND meal_type = $2
      `,
            [meal.profile_id, meal.meal_type]
        );

        if (priceResult.rowCount === 0) {
            const error = new Error("PAYG price is not configured for this meal");
            error.statusCode = 400;
            throw error;
        }

        // The unique constraint on (user_id, meal_id) is the final
        // protection against duplicate bookings.
        const bookingResult = await client.query(
            `
        INSERT INTO payg_bookings (user_id, meal_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, meal_id) DO NOTHING
        RETURNING
          booking_id,
          user_id,
          meal_id,
          booking_status,
          booked_at,
          updated_at
      `,
            [userId, mealId]
        );

        if (bookingResult.rowCount === 0) {
            const error = new Error(
                "You have already booked this meal or have a previous booking for it"
            );
            error.statusCode = 409;
            throw error;
        }

        await client.query("COMMIT");

        return bookingResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { createPaygBooking };
