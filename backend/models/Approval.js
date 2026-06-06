import mongoose from 'mongoose';

const approvalTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  remarks: { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date, default: Date.now },
});

const approvalSchema = new mongoose.Schema({
  rfqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: true,
  },
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
    required: true,
  },
  approverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  remarks: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  timeline: [approvalTimelineSchema],
}, {
  timestamps: true,
});

const Approval = mongoose.model('Approval', approvalSchema);
export default Approval;
