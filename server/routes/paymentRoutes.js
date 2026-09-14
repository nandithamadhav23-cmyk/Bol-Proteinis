const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const razorpay = require('../utils/razorpay');
const Order = require('../model/Order');

// POST /api/payment/create-order — starts a Razorpay payment for an existing app order
router.post('/create-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/verify — verifies the signature Razorpay returns after checkout
router.post('/verify', async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed — signature mismatch' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        paymentMethod: 'Razorpay',
        razorpayPaymentId: razorpay_payment_id,
      },
      { returnDocument: 'after' }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;