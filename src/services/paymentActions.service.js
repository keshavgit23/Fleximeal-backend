
const pool = require("../config/db");

const createPaymentError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const getOwnedPendingPayment = async (client, paymentId, clerkId) => {
  const query = `
    SELECT
      p.payment_id,
      p.user_id,
      p.profile_id,
      p.meal_type,
      p.default_response,
      p.status
    FROM payments p
    INNER JOIN mess_profiles mp
      ON mp.profile_id = p.profile_id
    INNER JOIN users owner
      ON owner.user_id = mp.user_id
    WHERE p.payment_id = $1
      AND owner.clerk_id = $2
      AND owner.user_role = 'mess_owner'
    FOR UPDATE OF p
  `;

  const { rows } = await client.query(query, [
    paymentId,
    clerkId,
  ]);

  if (rows.length === 0) {
    throw createPaymentError(
      "Payment not found",
      "PAYMENT_NOT_FOUND"
    );
  }

  const payment = rows[0];

  if (payment.status !== "PENDING") {
    throw createPaymentError(
      `Payment has already been ${payment.status.toLowerCase()}`,
      "PAYMENT_ALREADY_PROCESSED"
    );
  }

  return payment;
};

const approveMessPayment = async (paymentId, clerkId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const payment = await getOwnedPendingPayment(
      client,
      paymentId,
      clerkId
    );

    await client.query(
      `
        UPDATE payments
        SET status = 'VERIFIED',
            verified_by = $2,
            verified_at = NOW(),
            updated_at = NOW()
        WHERE payment_id = $1
          AND status = 'PENDING'
      `,
      [payment.payment_id, clerkId]
    );

    const { rows: subscriptionRows } = await client.query(
      `
        INSERT INTO subscriptions (
          user_id,
          profile_id,
          meal_type,
          default_response,
          status,
          start_date,
          end_date
        )
        VALUES ($1, $2, $3, $4, 'ACTIVE', CURRENT_DATE, NULL)
        RETURNING subscription_id, user_id, profile_id,
                  meal_type, default_response, status,
                  start_date, end_date
      `,
      [
        payment.user_id,
        payment.profile_id,
        payment.meal_type,
        payment.default_response,
      ]
    );

    await client.query("COMMIT");

    return {
      paymentId: payment.payment_id,
      status: "VERIFIED",
      subscription: subscriptionRows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const rejectMessPayment = async (paymentId, clerkId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const payment = await getOwnedPendingPayment(
      client,
      paymentId,
      clerkId
    );

    const { rows } = await client.query(
      `
        UPDATE payments
        SET status = 'REJECTED',
            updated_at = NOW()
        WHERE payment_id = $1
          AND status = 'PENDING'
        RETURNING payment_id, status, updated_at
      `,
      [payment.payment_id]
    );

    if (rows.length === 0) {
      throw createPaymentError(
        "Payment has already been processed",
        "PAYMENT_ALREADY_PROCESSED"
      );
    }

    await client.query("COMMIT");

    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  approveMessPayment,
  rejectMessPayment,
};