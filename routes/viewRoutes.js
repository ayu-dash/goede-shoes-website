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
router.get("/customer/dashboard", protect, async (req, res) => {
    try {
        const Order = require("../models/Order");
        const stats = await Order.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    activeOrders: {
                        $sum: {
                            $cond: [
                                { $in: ["$status", ["pending", "pickup", "in-progress", "delivery"]] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]);

        const recentOrders = await Order.find({ user: req.user._id })
            .sort("-createdAt")
            .limit(3);

        const userStats = stats[0] || { totalOrders: 0, activeOrders: 0 };
        res.render("customer/dashboard", {
            activePage: "dashboard",
            userStats,
            recentOrders,
        });
    } catch (err) {
        res.status(500).render("error", { message: "Gagal memuat dashboard." });
    }
});
router.get("/customer/create-order", protect, (req, res) =>
    res.render("customer/create-order", { activePage: "dashboard" }),
);
router.get("/customer/my-orders", protect, async (req, res) => {
    try {
        const Order = require("../models/Order");
        const orders = await Order.find({ user: req.user.id }).sort("-createdAt");
        res.render("customer/my-orders", { activePage: "my-orders", orders });
    } catch (err) {
        res.status(500).render("error", { message: "Gagal mengambil data pesanan." });
    }
});
router.get("/customer/order-detail", protect, async (req, res) => {
    try {
        const Order = require("../models/Order");
        const order = await Order.findOne({
            _id: req.query.id,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).render("error", { message: "Pesanan tidak ditemukan." });
        }

        res.render("customer/order-detail", { activePage: "my-orders", order });
    } catch (err) {
        res.status(500).render("error", { message: "Gagal memuat detail pesanan." });
    }
});
router.get("/customer/profile", protect, async (req, res) => {
    try {
        const Order = require("../models/Order");
        const stats = await Order.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    activeOrders: {
                        $sum: {
                            $cond: [
                                { $in: ["$status", ["pending", "pickup", "in-progress", "delivery"]] },
                                1,
                                0,
                            ],
                        },
                    },
                    totalSpent: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "cancelled"] }, 0, "$totalPrice"],
                        },
                    },
                },
            },
        ]);

        const userStats = stats[0] || { totalOrders: 0, activeOrders: 0, totalSpent: 0 };
        res.render("customer/profile", { activePage: "profile", userStats });
    } catch (err) {
        res.status(500).render("error", { message: "Gagal memuat profil." });
    }
});

router.get("/staff/dashboard", protect, restrictTo("staff", "admin"), (req, res) => res.render("staff/dashboard"));
router.get("/admin/dashboard", protect, restrictTo("admin"), (req, res) => res.render("admin/dashboard"));

module.exports = router;
