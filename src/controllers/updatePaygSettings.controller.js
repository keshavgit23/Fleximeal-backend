const {
    updatePaygSettings,
} = require("../services/updatePaygSettings.service");

const updatePaygSettingsController = async (req, res) => {
    try {
        const clerkId = req.auth.sub;
        const { prices } = req.body;

        const settings = await updatePaygSettings({
            clerkId,
            prices,
        });

        return res.status(200).json({
            success: true,
            data: settings,
            message: "PAYG settings updated successfully",
        });
    } catch (error) {
        console.error(
            "Failed to update PAYG settings:",
            error.message
        );

        if (
            error.message === "Mess owner profile not found"
        ) {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        const isValidationError =
            error.message === "Valid meal prices are required" ||
            error.message === "At least one meal price is required" ||
            error.message.startsWith("Invalid meal type:") ||
            error.message.startsWith(
                "A valid positive price is required for"
            );

        return res.status(isValidationError ? 400 : 500).json({
            success: false,
            message: error.message || "Failed to update PAYG settings",
        });
    }
};

module.exports = {
    updatePaygSettingsController,
};