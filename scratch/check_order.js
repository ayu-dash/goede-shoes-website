const mongoose = require('mongoose');
const Order = require('../models/Order');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGO_URI;
console.log('Connecting to:', uri);

mongoose.connect(uri).then(async () => {
  const order = await Order.findById('69e52d999502512497bd1ed6');
  if (!order) {
    console.log('Order not found');
    process.exit();
  }
  console.log('Order ID:', order.orderId);
  console.log('Logistics:', JSON.stringify(order.logistics, null, 2));
  process.exit();
}).catch(err => {
  console.error('Connection error:', err);
  process.exit();
});
