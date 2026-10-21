const {
  respondToMealConfirmation,
} = require("../../services/user/respondToMealConfirmation.service");

const {
  getInternalUserId,
} = require("../../services/user/getInternalUserId.service");

const respondToMealConfirmationController = async (req, res) => {
  try {
    const userId = await getInternalUserId(req.auth.sub);

    const confirmationId = Number(req.params.confirmationId);
    const { response } = req.body;

    if (
      !Number.isInteger(confirmationId) ||
      confirmationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid confirmation ID",
      });
    }

    if (!["YES", "NO"].includes(response)) {
      return res.status(400).json({
        success: false,
        message: "Response must be YES or NO",
      });
    }

    const confirmation = await respondToMealConfirmation(
      userId,
      confirmationId,
      response
    );

    return res.status(200).json({
      success: true,
      message: "Meal confirmation updated successfully",
      data: confirmation,
    });
  } catch (error) {
    console.error(
      "Failed to respond to meal confirmation:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update meal confirmation",
    });
  }
};

module.exports = {
  respondToMealConfirmationController,
};