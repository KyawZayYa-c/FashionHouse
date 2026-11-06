const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { registerValidator, loginValidator } = require('../middleware/validator');

// Public routes (no auth required)

// POST /register
router.post('/register', registerValidator, authController.register);

// POST /login
router.post('/login', loginValidator, authController.login);

// GET /me - requires authentication
router.get('/me', authMiddleware, authController.getMe);

// PUT /profile - requires authentication
router.put('/profile', authMiddleware, authController.updateProfile);

// PUT /change-password - requires authentication
router.put('/change-password', authMiddleware, authController.changePassword);

// POST /addresses - requires authentication
router.post('/addresses', authMiddleware, authController.manageAddresses);

// PUT /addresses/:addressId - requires authentication
router.put('/addresses/:addressId', authMiddleware, authController.manageAddresses);

// DELETE /addresses/:addressId - requires authentication
router.delete('/addresses/:addressId', authMiddleware, authController.manageAddresses);

module.exports = router;