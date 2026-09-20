const express = require("express");

const authenticate = require("../middleware/auth.middleware");

const { saveOnboardingDetails } = require("../controllers/onboarding.controller");

const router = express.Router();

router.post(
  "/onboarding",
  authenticate,
  saveOnboardingDetails
);

module.exports = router;