const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getMyOrders,
} = require('../controllers/orderController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

// Nur eingeloggte Nutzer dürfen Bestellungen aufgeben
router.post('/', protect, createOrder);

// Eigene Bestellungen anzeigen
router.get('/me', protect, getMyOrders);

// Nur Admins dürfen alle Bestellungen einsehen oder ändern
router.get('/', protect, isAdmin, getAllOrders);
router.put('/:id/status', protect, isAdmin, updateOrderStatus);

// Einzelbestellung: Nur Admins oder Eigentümer
router.get('/:id', protect, getOrderById);

module.exports = router;
