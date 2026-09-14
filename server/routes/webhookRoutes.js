const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Order = require('../model/Order');

// IMPORTANT: this route needs the RAW request body to verify Razorpay's
// signature, so it uses express.raw() here instead of relying on the app's
// global express.json(). This route MUST be mounted in server.js BEFORE
// app.use(express.json()) runs — see the note in SERVER_JS_ADDITIONS.txt.
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body) // raw Buffer, not parsed JSON — required for a valid signature match
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Webhook signature mismatch');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      const order = await Order.findOne({ razorpayOrderId });
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paymentMethod = 'Razorpay';
        order.razorpayPaymentId = payment.id;
        await order.save();
        console.log(`Webhook: marked order ${order._id} as paid`);
      }
    }

    // Always acknowledge receipt so Razorpay doesn't keep retrying
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

module.exports = router;