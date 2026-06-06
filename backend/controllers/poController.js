import PurchaseOrder from '../models/PO.js';
import Quotation from '../models/Quotation.js';
import RFQ from '../models/RFQ.js';
import { logActivity } from '../utils/logger.js';

// Helper to generate a unique PO number
const generatePONumber = async () => {
  const year = new Date().getFullYear();
  const count = await PurchaseOrder.countDocuments({});
  // Format PO-YYYY-XXXX (padded to 4 digits)
  const sequence = String(count + 1).padStart(4, '0');
  return `PO-${year}-${sequence}`;
};

// @desc    Generate a Purchase Order from an approved quotation
// @route   POST /api/purchase-orders
// @access  Private (Officer)
export const createPO = async (req, res) => {
  const { quotationId } = req.body;

  try {
    const quote = await Quotation.findById(quotationId).populate('rfqId');
    if (!quote) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (quote.status !== 'approved') {
      return res.status(400).json({ message: 'Quotation must be approved to generate a Purchase Order' });
    }

    // Check if a PO already exists for this quotation
    const poExists = await PurchaseOrder.findOne({ quotationId });
    if (poExists) {
      return res.status(400).json({ message: 'Purchase Order already exists for this quotation', po: poExists });
    }

    // Prepare items list and calculate math
    const items = quote.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 18; // Standard GST %
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    const poNumber = await generatePONumber();

    const po = await PurchaseOrder.create({
      poNumber,
      rfqId: quote.rfqId._id,
      quotationId: quote._id,
      vendorId: quote.vendorId,
      items,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      status: 'issued',
      createdBy: req.user._id,
    });

    // Update quote status to PO generated, or RFQ items if needed
    // quote.status can remain approved or update
    await logActivity(req.user, 'PO_GENERATED', `Purchase Order ${poNumber} generated successfully.`);

    res.status(201).json(po);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Purchase Orders
// @route   GET /api/purchase-orders
// @access  Private
export const getPOs = async (req, res) => {
  try {
    let pos;
    if (req.user.role === 'vendor') {
      pos = await PurchaseOrder.find({ vendorId: req.user._id })
        .populate('vendorId', 'name email')
        .populate('rfqId', 'title')
        .sort({ createdAt: -1 });
    } else {
      pos = await PurchaseOrder.find({})
        .populate('vendorId', 'name email')
        .populate('rfqId', 'title')
        .sort({ createdAt: -1 });
    }
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Purchase Order by ID
// @route   GET /api/purchase-orders/:id
// @access  Private
export const getPOById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('vendorId', 'name email')
      .populate('rfqId', 'title description')
      .populate('createdBy', 'name email');

    if (!po) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    if (req.user.role === 'vendor' && po.vendorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(po);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
