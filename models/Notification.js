const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "Notification must belong to a user"],
        },
        title: {
            type: String,
            required: [true, "Notification must have a title"],
        },
        message: {
            type: String,
            required: [true, "Notification must have a message"],
        },
        type: {
            type: String,
            enum: ["order", "payment", "system"],
            default: "order",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
