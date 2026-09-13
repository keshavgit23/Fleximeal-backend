const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const { authenticateUser } = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/authenticate",
  authenticate,
  authenticateUser
);

module.exports = router;