const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');

// POST /api/create-payment-intent – Créer une intention de paiement Stripe
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'eur', paymentMethodType = 'card' } = req.body;

    // Validation des entrées
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Le montant doit être un nombre positif' });
    }

    // Création de l'intention de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe attend le montant en centimes
      currency,
      payment_method_types: [paymentMethodType],
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    console.error('Erreur lors de la création du paiement :', error);
    res.status(500).json({ error: 'Erreur lors de la création du paiement', details: error.message });
  }
});

module.exports = router;