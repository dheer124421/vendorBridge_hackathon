import RFQ from '../models/RFQ.js';
import User from '../models/User.js';
import VendorProfile from '../models/VendorProfile.js';
import { logActivity } from '../utils/logger.js';

// @desc    Create new RFQ
// @route   POST /api/rfq
// @access  Private (Officer)
export const createRFQ = async (req, res) => {
  const { title, description, items, deadline, assignedVendors } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    const rfq = await RFQ.create({
      title,
      description,
      items,
      deadline,
      assignedVendors,
      createdBy: req.user._id,
      status: 'open',
    });

    await logActivity(req.user, 'RFQ_CREATED', `RFQ "${title}" created and assigned to ${assignedVendors.length} vendors.`);

    res.status(201).json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all RFQs
// @route   GET /api/rfq
// @access  Private
export const getRFQs = async (req, res) => {
  try {
    let rfqs;
    if (req.user.role === 'vendor') {
      // Vendors only see RFQs they are assigned to
      rfqs = await RFQ.find({ assignedVendors: req.user._id })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Officers, Admins, and Managers see all RFQs
      rfqs = await RFQ.find({})
        .populate('createdBy', 'name email')
        .populate('assignedVendors', 'name email')
        .sort({ createdAt: -1 });
    }
    res.json(rfqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get RFQ details
// @route   GET /api/rfq/:id
// @access  Private
export const getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedVendors', 'name email');

    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    // Check vendor assignment permission
    if (req.user.role === 'vendor' && !rfq.assignedVendors.some(vendor => vendor._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied: You are not assigned to this RFQ' });
    }

    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
