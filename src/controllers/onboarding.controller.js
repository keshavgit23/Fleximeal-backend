const {
  completeOnboardingService,
} = require("../services/onboarding.service");

const saveOnboardingDetails = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    const {
      fullName,
      phone,
      avatarUrl,
      role,
      college,
      city,
      dietaryPreference,
      messName,
      messAddress,
      messCity,
      messState,
    } = req.body;

    // Common field validation
    if (!fullName || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "Full name, phone and role are required",
      });
    }

    // Role validation
    if (!["user", "mess_owner"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Student validation
    if (role === "user") {
      if (!college || !city || !dietaryPreference) {
        return res.status(400).json({
          success: false,
          message:
            "College, city and dietary preference are required",
        });
      }
    }

    // Mess owner validation
    if (role === "mess_owner") {
      if (!messName || !messAddress || !messCity || !messState) {
        return res.status(400).json({
          success: false,
          message:
            "Mess name, address, city and state are required",
        });
      }
    }

    const onboardingData = {
      fullName,
      phone,
      avatarUrl,
      role,
      college,
      city,
      dietaryPreference,
      messName,
      messAddress,
      messCity,
      messState,
    };

    const result = await completeOnboardingService(
      clerkId,
      onboardingData
    );

    return res.status(200).json({
      success: true,
      user: result,
    });
  } catch (error) {
    console.error("Onboarding failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Onboarding failed",
    });
  }
};

module.exports = {
  saveOnboardingDetails,
};