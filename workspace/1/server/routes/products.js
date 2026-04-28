const express = require('express');
const router = express.Router();
const products = require('../data/products.json');

// GET /api/products - all products
router.get('/', (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  let filtered = [...products];

  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (minPrice) {
    filtered = filtered.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= Number(maxPrice));
  }

  res.json(filtered);
});

// GET /api/products/:id - single product
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Produit non trouvé' });
  }
  res.json(product);
});

module.exports = router;