const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planType: { type: String, required: true }, // e.g. "Protein Bowls", "Salads", "Smoothies"
    duration: { type: String, enum: ['Weekly', 'Fortnightly', 'Monthly'], required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
    startDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);