const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");

const {
  getActiveMealController,
} = require("../controllers/getActiveMeal.controller");
const {createMealController, } = require("../controllers/createMeal.controller");
const {
  getMealByIdController,
} = require("../controllers/getMealById.controller");
const {updateMealController,
} = require("../controllers/updateMealById.controlller");

const {
  getRecentMessPaymentsController,
} = require("../controllers/getRecentMessPayments.controller");

const {
  getRecentPaymentStatusController,
} = require("../controllers/getRecentPaymentStatus.controller");

const {
  getPendingMessPaymentsController,
} = require("../controllers/getPendingMessPayments.controller");

const {
  approveMessPaymentController,
  rejectMessPaymentController,
} = require("../controllers/paymentActions.controller");

const {
  goLiveMealController,
} = require("../controllers/goLiveMeal.controller");

const {
  getMealConfirmationsSummaryController,
} = require("../controllers/getMealConfirmationsSummary.controller");

const {
  getMessOwnerMealsController,
} = require("../controllers/getMessOwnerMeals.controller");

const {
  cancelMealController,
} = require("../controllers/cancelMeal.controller");

const {
  getPaygSettingsController,
} = require("../controllers/getPaygSettings.controller");

const {
  updatePaygSettingsController,
} = require("../controllers/updatePaygSettings.controller");

router.get(
  "/current-meal",
  authenticate,
  getActiveMealController
);

router.get(
  "/meals",
  authenticate,
  getMessOwnerMealsController
);


router.post("/meals", authenticate, createMealController)
router.get(
  "/meals/:mealId",
  authenticate,
  getMealByIdController
);

router.patch("/meals/:mealId",authenticate,updateMealController)
router.get("/payments/recent", authenticate, getRecentMessPaymentsController);
router.get("/payments/recent/status", authenticate, getRecentPaymentStatusController);
router.get("/payments/pending", authenticate, getPendingMessPaymentsController);


router.patch(
  "/payments/:paymentId/approve",
  authenticate,
  approveMessPaymentController
);

router.patch(
  "/payments/:paymentId/reject",
  authenticate,
  rejectMessPaymentController
);

router.patch(
  "/meals/:mealId/go-live",
  authenticate,
  goLiveMealController
);

router.get(
  "/meals/:mealId/confirmations/summary",
  authenticate,
  getMealConfirmationsSummaryController
);

router.patch(
  "/meals/:mealId/cancel",
  authenticate,
  cancelMealController
);

router.get(
  "/payg/settings",
  authenticate,
  getPaygSettingsController
);

router.put(
  "/payg/settings",
  authenticate,
  updatePaygSettingsController
);
module.exports = router;