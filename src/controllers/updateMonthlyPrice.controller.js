const {
  updateMonthlyPrice,
} = require("../services/updateMonthlyPrice.service");

const updateMonthlyPriceController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;
    const { monthlyPrice } = req.body;

    if (monthlyPrice === undefined || monthlyPrice === null) {
      return res.status(400).json({
        success: false,
        message: "Monthly price is required",
      });
    }

    const result = await updateMonthlyPrice(clerkId, monthlyPrice);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Failed to update monthly price:", error.message);

    if (error.message === "MESS_PARTNER_PROFILE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Mess partner profile not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update monthly price",
    });
  }
};

module.exports = {
  updateMonthlyPriceController,
};