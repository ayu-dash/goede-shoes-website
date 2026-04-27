const mongoose = require('mongoose');
const Settings = require('../models/Settings');
require('dotenv').config();

const debugSettings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const allSettings = await Settings.find();
        console.log('ALL SETTINGS DOCUMENTS:', JSON.stringify(allSettings, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugSettings();
