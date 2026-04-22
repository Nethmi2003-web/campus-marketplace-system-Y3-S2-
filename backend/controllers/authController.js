const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// ============================================================
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// ============================================================
const registerUser = async (req, res) => {
  try {
    const { fullName, studentId, faculty, phoneNo, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    // Check for duplicate student ID
    const existingStudentId = await User.findOne({ studentId: studentId.toUpperCase() });
    if (existingStudentId) {
      return res.status(400).json({ success: false, message: 'This Student ID is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    let role = 'Student';
    let status = 'pending';

    // Auto-assign Admin and auto-approve if ID starts with AD
    if (studentId.toUpperCase().startsWith('AD')) {
      role = 'Admin';
      status = 'approved';
    }

    // Create User, auto-verified since we are skipping OTP
    const user = await User.create({
      fullName,
      studentId: studentId.toUpperCase(),
      faculty,
      phoneNo,
      email: email.toLowerCase(),
      password: hashedPassword,
      idPhotoUrl: req.body.idPhotoUrl || '',
      role,
      status,
      isEmailVerified: true,  // Overriding verification
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
      userId: user._id,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ============================================================
// @desc    Send OTP to user email (resend)
// @route   POST /api/auth/send-otp
// @access  Public
// ============================================================
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with this email' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    user.otpSecret = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      user.email,
      'Campus Marketplace — New Verification OTP',
      `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f8fafc; border-radius: 12px;">
        <h2 style="color: #1e293b;">🔄 New Verification Code</h2>
        <p style="color: #64748b;">Here is your new OTP code:</p>
        <div style="background: #1e293b; color: #fff; font-size: 28px; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0; font-weight: bold;">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 13px;">Expires in 10 minutes.</p>
      </div>
      `
    );

    res.json({ success: true, message: 'New OTP sent to email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error sending OTP' });
  }
};

// ============================================================
// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
// ============================================================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    // Check OTP expiry
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Request a new one.' });
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(otp, user.otpSecret);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // Mark email as verified and clear OTP fields
    user.isEmailVerified = true;
    user.otpSecret = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

// ============================================================
// @desc    Login user & return JWT
// @route   POST /api/auth/login
// @access  Public
// ============================================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user (include password field for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if blocked
    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact admin.' });
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ============================================================
// @desc    Forgot password — send reset link/OTP
// @route   POST /api/auth/forgot-password
// @access  Public
// ============================================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal whether user exists
      return res.json({ success: true, message: 'If that email is registered, a reset code has been sent.' });
    }

    // Generate reset OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    user.otpSecret = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();

    const emailStatus = await sendEmail(
      user.email,
      'Campus Marketplace — Password Reset Code',
      `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f8fafc; border-radius: 12px;">
        <h2 style="color: #1e293b;">🔐 Password Reset</h2>
        <p style="color: #64748b;">Use this code to reset your password:</p>
        <div style="background: #1e293b; color: #fff; font-size: 28px; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0; font-weight: bold;">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 13px;">Expires in 15 minutes. Ignore this email if you didn't request it.</p>
      </div>
      `
    );

    res.json({ 
      success: true, 
      message: 'If that email is registered, a reset code has been sent.',
      previewUrl: emailStatus && emailStatus.emailUrl ? emailStatus.emailUrl : null
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
// ============================================================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify OTP
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'Reset code expired. Request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, user.otpSecret);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid reset code' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otpSecret = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
};

// ============================================================
// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Protected
// ============================================================
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = {
  registerUser,
  sendOTP,
  verifyOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
};
