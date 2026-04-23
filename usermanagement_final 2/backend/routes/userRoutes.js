const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

// All user management routes require auth + admin
router.use(protect, adminOnly);

// Stats route (must come before /:id to avoid conflict)
router.get('/stats', getDashboardStats);

// CRUD routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
