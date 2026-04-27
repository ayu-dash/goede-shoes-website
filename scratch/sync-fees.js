const mongoose = require('mongoose');
const Settings = require('../models/Settings');
require('dotenv').config();

const syncFees = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        let settings = await Settings.findOne();
        if (settings) {
            console.log('Current shippingRatePerKm:', settings.shippingRatePerKm);
            // Sync pickup and delivery fees to the existing shippingRatePerKm (5000)
            settings.pickupFee = settings.shippingRatePerKm || 5000;
            settings.deliveryFee = settings.shippingRatePerKm || 5000;
            await settings.save();
            console.log('Synced pickupFee and deliveryFee to:', settings.pickupFee);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

syncFees();
