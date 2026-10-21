const {
  getPublishedMesses,
} = require("../../services/user/getPublishedMesses.service");

const getPublishedMessesController = async (req, res) => {
  try {
    const messes = await getPublishedMesses();

    return res.status(200).json({
      success: true,
      data: messes,
    });
  } catch (error) {
    console.error("Failed to fetch published messes:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messes",
    });
  }
};

module.exports = {
  getPublishedMessesController,
};