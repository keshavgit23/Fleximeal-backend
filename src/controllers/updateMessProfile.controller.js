const {
  updateMessProfile,
} = require("../services/updateMessProfile.service");

const updateMessProfileController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    const {
      description,
      foodType,
      offersBreakfast,
      offersLunch,
      offersDinner,
    } = req.body;

    const result = await updateMessProfile(clerkId, {
      description,
      foodType,
      offersBreakfast,
      offersLunch,
      offersDinner,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Failed to update mess profile:", error.message);

    if (error.message === "MESS_PARTNER_PROFILE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Mess partner profile not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update mess profile",
    });
  }
};

module.exports = {
  updateMessProfileController,
};