const {
  getMealHistory,
} = require("../../services/user/getMealHistory.service");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parseIntegerQuery = (value, defaultValue) => {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) ? parsedValue : null;
};

const getMealHistoryController = async (req, res) => {
  const clerkId = req.auth?.sub;

  if (!clerkId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const limit = parseIntegerQuery(req.query.limit, DEFAULT_LIMIT);
  const offset = parseIntegerQuery(req.query.offset, 0);

  if (
    limit === null ||
    limit < 1 ||
    limit > MAX_LIMIT ||
    offset === null ||
    offset < 0
  ) {
    return res.status(400).json({
      success: false,
      message: `limit must be between 1 and ${MAX_LIMIT}, and offset must be a non-negative integer`,
    });
  }

  try {
    const result = await getMealHistory(clerkId, { limit, offset });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Failed to fetch meal history:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch meal history",
    });
  }
};

module.exports = { getMealHistoryController };
