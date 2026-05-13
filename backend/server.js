require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// Routes (individual route files per domain)
app.use('/api/products', require('./src/routes/products'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/users', require('./src/routes/users'));

// Error handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));