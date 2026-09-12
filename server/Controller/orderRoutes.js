const express = require('express');
const router = express.Router();
const Order = require('../model/Order');
const { sendOrderEmails } = require('../utils/sendEmail');
const { sendOrderWhatsApp } = require('../utils/sendWhatsApp');

// POST /api/orders - create a new order (customer-facing)
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();

    // Fire notifications in the background — a notification failure
    // should never block the customer's order from going through.
    sendOrderEmails(order).catch((err) => console.error('Email error:', err.message));
    sendOrderWhatsApp(order).catch((err) => console.error('WhatsApp error:', err.message));

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders - list all orders (admin only — add auth middleware later)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status - update order status (admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;