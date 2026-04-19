const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

router.post("/", orderController.createOrder);
router.get("/my-orders", orderController.getMyOrders);

module.exports = router;
