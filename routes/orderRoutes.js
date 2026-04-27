const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

router.post("/", orderController.createOrder);
router.get("/my-orders", orderController.getMyOrders);

// Staff & Admin Routes
router.patch(
    "/:id/update-status",
    authMiddleware.restrictTo("staff", "admin"),
    orderController.upload.array("photos", 5),
    orderController.updateOrderStatus
);
router.patch(
    "/:id/confirm-payment",
    authMiddleware.restrictTo("staff", "admin"),
    orderController.confirmPayment
);

module.exports = router;
