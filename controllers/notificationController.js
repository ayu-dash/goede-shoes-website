const Notification = require("../models/Notification");

// Get all notifications for the authenticated user
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort("-createdAt")
            .limit(20);

        const unreadCount = await Notification.countDocuments({
            user: req.user.id,
            isRead: false,
        });

        res.status(200).json({
            status: "success",
            unreadCount,
            data: {
                notifications,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

// Mark a specific notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                status: "fail",
                message: "Notification not found",
            });
        }

        res.status(200).json({
            status: "success",
            data: {
                notification,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            status: "success",
            message: "All notifications marked as read",
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};
