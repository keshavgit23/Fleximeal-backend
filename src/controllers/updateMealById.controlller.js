const { updateMeal } = require("../services/updateMealById.service");

const updateMealController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;
    const { mealId } = req.params;

    const {
      mealDate,
      mealType,
      startTime,
      endTime,
      cutoffTime,
      payAsYouGo,
      menuItems,
    } = req.body;

    const result = await updateMeal({
      clerkId,
      mealId,
      mealDate,
      mealType,
      startTime,
      endTime,
      cutoffTime,
      payAsYouGo,
      menuItems,
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: "Meal updated successfully",
    });
  } catch (error) {
    console.error(
      "Failed to update meal:",
      error.message
    );

    if (error.message === "Meal not found") {
      return res.status(404).json({
        success: false,
        message: "Meal not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update meal",
    });
  }
};

module.exports = {
  updateMealController,
};