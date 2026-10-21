const pool = require("../../config/db");

const createPayment = async ({
  userId,
  profileId,
  amount,
  mealType,
  defaultResponse,
  utr,
  proofUrl = null,
}) => {
  // -----------------------------
  // 1. Validate UTR
  // -----------------------------

  if (!utr || typeof utr !== "string") {
    throw new Error("UTR is required");
  }

  const normalizedUtr = utr.trim();

  // Basic format validation.
  // Keep this intentionally flexible because UTR formats can
  // differ between banks/payment systems.
  if (!/^\d{12,}$/.test(normalizedUtr)) {
    throw new Error("Invalid UTR format");
  }

  // Check whether the user already has an active payment
  // for the same mess and meal type.
  const existingPaymentQuery = `
    SELECT
      payment_id,
      status
    FROM payments
    WHERE user_id = $1
      AND profile_id = $2
      AND meal_type = $3
      AND status IN ('PENDING', 'VERIFIED')
    LIMIT 1
  `;

  const existingPaymentResult = await pool.query(
    existingPaymentQuery,
    [userId, profileId, mealType]
  );

  if (existingPaymentResult.rows.length > 0) {
    const existingPayment = existingPaymentResult.rows[0];

    throw new Error(
      `A ${existingPayment.status.toLowerCase()} payment already exists for this mess and meal type`
    );
  }

  const query = `
    INSERT INTO payments (
      user_id,
      profile_id,
      amount,
      meal_type,
      default_response,
      utr,
      proof_url,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
    RETURNING
      payment_id,
      user_id,
      profile_id,
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
    amount,
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