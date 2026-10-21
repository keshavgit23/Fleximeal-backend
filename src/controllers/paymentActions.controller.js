
const {
  approveMessPayment,
  rejectMessPayment,
} = require("../services/paymentActions.service");

const getErrorResponse = (error) => {
  if (error.code === "PAYMENT_NOT_FOUND") {
    return { status: 404, message: "Payment not found" };
  }

  if (error.code === "PAYMENT_ALREADY_PROCESSED") {
    return { status: 409, message: error.message };
  }

  if (
    error.code === "23505" &&
    error.constraint === "unique_active_subscription"
  ) {
    return {
      status: 409,
      message:
        "An active subscription already exists for this meal type.",
    };
  }

  return {
    status: 500,
    message: "Something went wrong while processing the payment",
  };
};

const validateRequest = (req, res) => {
  const paymentId = Number(req.params.paymentId);
  const clerkId = req.auth?.sub;

  if (!clerkId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return null;
  }

  if (!Number.isSafeInteger(paymentId) || paymentId <= 0) {
    res.status(400).json({
      success: false,
      message: "Invalid payment ID",
    });
    return null;
  }

  return { paymentId, clerkId };
};

const approveMessPaymentController = async (req, res) => {
  const input = validateRequest(req, res);
  if (!input) return;

  try {
    const data = await approveMessPayment(
      input.paymentId,
      input.clerkId
    );

    return res.status(200).json({
      success: true,
      message: "Payment approved and subscription activated",
      data,
    });
  } catch (error) {
    console.error("Approve payment error:", error);

    const response = getErrorResponse(error);

    return res.status(response.status).json({
      success: false,
      message: response.message,
    });
  }
};

const rejectMessPaymentController = async (req, res) => {
  const input = validateRequest(req, res);
  if (!input) return;

  try {
    const data = await rejectMessPayment(
      input.paymentId,
      input.clerkId
    );

    return res.status(200).json({
      success: true,
      message: "Payment rejected",
      data,
    });
  } catch (error) {
    console.error("Reject payment error:", error);

    const response = getErrorResponse(error);

    return res.status(response.status).json({
      success: false,
      message: response.message,
    });
  }
};

module.exports = {
  approveMessPaymentController,
  rejectMessPaymentController,
};