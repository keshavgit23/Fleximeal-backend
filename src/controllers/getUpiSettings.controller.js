
const {
  getUpiSettings,
} = require("../services/getUpiSettings.service");

const getUpiSettingsController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    const settings = await getUpiSettings({ clerkId });

    return res.status(200).json({
      success: true,
      data: settings,
      message: "UPI settings fetched successfully",
    });
  } catch (error) {
    console.error(
      "Failed to fetch UPI settings:",
      error.message
    );

    const statusCode =
      error.message === "Mess owner profile not found"
        ? 404
        : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch UPI settings",
    });
  }
};

module.exports = {
  getUpiSettingsController,
};
