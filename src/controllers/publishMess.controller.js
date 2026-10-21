const {
  publishMess,
} = require("../services/publishMess.service");

const publishMessController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    const result = await publishMess(clerkId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Failed to publish mess:", error.message);

    if (error.message === "MESS_NOT_READY_TO_PUBLISH") {
      return res.status(400).json({
        success: false,
        message: "Mess is not ready to publish",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to publish mess",
    });
  }
};

module.exports = {
  publishMessController,
};