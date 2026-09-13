const { authenticateUserService } = require("../services/auth.service");

const authenticateUser = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    const user = await authenticateUserService(clerkId);

    return res.status(200).json({
      success: true,
      user: {
        userId: user.user_id,
        clerkId: user.clerk_id,
        role: user.user_role,
        onboardingCompleted: user.onboarding_completed,
      },
    });
  } catch (error) {
    console.error("Authentication failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = {
  authenticateUser,
};