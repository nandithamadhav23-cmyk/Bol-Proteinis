// Run with: node seed.js
// Populates the MenuItem collection with this week's menu.
require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./model/MenuItem');
const dns = require('dns');
dns.setServers(['8.8.4.4', '8.8.8.8']);
const items = [
  {
    name: 'Jardin Salad',
    type: 'Salad',
    day: 'Monday',
    dressing: 'Homemade Thousand Island Dressing',
    description:
      'Tender steamed baby potatoes, blanched broccoli, cauliflower and carrots, and steamed green peas, joined by juicy tomatoes and crisp lettuce. Black eye beans and fresh cucumber slices round out the texture.',
    calories: 252,
    protein: '18g',
    fat: '10g',
    fiber: '11g',
    carbs: '36g',
    pricePerPortion: 375,
    pricePerTwoPortions: 700,
  },
  {
    name: 'Hot Garlic Sweet Corn Soup',
    type: 'Soup',
    day: 'Monday',
    description:
      'A comforting blend of sweet corn, aromatic garlic, and fresh vegetables, simmered into a light, flavourful soup with a delicious hint of spice.',
    calories: 140,
    glycemicIndex: 47,
    pricePerPortion: 235,
    pricePerTwoPortions: 430,
  },
  {
    name: 'Chimichurri Chickpea & Feta Salad',
    type: 'Salad',
    day: 'Tuesday',
    dressing: 'House-made Chimichurri Dressing',
    description:
      'Protein-rich chickpeas, sweet corn kernels, juicy cherry tomatoes, crisp cucumber, red onions, colourful capsicum, feta crumbles and fresh iceberg lettuce, tossed for a herby, tangy finish.',
    calories: 268,
    protein: '21g',
    fat: '8g',
    fiber: '13g',
    carbs: '43g',
    pricePerPortion: 375,
    pricePerTwoPortions: 700,
  },
  {
    name: 'Broccoli and Pumpkin Soup',
    type: 'Soup',
    day: 'Tuesday',
    description:
      'Creamy roasted pumpkin and broccoli, subtly spiced and blended to velvety perfection — nourishing and comforting in every spoonful.',
    calories: 130,
    glycemicIndex: 22,
    pricePerPortion: 235,
    pricePerTwoPortions: 430,
  },
  {
    name: 'Creamy Garden Macaroni Salad',
    type: 'Salad',
    day: 'Wednesday',
    dressing: 'Greek Yoghurt Dressing',
    description:
      'Al dente macaroni, crisp red bell peppers, sweet green peas, shredded carrots, golden corn, cucumber, iceberg lettuce, onion and sliced olives, finished with pumpkin and melon seeds.',
    calories: 296,
    protein: '16g',
    fat: '9g',
    fiber: '11g',
    carbs: '51g',
    pricePerPortion: 375,
    pricePerTwoPortions: 700,
  },
  {
    name: 'Vegetables & Chickpeas Greek Soup',
    type: 'Soup',
    day: 'Wednesday',
    description:
      'A rustic Hellenic medley where tender chickpeas simmer with garden vegetables in a herb-infused broth, kissed with olive oil.',
    calories: 190,
    glycemicIndex: 35,
    pricePerPortion: 235,
    pricePerTwoPortions: 430,
  },
  {
    name: 'Tropical Twister Salad',
    type: 'Salad',
    day: 'Thursday',
    dressing: 'Passion Fruit Dressing',
    description:
      'Pineapple chunks, crisp cucumbers, sweet bell peppers, tomato cuts and shredded carrots over iceberg lettuce, topped with hearty pinto beans and a sprinkle of sunflower and flax seeds.',
    calories: 264,
    protein: '19g',
    fat: '12g',
    fiber: '10g',
    carbs: '35g',
    pricePerPortion: 375,
    pricePerTwoPortions: 700,
  },
  {
    name: 'Minestrone Soup',
    type: 'Soup',
    day: 'Thursday',
    description:
      'A rustic Italian classic — seasonal vegetables, tender beans and al dente pasta simmered in a rich tomato-herb broth, finished with a drizzle of olive oil.',
    calories: 180,
    glycemicIndex: 40,
    pricePerPortion: 235,
    pricePerTwoPortions: 430,
  },
  {
    name: 'Paneer Buddha Bowl',
    type: 'Bowl',
    day: 'Friday',
    dressing: 'Cashew-based Dressing',
    description:
      'Spiced sorghum sautéed with spinach, flavoured paneer cubes, cherry tomatoes, pan-seared corn, crisp cucumber, shredded purple cabbage and yellow bell peppers, finished with a rich, creamy cashew dressing.',
    calories: 420,
    protein: '22g',
    fat: '12g',
    fiber: '11g',
    carbs: '41g',
    pricePerPortion: 425,
    pricePerTwoPortions: 800,
  },
  {
    name: 'Moringa Soup',
    type: 'Soup',
    day: 'Friday',
    description:
      'A nourishing blend of vibrant moringa, slow-simmered for a deep, earthy essence and infused with aromatic spices.',
    calories: 145,
    glycemicIndex: 19,
    pricePerPortion: 235,
    pricePerTwoPortions: 430,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB connected');
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(items);
    console.log(`Seeded ${items.length} menu items`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

seed();
