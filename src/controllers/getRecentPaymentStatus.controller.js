const {
  getRecentPaymentStatus,
} = require("../services/getRecentPaymentStatus.service");

const getRecentPaymentStatusController = async (req, res) => {
  try {
    const clerkId = req.auth?.sub;
     console.log("Recent payment status clerkId:", clerkId);
    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const status = await getRecentPaymentStatus(clerkId);
     console.log("Recent payment status result:", status);

    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Get recent payment status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent payment status",
    });
  }
};

module.exports = {
  getRecentPaymentStatusController,
};