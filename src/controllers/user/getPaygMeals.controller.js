
const {
  getPaygMeals,
} = require("../../services/user/getPaygMeals.service");

const getPaygMealsController = async (req, res) => {
  try {
    const meals = await getPaygMeals();
    console.log("PAYG meals fetched successfully:", meals);

    return res.status(200).json({
      success: true,
      data: meals,
      message: "PAYG meals fetched successfully",
    });
  } catch (error) {
    console.error("Failed to fetch PAYG meals:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch PAYG meals",
    });
  }
};

module.exports = {
  getPaygMealsController,
};
