const { getMealById } = require("../services/getMealById.service");

const getMealByIdController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;
    const { mealId } = req.params;

    const result = await getMealById({
      clerkId,
      mealId,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Failed to get meal:",
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
      message: "Failed to get meal",
    });
  }
};

module.exports = {
  getMealByIdController,
};