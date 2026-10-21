
const {
  getMyLiveMeals,
} = require("../../services/user/getMyLiveMeals.service");

const getMyLiveMealsController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    const meals = await getMyLiveMeals(clerkId);

    return res.status(200).json({
      success: true,
      data: meals,
    });
  } catch (error) {
    console.error("Failed to fetch live meals:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch live meals",
    });
  }
};

module.exports = {
  getMyLiveMealsController,
};
