import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true, // e.g. "RFQ_CREATED", "QUOTE_SUBMITTED", "PO_APPROVED", "INVOICE_SENT"
  },
  details: {
    type: String,
  },
}, {
  timestamps: true,
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
