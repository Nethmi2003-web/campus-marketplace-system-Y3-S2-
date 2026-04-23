const User = require('../models/User');

// ============================================================
// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Protected + Admin
// ============================================================
const getAllUsers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search by name, email, or studentId
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// ============================================================
// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Protected + Admin
// ============================================================
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// @desc    Update user (admin edit)
// @route   PUT /api/users/:id
// @access  Protected + Admin
// ============================================================
const updateUser = async (req, res) => {
  try {
    const { fullName, email, studentId, faculty, status, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields if provided
    if (fullName) user.fullName = fullName;
    if (email) user.email = email.toLowerCase();
    if (studentId) user.studentId = studentId.toUpperCase();
    if (faculty) user.faculty = faculty;
    if (status) user.status = status;
    if (role) user.role = role;

    await user.save();

    res.json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error updating user' });
  }
};

// ============================================================
// @desc    Update user status (approve/reject/block/unblock)
// @route   PATCH /api/users/:id/status
// @access  Protected + Admin
// ============================================================
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'blocked', 'inactive'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({ success: true, message: `User status changed to "${status}"`, user });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};

// ============================================================
// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Protected + Admin
// ============================================================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'User deleted permanently' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
};

// ============================================================
// @desc    Get dashboard stats
// @route   GET /api/users/stats
// @access  Protected + Admin
// ============================================================
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingVerification = await User.countDocuments({ status: 'pending' });
    const activeSellers = await User.countDocuments({ role: 'Seller', status: 'approved' });
    const blockedUsers = await User.countDocuments({ status: 'blocked' });
    const totalAdmins = await User.countDocuments({ role: 'Admin' });
    
    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        pendingVerification,
        activeSellers,
        blockedUsers,
        totalAdmins,
        recentRegistrations,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
};
