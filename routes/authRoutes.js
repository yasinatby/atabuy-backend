const express = require('express');
const router = express.Router();
const { register, login, verify2FA } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FA);

module.exports = router;
