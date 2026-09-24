const express = require("express");

const authenticate = require("../middleware/auth.middleware");

const {
  getMessPartnerController,
} = require("../controllers/getMessPartnerSetup.controller");

const {
  updateMonthlyPriceController,
} = require("../controllers/updateMonthlyPrice.controller");

const {
  updateMessProfileController,
} = require("../controllers/updateMessProfile.controller");

const uploadMessPhoto = require("../middleware/messPhotoUpload.middleware");
const {
  updateMessPhotoController,
} = require("../controllers/updateMessPhoto.controller");

const router = express.Router();

router.get(
  "/setup",
  authenticate,
  getMessPartnerController
);

router.patch("/setup/price", authenticate, updateMonthlyPriceController);

router.patch("/setup/profile", authenticate, updateMessProfileController);

router.patch(
  "/setup/photo",
  authenticate,
  uploadMessPhoto.single("photo"),
  updateMessPhotoController
);
module.exports = router;