const { getUserPayments } = require("../../services/user/getUserPayments.service");

const getUserPaymentsController = async (req, res) => {
  try {
    const userId = req.auth?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const payments = await getUserPayments(userId);

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Get user payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};

module.exports = {
  getUserPaymentsController,
};