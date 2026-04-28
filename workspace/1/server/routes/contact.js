const express = require('express');
const router = express.Router();

// POST /api/contact - simulate sending a contact message
router.post('/', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
  }
  // In a real app, you would send an email or save to database
  console.log(`Nouveau message de ${name} (${email}): ${message}`);
  res.json({ success: true, message: 'Message envoyé avec succès !' });
});

module.exports = router;