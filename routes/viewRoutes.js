const express = require("express");
const router = express.Router();
const { protect, restrictTo, isLoggedIn } = require("../middlewares/authMiddleware");

// Apply isLoggedIn to all view routes to populate res.locals.user
router.use(isLoggedIn);

router.get("/", (req, res) => res.render("index"));
router.get("/login", (req, res) => res.render("auth/login"));
router.get("/register", (req, res) => res.render("auth/register"));
router.get("/verify", (req, res) => res.render("auth/verify"));
router.get("/forgot-password", (req, res) =>
    res.render("auth/forgot-password"),
);
router.get("/reset-password", (req, res) => res.render("auth/reset-password"));

// Rute Dashboard (Protected)
router.get("/customer/dashboard", protect, (req, res) =>
    res.render("customer/dashboard", { activePage: "dashboard" }),
);
router.get("/customer/create-order", protect, (req, res) =>
    res.render("customer/create-order", { activePage: "dashboard" }),
);
router.get("/customer/my-orders", protect, (req, res) =>
    res.render("customer/my-orders", { activePage: "my-orders" }),
);
router.get("/customer/order-detail", protect, (req, res) =>
    res.render("customer/order-detail", { activePage: "my-orders" }),
);
router.get("/customer/profile", protect, (req, res) =>
    res.render("customer/profile", { activePage: "profile" }),
);

router.get("/staff/dashboard", protect, restrictTo("staff", "admin"), (req, res) => res.render("staff/dashboard"));
router.get("/admin/dashboard", protect, restrictTo("admin"), (req, res) => res.render("admin/dashboard"));

module.exports = router;
