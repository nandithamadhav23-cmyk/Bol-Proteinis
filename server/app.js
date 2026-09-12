const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const dns = require('dns');


dns.setServers(['8.8.4.4', '8.8.8.8']);
dotenv.config();

const connectdb = require('./dbConfig/connectDb');
const menuRoutes = require('./Controller/menuRoutes');
const orderRoutes = require('./Controller/orderRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

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