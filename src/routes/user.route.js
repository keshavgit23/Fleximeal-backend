const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");

const {
  getMyActiveSubscriptionsController,
} = require("../controllers/user/subscription.controller");

const {
  getPublishedMessesController,
} = require("../controllers/user/getPublishedMesses.controller");

const {
  newSubscriptionController,
} = require("../controllers/user/newSubscription.controller");

const {
  createPaymentController,
} = require("../controllers/user/createPayment.controller");

const {
  getUserPaymentsController,
} = require("../controllers/user/getUserPayments.controller");

const {
  getMyLiveMealsController,
} = require("../controllers/user/getMeals.controller");

const {
  respondToMealConfirmationController,
} = require("../controllers/user/respondToMealConfirmation.controller");

const {
  getPaygMealsController,
} = require("../controllers/user/getPaygMeals.controller");

const {
  createPaygBookingController,
} = require("../controllers/user/createPaygBooking.controller");

const {
  getMyPaygBookingsController,
} = require("../controllers/user/getMyPaygBookings.controller");

// Get current user's active subscriptions
router.get(
  "/subscriptions/me",
  authenticate,
  getMyActiveSubscriptionsController
);

router.get(
  "/messes",
  authenticate,
  getPublishedMessesController
);

router.post(
  "/subscription/new",
  authenticate,
  newSubscriptionController
)

router.post(
  "/payment/create",
  authenticate,
  createPaymentController
)
router.get(
  "/payments",
  authenticate,
  getUserPaymentsController
);

router.get(
  "/meals/live",
  authenticate,
  getMyLiveMealsController
);

router.patch(
  "/meal-confirmations/:confirmationId",
  authenticate,
  respondToMealConfirmationController
);

router.get("/payg/meals", getPaygMealsController);

router.post(
  "/payg/bookings",
  authenticate,
  createPaygBookingController
);

router.get(
  "/payg/bookings",
  authenticate,
  getMyPaygBookingsController
);

module.exports = router;
