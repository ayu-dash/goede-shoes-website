const express = require("express");
const router = express.Router();
const {
  protect,
  restrictTo,
  isLoggedIn,
} = require("../middlewares/authMiddleware");
const viewController = require("../controllers/viewController");

// Apply isLoggedIn to all view routes to populate res.locals.user
router.use(isLoggedIn);

router.get("/", viewController.renderIndex);
router.get("/login", viewController.renderLogin);
router.get("/register", viewController.renderRegister);
router.get("/verify", viewController.renderVerify);
router.get("/forgot-password", viewController.renderForgotPassword);
router.get("/reset-password", viewController.renderResetPassword);

// Rute Dashboard (Protected)
router.get(
  "/customer/dashboard",
  protect,
  viewController.renderCustomerDashboard,
);
router.get(
  "/customer/create-order",
  protect,
  viewController.renderCustomerCreateOrder,
);
router.get(
  "/customer/my-orders",
  protect,
  viewController.renderCustomerMyOrders,
);
router.get(
  "/customer/order-detail",
  protect,
  viewController.renderCustomerOrderDetail,
);
router.get("/customer/profile", protect, viewController.renderCustomerProfile);

router.get(
  "/staff/dashboard",
  protect,
  restrictTo("staff", "admin"),
  viewController.renderStaffDashboard,
);
router.get(
  "/staff/profile",
  protect,
  restrictTo("staff", "admin"),
  viewController.renderStaffProfile,
);

router.get(
  "/staff/operations",
  protect,
  restrictTo("staff", "admin"),
  viewController.renderStaffOperations,
);
router.get(
  "/staff/history",
  protect,
  restrictTo("staff", "admin"),
  viewController.renderStaffHistory,
);
router.get(
  "/staff/washing",
  protect,
  restrictTo("staff", "admin"),
  viewController.renderStaffWashing,
);
router.get(
  "/staff/order/:id",
  protect,
  restrictTo("staff", "admin"),
  viewController.renderStaffOrderDetail,
);

router.get(
  "/admin/dashboard",
  protect,
  restrictTo("admin"),
  viewController.renderAdminDashboard,
);
router.get(
  "/admin/services",
  protect,
  restrictTo("admin"),
  viewController.renderAdminServices,
);
router.get(
  "/admin/customers",
  protect,
  restrictTo("admin"),
  viewController.renderAdminCustomers,
);

router.get(
  "/admin/employees",
  protect,
  restrictTo("admin"),
  viewController.renderAdminEmployees,
);
router.get(
  "/admin/operations",
  protect,
  restrictTo("admin"),
  viewController.renderAdminOperations,
);

router.get(
  "/admin/profile",
  protect,
  restrictTo("admin"),
  viewController.renderAdminProfile,
);

module.exports = router;
