import mongoose from 'mongoose';

const vendorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true, // e.g. IT Solutions, Construction, Office Supplies, Logistics
  },
  gstNumber: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5,
  },
}, {
  timestamps: true,
});

const VendorProfile = mongoose.model('VendorProfile', vendorProfileSchema);
export default VendorProfile;
