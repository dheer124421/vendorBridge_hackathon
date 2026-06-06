import mongoose from 'mongoose';

const quoteItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
});

const quotationSchema = new mongoose.Schema({
  rfqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [quoteItemSchema],
  deliveryTimeline: {
    type: Number, // in days
    required: true,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['submitted', 'approved', 'rejected', 'under_review'],
    default: 'submitted',
  },
}, {
  timestamps: true,
});

const Quotation = mongoose.model('Quotation', quotationSchema);
export default Quotation;
