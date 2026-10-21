const {
  getUserActiveSubscriptions,
} = require("../../services/user/subscription.service");

const getMyActiveSubscriptionsController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    const subscriptions = await getUserActiveSubscriptions(clerkId);

    return res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error(
      "Failed to fetch active subscriptions:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch subscriptions",
    });
  }
};

module.exports = {
  getMyActiveSubscriptionsController,
};