
const {
  getMessPlans,
} = require("../services/getMessPlans.service");

const getMessPlansController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const plans = await getMessPlans(clerkId);

    return res.status(200).json({
      success: true,
      data: plans,
    });

  } catch (error) {
    console.error("Get mess plans error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch mess plans",
    });
  }
};

module.exports = {
  getMessPlansController,
};
