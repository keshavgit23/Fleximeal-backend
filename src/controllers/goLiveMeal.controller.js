
const {
  goLiveMeal,
} = require("../services/goLiveMeal.service");

const goLiveMealController = async (req, res) => {
  try {
    const clerkId = req.auth?.sub;
    const mealId = Number(req.params.mealId);

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      !Number.isSafeInteger(mealId) ||
      mealId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid meal ID",
      });
    }

    const result = await goLiveMeal(
      clerkId,
      mealId
    );

    return res.status(200).json({
      success: true,
      message: "Meal is now live",
      data: {
        meal: result,
      },
    });
  } catch (error) {
    console.error(
      "Failed to start meal:",
      error.message
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Failed to start meal",
    });
  }
};

module.exports = {
  goLiveMealController,
};
