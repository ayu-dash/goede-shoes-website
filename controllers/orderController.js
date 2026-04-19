const Order = require("../models/Order");

// Mock Price Map (Based on Website)
const SERVICE_PRICES = {
    "Deep Clean (Regular)": 40000,
    "Fast Clean": 25000,
    "Deep Clean Express": 60000,
    "Premium Repaint": 150000,
};

const ADDON_PRICES = {
    "Unyellowing": 50000,
    "Glue & Repress": 60000,
    "Leather Polish": 30000,
    "Deodorizer": 15000,
};

const LOGISTICS_FEE = 15000;

exports.createOrder = async (req, res) => {
    try {
        const { items, logistics, payment } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide at least one shoe item",
            });
        }

        // Calculate prices for each item
        const processedItems = items.map((item) => {
            let itemPrice = SERVICE_PRICES[item.serviceType] || 40000;
            
            if (item.addons && Array.isArray(item.addons)) {
                item.addons.forEach((addon) => {
                    itemPrice += ADDON_PRICES[addon] || 0;
                });
            }

            return {
                ...item,
                price: itemPrice,
            };
        });

        const subtotal = processedItems.reduce((acc, item) => acc + item.price, 0);
        const totalLogistics = (logistics.pickupMethod === "pickup" || logistics.deliveryMethod === "delivery") ? LOGISTICS_FEE : 0;
        const totalPrice = subtotal + totalLogistics;

        const newOrder = await Order.create({
            user: req.user.id,
            items: processedItems,
            logistics,
            payment,
            totalPrice,
        });

        res.status(201).json({
            status: "success",
            data: {
                order: newOrder,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort("-createdAt");

        res.status(200).json({
            status: "success",
            results: orders.length,
            data: {
                orders,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};
