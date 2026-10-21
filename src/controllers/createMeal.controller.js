const { createMeal } = require("../services/createMeal.service");

const createMealController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    const {
      mealDate,
      mealType,
      startTime,
      endTime,
      cutoffTime,
      payAsYouGo,
      menuItems,
    } = req.body;

    const meal = await createMeal({
      clerkId,
      mealDate,
      mealType,
      startTime,
      endTime,
      cutoffTime,
      payAsYouGo,
      menuItems,
    });

    return res.status(201).json({
      success: true,
      data: meal,
      message: "Meal created successfully",
    });
  } catch (error) {
    console.error(
      "Failed to create meal:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create meal",
    });
  }
};

module.exports = {
  createMealController,
};