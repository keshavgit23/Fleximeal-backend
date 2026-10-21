const { getPaygSettings } = require("../services/getPaygSettings.service");

const getPaygSettingsController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    const settings = await getPaygSettings({ clerkId });

    return res.status(200).json({
      success: true,
      data: settings,
      message: "PAYG settings fetched successfully",
    });
  } catch (error) {
    console.error(
      "Failed to fetch PAYG settings:",
      error.message
    );

    const statusCode =
      error.message === "Mess owner profile not found"
        ? 404
        : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch PAYG settings",
    });
  }
};

module.exports = {
  getPaygSettingsController,
};