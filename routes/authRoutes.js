const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Tuyến đường đăng nhập
router.post('/login', authController.login);
router.get('/servertest', authController.servertest);

// Tuyến đường đăng ký
router.post('/register', authController.register);
router.post('/logout', authController.logout);

module.exports = router;
