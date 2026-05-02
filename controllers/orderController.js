const Order = require("../models/Order");

const Service = require("../models/Service");
const Settings = require("../models/Settings");



const snap = require("../utils/midtrans");

exports.createOrder = async (req, res) => {
    try {
        const { items, logistics, payment } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide at least one shoe item",
            });
        }

        // Fetch dynamic prices and settings from DB
        const dbServices = await Service.find();
        const settings = await Settings.findOne() || { shippingRatePerKm: 5000 };
        
        const SERVICE_PRICES = {};
        const ADDON_PRICES = {};
        dbServices.forEach(s => {
            if (s.category === "Additional Cost") {
                ADDON_PRICES[s.name] = s.price;
            } else {
                SERVICE_PRICES[s.name] = s.price;
            }
        });

        // Calculate prices for each item with DB validation
        const processedItems = [];
        for (const item of items) {
            if (!item.serviceType || item.serviceType === "Belum dipilih") {
               return res.status(400).json({
                   status: "fail",
                   message: "Service type cannot be empty",
               });
            }
            if (SERVICE_PRICES[item.serviceType] === undefined) {
               return res.status(400).json({
                   status: "fail",
                   message: `Invalid service type selected: ${item.serviceType}`,
               });
            }

            let itemPrice = SERVICE_PRICES[item.serviceType];
            
            if (item.addons && Array.isArray(item.addons)) {
                for (const addon of item.addons) {
                    if (ADDON_PRICES[addon] !== undefined) {
                        itemPrice += ADDON_PRICES[addon];
                    }
                }
            }

            processedItems.push({
                ...item,
                price: itemPrice,
            });
        }

        // 1. Calculate prices
        const subtotal = processedItems.reduce((acc, item) => acc + item.price, 0);
        let totalLogistics = 0;
        if (logistics.pickupMethod === "pickup") totalLogistics += (settings.shippingRatePerKm || 5000);
        if (logistics.deliveryMethod === "delivery") totalLogistics += (settings.shippingRatePerKm || 5000);
        const totalPrice = subtotal + totalLogistics;

        // 2. Prepare Order Object (But don't save to DB yet if bank payment)
        const orderId = `GS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        let snapToken = null;
        let snapRedirectUrl = null;

        if (payment.method === "bank") {
            try {
                const parameter = {
                    transaction_details: {
                        order_id: orderId,
                        gross_amount: totalPrice,
                    },
                    customer_details: {
                        first_name: req.user.name,
                        email: req.user.email,
                        phone: req.user.phone,
                    },
                    item_details: processedItems.map(item => ({
                        id: item.serviceType,
                        price: item.price,
                        quantity: 1,
                        name: `${item.shoeName} (${item.serviceType})`,
                    })).concat([
                        {
                            id: 'shipping-fee',
                            price: totalLogistics,
                            quantity: 1,
                            name: 'Biaya Penjemputan & Pengantaran'
                        }
                    ]),
                    callbacks: {
                        finish: `${req.protocol}://${req.get('host')}/customer/my-orders`,
                        error: `${req.protocol}://${req.get('host')}/customer/my-orders`,
                        pending: `${req.protocol}://${req.get('host')}/customer/my-orders`
                    }
                };

                const transaction = await snap.createTransaction(parameter);
                snapToken = transaction.token;
                snapRedirectUrl = transaction.redirect_url;
            } catch (snapError) {
                return res.status(400).json({
                    status: "fail",
                    message: "Midtrans Error: " + snapError.message,
                });
            }
        }

        // 3. Save to Database (Only if Snap token is secured or payment is COD)
        const newOrder = await Order.create({
            orderId,
            user: req.user.id,
            items: processedItems,
            logistics: {
                pickupMethod: logistics.pickupMethod,
                deliveryMethod: logistics.deliveryMethod,
                pickupAddress: logistics.pickupAddress,
                pickupPhone: logistics.pickupPhone || req.user.phone,
                deliveryAddress: logistics.deliveryAddress,
                deliveryPhone: logistics.deliveryPhone || req.user.phone,
                pickupFee: logistics.pickupMethod === "pickup" ? (settings.shippingRatePerKm || 5000) : 0,
                deliveryFee: logistics.deliveryMethod === "delivery" ? (settings.shippingRatePerKm || 5000) : 0,
            },
            payment: {
                ...payment,
                snapToken
            },
            totalPrice,
        });

        res.status(201).json({
            status: "success",
            data: {
                order: newOrder,
                snapToken,
                snapRedirectUrl
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

const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/orders");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, `order-${req.params.id}-${uniqueSuffix}${ext}`);
    },
});

exports.upload = multer({ storage });

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                status: "fail",
                message: "Order not found",
            });
        }

        // Check if Bank Transfer must be paid first
        if (order.payment.method === 'bank' && order.payment.status !== 'paid') {
            return res.status(400).json({
                status: "fail",
                message: "Pesanan dengan metode Transfer harus dilunasi terlebih dahulu sebelum diproses."
            });
        }

        const historyEntry = {
            status,
            updatedBy: req.user.id,
            updatedAt: Date.now(),
            note,
            photos: [],
        };

        if (req.files && req.files.length > 0) {
            historyEntry.photos = req.files.map(file => `/uploads/orders/${file.filename}`);
        } else if (req.file) {
            historyEntry.photos = [`/uploads/orders/${req.file.filename}`];
        }

        order.status = status;
        order.statusHistory.push(historyEntry);

        await order.save();

        res.status(200).json({
            status: "success",
            data: {
                order,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

exports.confirmPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                status: "fail",
                message: "Order not found",
            });
        }

        order.payment.status = "paid";
        order.statusHistory.push({
            status: "paid",
            updatedBy: req.user.id,
            updatedAt: Date.now(),
            note: "Payment confirmed by staff",
        });

        await order.save();

        res.status(200).json({
            status: "success",
            data: {
                order,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};
// 4. Handle Midtrans Notification (Webhook)
exports.handleNotification = async (req, res) => {
    try {
        const statusResponse = req.body;
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Notification received. Order ID: ${orderId}. Status: ${transactionStatus}`);

        const order = await Order.findOne({ orderId: orderId });

        if (!order) {
            return res.status(404).json({
                status: "error",
                message: "Order not found"
            });
        }

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                // TODO: set transaction status on your database to 'challenge'
                // e.g: herOrder.paymentStatus = 'challenge';
            } else if (fraudStatus == 'accept') {
                order.payment.status = 'paid';
                order.status = 'pickup'; // Langsung lanjut ke penjemputan
            }
        } else if (transactionStatus == 'settlement') {
            order.payment.status = 'paid';
            order.status = 'pickup'; // Langsung lanjut ke penjemputan
        } else if (transactionStatus == 'cancel' ||
            transactionStatus == 'deny' ||
            transactionStatus == 'expire') {
            order.payment.status = 'failed';
        } else if (transactionStatus == 'pending') {
            order.payment.status = 'pending';
        }

        await order.save();

        return res.status(200).json({
            status: "success",
            message: "OK"
        });
    } catch (err) {
        console.error("Webhook Error:", err);
        return res.status(500).json({
            status: "error",
            message: err.message
        });
    }
};
