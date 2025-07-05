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

const { protect, isAdmin } = require('../middleware/authMiddleware');

// Öffentlich zugänglich
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-Funktionen geschützt
router.post('/', protect, isAdmin, addProduct);
router.put('/:id', protect, isAdmin, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;
