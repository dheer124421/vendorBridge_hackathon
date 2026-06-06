import Invoice from '../models/Invoice.js';
import PurchaseOrder from '../models/PO.js';
import { logActivity } from '../utils/logger.js';

// Helper to generate a unique Invoice number
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments({});
  const sequence = String(count + 1).padStart(4, '0');
  return `INV-${year}-${sequence}`;
};

// @desc    Generate an invoice from a Purchase Order
// @route   POST /api/invoices
// @access  Private (Vendor, Officer)
export const createInvoice = async (req, res) => {
  const { purchaseOrderId, dueDate } = req.body;

  try {
    const po = await PurchaseOrder.findById(purchaseOrderId);
    if (!po) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    // Check if invoice already exists for this PO
    const invoiceExists = await Invoice.findOne({ purchaseOrderId });
    if (invoiceExists) {
      return res.status(400).json({ message: 'Invoice already exists for this Purchase Order', invoice: invoiceExists });
    }

    const invoiceNumber = await generateInvoiceNumber();

    const items = po.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total
    }));

    const invoice = await Invoice.create({
      invoiceNumber,
      purchaseOrderId: po._id,
      vendorId: po.vendorId,
      items,
      subtotal: po.subtotal,
      taxAmount: po.taxAmount,
      totalAmount: po.totalAmount,
      status: 'unpaid',
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
    });

    // Mark PO as complete or invoice pending
    po.status = 'invoice_pending';
    await po.save();

    await logActivity(req.user, 'INVOICE_GENERATED', `Invoice ${invoiceNumber} created from ${po.poNumber}.`);

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Invoices
// @route   GET /api/invoices
// @access  Private
export const getInvoices = async (req, res) => {
  try {
    let invoices;
    if (req.user.role === 'vendor') {
      invoices = await Invoice.find({ vendorId: req.user._id })
        .populate('vendorId', 'name email')
        .populate('purchaseOrderId', 'poNumber')
        .sort({ createdAt: -1 });
    } else {
      invoices = await Invoice.find({})
        .populate('vendorId', 'name email')
        .populate('purchaseOrderId', 'poNumber')
        .sort({ createdAt: -1 });
    }
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('vendorId', 'name email')
      .populate({
        path: 'purchaseOrderId',
        populate: { path: 'rfqId', select: 'title' }
      });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (req.user.role === 'vendor' && invoice.vendorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update invoice status (Pay invoice)
// @route   PUT /api/invoices/:id/pay
// @access  Private (Officer, Admin)
export const payInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = 'paid';
    await invoice.save();

    // Mark corresponding PO as completed
    const po = await PurchaseOrder.findById(invoice.purchaseOrderId);
    if (po) {
      po.status = 'completed';
      await po.save();
    }

    await logActivity(req.user, 'INVOICE_PAID', `Invoice ${invoice.invoiceNumber} status updated to paid.`);

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Simulate sending invoice via email
// @route   POST /api/invoices/:id/email
// @access  Private (Officer, Vendor)
export const sendInvoiceEmail = async (req, res) => {
  const { to, subject, body } = req.body;

  try {
    const invoice = await Invoice.findById(req.params.id).populate('vendorId', 'name email');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Mock successful email
    await logActivity(
      req.user,
      'INVOICE_EMAILED',
      `Invoice ${invoice.invoiceNumber} emailed to ${to || invoice.vendorId.email}. Subject: ${subject || 'Invoice Details'}`
    );

    res.json({
      success: true,
      message: `Email successfully sent to ${to || invoice.vendorId.email}! (Simulated delivery)`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
