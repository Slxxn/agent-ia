const express = require('express');
const cors = require('cors');
const path = require('path');

const productsRouter = require('./routes/products');
const contactRouter = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001', 'https://techup-antilles.netlify.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Static files (optional, for future use)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/products', productsRouter);
app.use('/api/contact', contactRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`TechUp Antilles server running on http://localhost:${PORT}`);
});