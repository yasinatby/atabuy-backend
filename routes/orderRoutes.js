// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

// POST   /api/orders             → neue Bestellung anlegen
router.post('/', createOrder);

// GET    /api/orders            → alle Bestellungen abrufen
router.get('/', getAllOrders);

// GET    /api/orders/:id        → Bestellung nach ID
router.get('/:id', getOrderById);

// PUT    /api/orders/:id/status → Bestellstatus updaten
router.put('/:id/status', updateOrderStatus);

module.exports = router;
