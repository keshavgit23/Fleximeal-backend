
const pool = require("../../config/db");

const createPayment = async ({
  userId,
  profileId,
  amount,
  planId = null,
  mealType = null,
  defaultResponse,
  utr,
  proofUrl = null,
}) => {
  // 1. Validate UTR
  if (!utr || typeof utr !== "string") {
    throw new Error("UTR is required");
  }

  const normalizedUtr = utr.trim();

  if (!/^\d{12,}$/.test(normalizedUtr)) {
    throw new Error("Invalid UTR format");
  }

  // 2. Validate payment type
  const hasPlanId = planId !== null && planId !== undefined;
  const hasMealType = mealType !== null && mealType !== undefined;

  if (hasPlanId === hasMealType) {
    throw new Error(
      "Provide either a plan ID or a meal type"
    );
  }

  let finalAmount = Number(amount);

  // 3. Validate selected plan and get its actual price
  if (hasPlanId) {
    const normalizedPlanId = Number(planId);

    if (
      !Number.isSafeInteger(normalizedPlanId) ||
      normalizedPlanId <= 0
    ) {
      throw new Error("Invalid plan ID");
    }

    const planQuery = `
      SELECT plan_id, price
      FROM mess_plans
      WHERE plan_id = $1
        AND profile_id = $2
        AND is_active = TRUE
      LIMIT 1
    `;

    const planResult = await pool.query(planQuery, [
      normalizedPlanId,
      profileId,
    ]);

    if (planResult.rows.length === 0) {
      throw new Error("Selected plan is unavailable");
    }

    // Always use the database price for plan payments.
    finalAmount = Number(planResult.rows[0].price);

    planId = normalizedPlanId;
    mealType = null;
  } else {
    // Legacy meal-based payment validation
    if (!mealType) {
      throw new Error("Meal type is required");
    }

    planId = null;

    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      throw new Error("Invalid payment amount");
    }
  }

  // 4. Check for existing pending/verified payment
  const existingPaymentQuery = `
    SELECT payment_id, status
    FROM payments
    WHERE user_id = $1
      AND profile_id = $2
      AND status IN ('PENDING', 'VERIFIED')
      AND (
        ($3::INT IS NOT NULL AND plan_id = $3)
        OR
        ($3::INT IS NULL AND meal_type = $4)
      )
    LIMIT 1
  `;

  const existingPaymentResult = await pool.query(
    existingPaymentQuery,
    [userId, profileId, planId, mealType]
  );

  if (existingPaymentResult.rows.length > 0) {
    const existingPayment = existingPaymentResult.rows[0];

    const paymentType = hasPlanId
      ? "plan"
      : "meal type";

    throw new Error(
      `A ${existingPayment.status.toLowerCase()} payment already exists for this mess and ${paymentType}`
    );
  }

  // 5. Create payment
  const query = `
    INSERT INTO payments (
      user_id,
      profile_id,
      plan_id,
      amount,
      meal_type,
      default_response,
      utr,
      proof_url,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
    RETURNING
      payment_id,
      user_id,
      profile_id,
      plan_id,
      amount,
      meal_type,
      default_response,
      utr,
      proof_url,
      status,
      verified_by,
      verified_at,
      rejection_reason,
      created_at,
      updated_at
  `;

  const values = [
    userId,
    profileId,
    planId,
    finalAmount,
    mealType,
    defaultResponse,
    normalizedUtr,
    proofUrl,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

module.exports = {
  createPayment,
};
