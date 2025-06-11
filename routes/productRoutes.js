// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  addProduct,
  deleteProduct,
  updateProduct,
} = require('../controllers/productController');

// GET  /api/products       → alle Produkte
router.get('/', getProducts);

// GET  /api/products/:id   → Produkt nach ID
router.get('/:id', getProductById);

// POST /api/products       → neues Produkt anlegen
router.post('/', addProduct);

// PUT  /api/products/:id   → Produkt aktualisieren
router.put('/:id', updateProduct);

// DELETE /api/products/:id → Produkt löschen
router.delete('/:id', deleteProduct);

module.exports = router;
