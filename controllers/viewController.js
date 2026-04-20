const Order = require("../models/Order");

exports.renderIndex = (req, res) => res.render("index");

exports.renderLogin = (req, res) => res.render("auth/login");

exports.renderRegister = (req, res) => res.render("auth/register");

exports.renderVerify = (req, res) => res.render("auth/verify");

exports.renderForgotPassword = (req, res) => res.render("auth/forgot-password");

exports.renderResetPassword = (req, res) => res.render("auth/reset-password");

exports.renderCustomerDashboard = async (req, res) => {
    try {
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
};

exports.renderCustomerCreateOrder = (req, res) => {
    res.render("customer/create-order", { activePage: "dashboard" });
};

exports.renderCustomerMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort("-createdAt");
        res.render("customer/my-orders", { activePage: "my-orders", orders });
    } catch (err) {
        res.status(500).render("error", { message: "Gagal mengambil data pesanan." });
    }
};

exports.renderCustomerOrderDetail = async (req, res) => {
    try {
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
};

exports.renderCustomerProfile = async (req, res) => {
    try {
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
};

exports.renderStaffDashboard = (req, res) => res.render("staff/dashboard");
exports.renderAdminDashboard = (req, res) => res.render("admin/dashboard");





