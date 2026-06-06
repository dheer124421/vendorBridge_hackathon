import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import VendorProfile from '../models/VendorProfile.js';
import { logActivity } from '../utils/logger.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // If user is a vendor, check vendor status
      let vendorStatus = 'approved';
      if (user.role === 'vendor') {
        const profile = await VendorProfile.findOne({ userId: user._id });
        if (profile) {
          vendorStatus = profile.status;
        }
      }

      await logActivity(user, 'USER_LOGIN', `User ${user.email} successfully logged in.`);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role, companyName, category, gstNumber, phone, address } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      let vendorStatus = 'approved';
      
      // If user is a vendor, create a vendor profile
      if (role === 'vendor') {
        const profile = await VendorProfile.create({
          userId: user._id,
          companyName: companyName || name,
          category: category || 'General',
          gstNumber: gstNumber || 'N/A',
          phone: phone || 'N/A',
          address: address || 'N/A',
          status: 'pending', // vendors start as pending and must be approved by admin
        });
        vendorStatus = profile.status;
      }

      await logActivity(user, 'USER_SIGNUP', `User ${user.email} registered as ${role}.`);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password Mock
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Mock send password reset
    res.json({
      message: 'Password reset link has been mock-sent to your email. (In development: reset bypass password is: "password123")',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
