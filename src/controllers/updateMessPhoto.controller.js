const {
  updateMessPhoto,
} = require("../services/updateMessPhoto.service");

const updateMessPhotoController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Mess photo is required",
      });
    }

    const photoUrl = `/uploads/mess/${req.file.filename}`;

    const result = await updateMessPhoto(
      clerkId,
      photoUrl
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Failed to update mess photo:",
      error.message
    );

    if (error.message === "MESS_PARTNER_PROFILE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Mess partner profile not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update mess photo",
    });
  }
};

module.exports = {
  updateMessPhotoController,
};