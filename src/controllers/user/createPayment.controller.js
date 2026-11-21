
const pool = require("../../config/db");
const {
  createPayment,
} = require("../../services/user/createPayment.service");

const createPaymentController = async (req, res) => {
  try {
    // 1. Authenticate user
    const clerkId = req.auth?.sub;

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // 2. Resolve Clerk ID → internal user ID
    const userResult = await pool.query(
      `
        SELECT user_id
        FROM users
        WHERE clerk_id = $1
          AND user_role = 'user'
        LIMIT 1
      `,
      [clerkId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application user not found",
      });
    }

    const userId = userResult.rows[0].user_id;

    // 3. Read request body
    const {
      profileId,
      amount,
      planId,
      mealType,
      defaultResponse,
      utr,
      proofUrl,
    } = req.body;

    // 4. Validate required fields
    if (
      !profileId ||
      !defaultResponse ||
      !utr
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment fields",
      });
    }

    // Exactly one of planId or mealType must be provided
    const hasPlanId =
      planId !== undefined && planId !== null;

    const hasMealType =
      mealType !== undefined && mealType !== null;

    if (hasPlanId === hasMealType) {
      return res.status(400).json({
        success: false,
        message: "Provide either a plan ID or a meal type",
      });
    }

    if (!hasPlanId && !amount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount is required",
      });
    }

    if (
      !["YES", "NO"].includes(
        String(defaultResponse).toUpperCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid default response",
      });
    }

    if (typeof utr !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid UTR",
      });
    }

    // 5. Create payment
    const payment = await createPayment({
      userId,
      profileId,
      amount,
      planId: hasPlanId ? planId : null,
      mealType: hasMealType ? mealType : null,
      defaultResponse: String(defaultResponse).toUpperCase(),
      utr: utr.trim(),
      proofUrl: proofUrl || null,
    });

    return res.status(201).json({
      success: true,
      message: "Payment submitted successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Create payment error:", error);

    // PostgreSQL unique violation
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message:
          "A pending or verified payment already exists for this mess and selected plan or meal type",
      });
    }

    // Business-level duplicate payment
    if (
      error.message?.includes("payment already exists")
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    // Validation/business errors
    if (
      error.message === "UTR is required" ||
      error.message === "Invalid UTR format" ||
      error.message === "Invalid plan ID" ||
      error.message === "Selected plan is unavailable" ||
      error.message === "Provide either a plan ID or a meal type" ||
      error.message === "Meal type is required" ||
      error.message === "Invalid payment amount"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit payment",
    });
  }
};

module.exports = {
  createPaymentController,
};
