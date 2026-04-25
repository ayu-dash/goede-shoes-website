const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// All routes are protected and restricted to admin
router.use(protect);
router.use(restrictTo("admin"));

router
  .route("/staff")
  .get(adminController.getAllStaff)
  .post(adminController.createStaff);

router
  .route("/staff/:id")
  .patch(adminController.updateStaff)
  .delete(adminController.deleteStaff);

// Customer Management
router.route("/customers").get(adminController.getAllCustomers);
router
  .route("/customers/:id")
  .patch(adminController.updateStaff) // Reusing updateStaff logic for customers
  .delete(adminController.deleteStaff); // Reusing deleteStaff logic for customers

router.get("/customers/:id/orders", adminController.getCustomerOrders);

// Operational Settings
router
  .route("/settings")
  .get(adminController.getSettings)
  .patch(adminController.updateSettings);

module.exports = router;
