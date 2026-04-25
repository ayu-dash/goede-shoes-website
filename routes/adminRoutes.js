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

module.exports = router;
