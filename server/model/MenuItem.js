const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['Salad', 'Soup', 'Bowl'], required: true },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      required: true,
    },
    dressing: String,
    description: String,
    calories: Number,
    protein: String,
    fat: String,
    fiber: String,
    carbs: String,
    glycemicIndex: Number,
    pricePerPortion: { type: Number, required: true },
    pricePerTwoPortions: { type: Number, required: true },
    image: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
