const {
  getCurrentMeal,
} = require("../services/getCurrentMeal.service");

const getActiveMealController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    const result = await getCurrentMeal(clerkId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Failed to get active meal:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get active meal",
    });
  }
};

module.exports = {
  getActiveMealController,
};