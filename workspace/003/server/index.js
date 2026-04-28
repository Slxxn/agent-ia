// Point d'entrée du serveur Express
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Autorise les requêtes cross-origin (frontend sur port 5173)
app.use(express.json()); // Parse le body en JSON

// Routes
const productsRouter = require('./routes/products');
const paymentRouter = require('./routes/payment');

app.use('/api/products', productsRouter);
app.use('/api', paymentRouter);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend Tech Up Antilles opérationnel' });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});