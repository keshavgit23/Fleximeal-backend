const pool = require("../../config/db");
const { getInternalUserId } = require("./getInternalUserId.service");

const getMyPaygBookings = async (clerkId) => {
  const userId = await getInternalUserId(clerkId);

  const result = await pool.query(
    `
      SELECT
        pb.booking_id,
        pb.booking_status,
        pb.booked_at,
        pb.updated_at,
        m.meal_id,
        m.profile_id,
        m.meal_date,
        m.meal_type,
        m.start_time,
        m.end_time,
        m.status AS meal_status,
        pp.price,
        mp.mess_name,
        mp.photo_url,
        mp.listing_status
      FROM payg_bookings pb
      JOIN meals m
        ON m.meal_id = pb.meal_id
      JOIN mess_profiles mp
        ON mp.profile_id = m.profile_id
      LEFT JOIN payg_prices pp
        ON pp.profile_id = m.profile_id
       AND pp.meal_type = m.meal_type
      WHERE pb.user_id = $1
        AND m.status IN ('UPCOMING', 'ACTIVE')
      ORDER BY m.meal_date ASC, m.start_time ASC
    `,
    [userId]
  );

  return result.rows;
};

module.exports = { getMyPaygBookings };