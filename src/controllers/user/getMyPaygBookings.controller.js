const {
  getMyPaygBookings,
} = require("../../services/user/getMyPaygBookings.service");

const getMyPaygBookingsController = async (req, res) => {
  try {
    const clerkId = req.auth?.sub;

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const bookings = await getMyPaygBookings(clerkId);

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get PAYG bookings error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode && error.statusCode !== 500
          ? error.message
          : "Failed to fetch PAYG bookings",
    });
  }
};

module.exports = { getMyPaygBookingsController };