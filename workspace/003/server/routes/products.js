const express = require('express');
const router = express.Router();
const products = require('../data/products.json');

// GET /api/products – Récupérer tous les produits
router.get('/', (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/products/:id – Récupérer un produit par son ID
router.get('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const product = products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json(product);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/products – Ajouter un nouveau produit (réservé admin)
router.post('/', (req, res) => {
  try {
    const { name, price, category, image, description } = req.body;

    // Validation simple
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Champs obligatoires : name, price, category' });
    }

    const newProduct = {
      id: products.length + 1,
      name,
      price,
      category,
      image: image || '',
      description: description || ''
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Erreur lors de la création du produit :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;