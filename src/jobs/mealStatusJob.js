
const cron = require("node-cron");
const pool = require("../config/db");

const startMealStatusJob = () => {
  cron.schedule(
    "*/1 * * * *",
    async () => {
      try {
        const result = await pool.query(`
          UPDATE meals
          SET
            status = 'ENDED',
            updated_at = NOW()
          WHERE status = 'ACTIVE'
            AND meal_date + end_time
                <= (NOW() AT TIME ZONE 'Asia/Kolkata')
        `);

        if (result.rowCount > 0) {
          console.log(
            `Marked ${result.rowCount} meals as ENDED`
          );
        }
      } catch (error) {
        console.error("Meal status update failed:", error);
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log("Meal status cron job registered");
};

module.exports = { startMealStatusJob };
