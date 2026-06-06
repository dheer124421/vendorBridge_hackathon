import Quotation from '../models/Quotation.js';
import RFQ from '../models/RFQ.js';
import { logActivity } from '../utils/logger.js';

// @desc    Submit a quotation for an RFQ
// @route   POST /api/quotations
// @access  Private (Vendor)
export const submitQuotation = async (req, res) => {
  const { rfqId, items, deliveryTimeline, notes } = req.body;

  try {
    const rfq = await RFQ.findById(rfqId);
    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    // Check if vendor is assigned to RFQ
    const isAssigned = rfq.assignedVendors.some(
      (vId) => vId.toString() === req.user._id.toString()
    );
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this RFQ' });
    }

    // Check if quotation already exists for this vendor and RFQ
    let quotation = await Quotation.findOne({ rfqId, vendorId: req.user._id });

    if (quotation) {
      // Update existing quotation
      quotation.items = items;
      quotation.deliveryTimeline = deliveryTimeline;
      quotation.notes = notes;
      quotation.status = 'submitted';
      await quotation.save();
      await logActivity(req.user, 'QUOTE_UPDATED', `Quotation updated for RFQ "${rfq.title}".`);
      return res.json(quotation);
    }

    // Create new quotation
    quotation = await Quotation.create({
      rfqId,
      vendorId: req.user._id,
      items,
      deliveryTimeline,
      notes,
      status: 'submitted',
    });

    await logActivity(req.user, 'QUOTE_SUBMITTED', `New quotation submitted for RFQ "${rfq.title}".`);
    res.status(201).json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all quotations for an RFQ
// @route   GET /api/quotations/rfq/:rfqId
// @access  Private (Officer, Manager, Admin)
export const getQuotationsByRFQ = async (req, res) => {
  try {
    const quotations = await Quotation.find({ rfqId: req.params.rfqId })
      .populate('vendorId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor's own quotations
// @route   GET /api/quotations/vendor/my
// @access  Private (Vendor)
export const getVendorQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ vendorId: req.user._id })
      .populate('rfqId', 'title deadline status')
      .sort({ createdAt: -1 });

    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quotation details by ID
// @route   GET /api/quotations/:id
// @access  Private
export const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('vendorId', 'name email')
      .populate({
        path: 'rfqId',
        populate: { path: 'createdBy', select: 'name email' }
      });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Vendor can only see their own quotation
    if (req.user.role === 'vendor' && quotation.vendorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
