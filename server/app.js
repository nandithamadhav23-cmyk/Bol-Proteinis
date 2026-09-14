const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const dns = require('dns');


dns.setServers(['8.8.4.4', '8.8.8.8']);
dotenv.config();

const connectdb = require('./dbConfig/connectDb');


const app = express();

app.use('/api/webhooks', require('./routes/webhookRoutes'));
app.use(cors());

app.use(express.json());


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.get('/', (req, res) => {
  res.send('Bol Proteinis API is running');
});

connectdb();

// Bug fix: this used to read `env.PORT` (the dotenv module itself, which has
// no such property) instead of `process.env.PORT`, so the PORT set in .env
// was always silently ignored in favor of the 8080 fallback.
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`server running on Port ${port}`);
});