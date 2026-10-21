const pool = require("../../config/db");
const { createPayment } = require("../../services/user/createPayment.service");

const createPaymentController = async (req, res) => {
  try {
    // Clerk ID is used only for authentication/identity
    const clerkId = req.auth?.sub;

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Resolve Clerk ID → application-level user ID
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

    const {
      profileId,
      amount,
      mealType,
      defaultResponse,
      utr,
      proofUrl,
    } = req.body;

    // Basic validation
    if (
      !profileId ||
      !amount ||
      !mealType ||
      !defaultResponse ||
      !utr
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment fields",
      });
    }

    const payment = await createPayment({
      userId,
      profileId,
      amount,
      mealType,
      defaultResponse,
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
          "A pending or verified payment already exists for this mess and meal type",
      });
    }

    // Business-level duplicate check from service
    if (
      error.message?.includes(
        "payment already exists for this mess and meal type"
      )
    ) {
      return res.status(409).json({
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
