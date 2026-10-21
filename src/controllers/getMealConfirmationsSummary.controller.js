
const {
  getMealConfirmationsSummary,
} = require("../services/getMealConfirmationsSummary.service");

const getMealConfirmationsSummaryController = async (req, res) => {
  try {
    const result = await getMealConfirmationsSummary(
      req.auth.sub,
      req.params.mealId
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch meal confirmations",
    });
  }
};

module.exports = {
  getMealConfirmationsSummaryController,
};
