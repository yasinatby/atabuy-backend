const express = require('express');
const router = express.Router();
const { getDashboardStats, getTopProducts } = require('../controllers/dashboardController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/stats', protect, isAdmin, getDashboardStats);
router.get('/top-products', protect, isAdmin, getTopProducts);

module.exports = router;
