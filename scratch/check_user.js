const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri).then(async () => {
  const user = await User.findOne({ email: 'adrianyudhaswara@gmail.com' });
  if (!user) {
    console.log('User not found');
    process.exit();
  }
  console.log('User Name:', user.name);
  console.log('Addresses:', JSON.stringify(user.addresses, null, 2));
  process.exit();
}).catch(err => {
  console.error('Connection error:', err);
  process.exit();
});
