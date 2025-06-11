// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Routes
const productRoutes = require('./routes/productRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const stripeRoutes  = require('./routes/StripeRoutes');

const app = express();

// Datenbank verbinden
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Debug-Logging für jede Anfrage
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routen
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', stripeRoutes);

// Health-Check (optional)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404-Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route nicht gefunden.' });
});

// Error-Handling-Middleware (optional, für detailliertere Fehler)
app.use((err, req, res, next) => {
  console.error('Globaler Fehler:', err.stack);
  res.status(500).json({ message: 'Interner Serverfehler.' });
});

// Server starten
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf Port ${PORT}`);
});
