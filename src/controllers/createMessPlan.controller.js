
const {
  createMessPlan,
} = require("../services/createMessPlan.service");

const createMessPlanController = async (req, res) => {
  try {
    const clerkId = req.auth.sub;

    const result = await createMessPlan(clerkId, req.body);

    return res.status(201).json({
      success: true,
      message: "Mess plan created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Failed to create mess plan:", error.message);

    const validationErrors = {
      INVALID_PLAN_NAME: "Plan name is required and must be under 100 characters",
      INVALID_TARGET_GENDER: "Invalid target gender",
      INVALID_PLAN_PRICE: "Price must be greater than zero",
      INVALID_MEAL_TYPES: "Select at least one valid meal type",
      DUPLICATE_MEAL_TYPES: "Duplicate meal types are not allowed",
    };

    if (validationErrors[error.message]) {
      return res.status(400).json({
        success: false,
        message: validationErrors[error.message],
      });
    }

    if (error.message === "MESS_PARTNER_PROFILE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Mess partner profile not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create mess plan",
    });
  }
};

module.exports = {
  createMessPlanController,
};
