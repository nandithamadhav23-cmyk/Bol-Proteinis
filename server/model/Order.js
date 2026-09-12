const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true }, // snapshot, in case menu changes later
    day: String,
    portions: { type: Number, enum: [1, 2], default: 1 },
    quantity: { type: Number, default: 1, min: 1 },
    price: { type: Number, required: true }, // snapshot price at order time (per unit)
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Customer details — same fields as the Google Form
    email: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    community: { type: String, required: true },
    flatNumber: { type: String, required: true, trim: true },

    // Order contents
    items: [orderItemSchema],
    subscriptionPlan: String, // e.g. "Salad - Weekly", null for one-off orders
    allergiesNotes: String,

    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paymentMethod: { type: String, default: 'UPI' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);