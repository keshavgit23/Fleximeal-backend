
const { cancelMeal } = require("../services/cancelMeal.service");

const cancelMealController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;
    const { mealId } = req.params;

    const result = await cancelMeal(clerkId, mealId);

    return res.status(200).json({
      success: true,
      message: "Meal cancelled successfully",
      data: result,
    });
  } catch (error) {
    console.error("Failed to cancel meal:", error.message);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to cancel meal",
    });
  }
};

module.exports = { cancelMealController };
