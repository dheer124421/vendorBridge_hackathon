import VendorProfile from '../models/VendorProfile.js';
import User from '../models/User.js';
import { logActivity } from '../utils/logger.js';

// @desc    Get all vendor profiles
// @route   GET /api/vendors
// @access  Private (Admin, Officer)
export const getVendors = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    let profiles = await VendorProfile.find(query).populate('userId', 'name email role');

    if (search) {
      profiles = profiles.filter(
        (p) =>
          p.companyName.toLowerCase().includes(search.toLowerCase()) ||
          p.userId.name.toLowerCase().includes(search.toLowerCase()) ||
          p.userId.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vendor verification status
// @route   PUT /api/vendors/:id/status
// @access  Private (Admin)
export const updateVendorStatus = async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const profile = await VendorProfile.findById(req.params.id).populate('userId');

    if (!profile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    profile.status = status;
    await profile.save();

    await logActivity(
      req.user,
      'VENDOR_STATUS_UPDATE',
      `Vendor ${profile.companyName} registration ${status} by admin.`
    );

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor statistics
// @route   GET /api/vendors/stats
// @access  Private (Admin, Officer)
export const getVendorStats = async (req, res) => {
  try {
    const total = await VendorProfile.countDocuments({});
    const approved = await VendorProfile.countDocuments({ status: 'approved' });
    const pending = await VendorProfile.countDocuments({ status: 'pending' });
    const rejected = await VendorProfile.countDocuments({ status: 'rejected' });

    res.json({ total, approved, pending, rejected });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
