
const {
  createPaygBooking,
} = require("../../services/user/createPaygBooking.service");

const createPaygBookingController = async (req, res) => {
  try {
    const { meal_id } = req.body;

    // Validate meal_id
    if (
      meal_id === undefined ||
      meal_id === null ||
      !Number.isInteger(Number(meal_id)) ||
      Number(meal_id) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid meal_id is required",
      });
    }

    // Get authenticated Clerk user ID
    const clerkId = req.auth?.sub;

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const booking = await createPaygBooking({
      clerkId,
      mealId: Number(meal_id),
    });

    return res.status(201).json({
      success: true,
      message: "PAYG meal booked successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Create PAYG booking error:", error);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? "Failed to create PAYG booking"
          : error.message,
    });
  }
};

module.exports = { createPaygBookingController };
