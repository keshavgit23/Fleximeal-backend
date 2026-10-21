const {
  getOwnerMeals,
} = require("../services/getOwnerMeals.service");

const getMessOwnerMealsController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    const result = await getOwnerMeals(clerkId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Failed to get mess owner meals:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get mess owner meals",
    });
  }
};

module.exports = {
  getMessOwnerMealsController,
};