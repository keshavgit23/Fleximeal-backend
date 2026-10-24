const {
  getUserProfile,
} = require("../../services/user/user.service");

const getMyProfileController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    const user = await getUserProfile(clerkId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error.message);

    const status = error.message === "User not found" ? 404 : 500;

    return res.status(status).json({
      success: false,
      message: error.message || "Failed to fetch user profile",
    });
  }
};

module.exports = {
  getMyProfileController,
};
