const {
  getMessPartnerSetup,
} = require("../services/getMessPartnerSetup.service");

const getMessPartnerController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    const result = await getMessPartnerSetup(clerkId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Failed to fetch mess partner setup:", error.message);

    if (error.message === "MESS_PARTNER_PROFILE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Mess partner profile not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch mess partner setup",
    });
  }
};

module.exports = {
  getMessPartnerController,
};