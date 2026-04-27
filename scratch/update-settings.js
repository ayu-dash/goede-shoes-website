const mongoose = require('mongoose');
const Settings = require('../models/Settings');
require('dotenv').config();

const updateSettings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        let settings = await Settings.findOne();
        if (settings) {
            console.log('Current settings found');
            settings.pickupFee = (settings.pickupFee !== undefined && settings.pickupFee !== null) ? settings.pickupFee : 15000;
            settings.deliveryFee = (settings.deliveryFee !== undefined && settings.deliveryFee !== null) ? settings.deliveryFee : 15000;
            await settings.save();
            console.log('Updated settings with defaults');
        } else {
            settings = await Settings.create({
                pickupFee: 15000,
                deliveryFee: 15000
            });
            console.log('Created new settings with defaults');
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateSettings();
