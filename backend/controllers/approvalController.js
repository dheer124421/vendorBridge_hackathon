import Approval from '../models/Approval.js';
import Quotation from '../models/Quotation.js';
import RFQ from '../models/RFQ.js';
import { logActivity } from '../utils/logger.js';

// @desc    Initiate approval workflow for a quotation
// @route   POST /api/approvals/initiate
// @access  Private (Officer)
export const initiateApproval = async (req, res) => {
  const { quotationId, rfqId, remarks } = req.body;

  try {
    const quote = await Quotation.findById(quotationId);
    if (!quote) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const rfq = await RFQ.findById(rfqId);
    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    // Check if an approval process already exists for this quotation
    let approval = await Approval.findOne({ quotationId });

    if (approval) {
      if (approval.status === 'pending') {
        return res.status(400).json({ message: 'Quotation approval is already pending review' });
      }
      // Re-open/create if it was rejected before
      approval.status = 'pending';
      approval.remarks = remarks;
      approval.timeline.push({
        status: 'pending',
        remarks: remarks || 'Resubmitted for approval',
        updatedBy: req.user._id,
      });
      await approval.save();
    } else {
      // Create new approval
      approval = await Approval.create({
        rfqId,
        quotationId,
        remarks,
        status: 'pending',
        timeline: [{
          status: 'pending',
          remarks: remarks || 'Approval workflow initiated',
          updatedBy: req.user._id,
        }]
      });
    }

    quote.status = 'under_review';
    await quote.save();

    await logActivity(req.user, 'APPROVAL_INITIATED', `Quotation approval initiated for RFQ "${rfq.title}".`);

    res.status(201).json(approval);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending approvals
// @route   GET /api/approvals/pending
// @access  Private (Manager, Admin)
export const getPendingApprovals = async (req, res) => {
  try {
    const approvals = await Approval.find({ status: 'pending' })
      .populate({
        path: 'quotationId',
        populate: { path: 'vendorId', select: 'name email' }
      })
      .populate('rfqId', 'title description deadline')
      .sort({ createdAt: -1 });

    res.json(approvals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all approvals (history)
// @route   GET /api/approvals
// @access  Private (Officer, Manager, Admin)
export const getApprovals = async (req, res) => {
  try {
    const approvals = await Approval.find({})
      .populate({
        path: 'quotationId',
        populate: { path: 'vendorId', select: 'name email' }
      })
      .populate('rfqId', 'title description')
      .sort({ createdAt: -1 });

    res.json(approvals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject a quotation approval request
// @route   PUT /api/approvals/:id
// @access  Private (Manager)
export const processApproval = async (req, res) => {
  const { status, remarks } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value. Must be approved or rejected.' });
  }

  try {
    const approval = await Approval.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    if (approval.status !== 'pending') {
      return res.status(400).json({ message: 'Approval request is already processed' });
    }

    const quote = await Quotation.findById(approval.quotationId);
    const rfq = await RFQ.findById(approval.rfqId);

    approval.status = status;
    approval.remarks = remarks;
    approval.approverId = req.user._id;
    approval.timeline.push({
      status,
      remarks,
      updatedBy: req.user._id,
    });
    await approval.save();

    if (status === 'approved') {
      quote.status = 'approved';
      rfq.status = 'closed'; // Close RFQ on quotation approval
      await rfq.save();
    } else {
      quote.status = 'rejected';
    }
    await quote.save();

    // Reject other quotations for the same RFQ automatically
    if (status === 'approved') {
      await Quotation.updateMany(
        { rfqId: approval.rfqId, _id: { $ne: approval.quotationId } },
        { $set: { status: 'rejected' } }
      );
    }

    await logActivity(
      req.user,
      `QUOTE_${status.toUpperCase()}`,
      `Quotation for RFQ "${rfq?.title}" has been ${status} by Manager ${req.user.name}.`
    );

    res.json(approval);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
