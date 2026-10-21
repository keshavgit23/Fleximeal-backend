const {
  newSubscription,
} = require("../../services/user/newSubscription.service");

const newSubscriptionController = async (req, res) => {
  try {
    const {
      profile_id,
      meal_type,
      default_response,
    } = req.body;

    // Validate required fields
    if (!profile_id || !meal_type || !default_response) {
      return res.status(400).json({
        success: false,
        message:
          "profile_id, meal_type and default_response are required",
      });
    }

    // Validate meal type
    const validMealTypes = [
      "BREAKFAST",
      "LUNCH",
      "DINNER",
    ];

    if (!validMealTypes.includes(meal_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meal type",
      });
    }

    // Validate default response
    const validResponses = ["YES", "NO"];

    if (!validResponses.includes(default_response)) {
      return res.status(400).json({
        success: false,
        message: "Invalid default response",
      });
    }

    // Clerk user ID
    const userId = req.auth?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const subscription = await newSubscription({
      userId,
      profileId: Number(profile_id),
      mealType: meal_type,
      defaultResponse: default_response,
    });

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("New subscription error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create subscription",
    });
  }
};

module.exports = {
  newSubscriptionController,
};