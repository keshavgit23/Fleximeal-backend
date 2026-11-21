
const {
  createUpiSettings,
} = require("../services/createUpiSettings.service");

const createUpiSettingsController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;
    const { upi_id: upiId } = req.body || {};

    const settings = await createUpiSettings({
      clerkId,
      upiId,
    });

    return res.status(200).json({
      success: true,
      data: settings,
      message: "UPI settings saved successfully",
    });
  } catch (error) {
    console.error(
      "Failed to save UPI settings:",
      error.message
    );

    if (error.message === "Mess owner profile not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    const isValidationError =
      error.message === "A valid UPI ID is required";

    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to save UPI settings",
    });
  }
};

module.exports = {
  createUpiSettingsController,
};
