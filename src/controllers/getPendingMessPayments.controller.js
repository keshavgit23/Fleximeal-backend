const { getPendingMessPayments } = require("../services/getPendingMessPayments.service");

const getPendingMessPaymentsController = async (req, res) => {
  try {
    const clerkId = req.auth?.sub;

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const payments = await getPendingMessPayments(clerkId);

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Get pending mess payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending payments",
    });
  }
};

module.exports = {
  getPendingMessPaymentsController,
};