import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import VendorProfile from '../models/VendorProfile.js';
import RFQ from '../models/RFQ.js';
import Quotation from '../models/Quotation.js';
import Approval from '../models/Approval.js';
import PurchaseOrder from '../models/PO.js';
import Invoice from '../models/Invoice.js';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await VendorProfile.deleteMany({});
    await RFQ.deleteMany({});
    await Quotation.deleteMany({});
    await Approval.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await Invoice.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('Database cleared.');

    // Create Users
    const admin = await User.create({
      name: 'Global Admin',
      email: 'admin@vendorbridge.com',
      password: 'password123',
      role: 'admin',
    });

    const officer = await User.create({
      name: 'Priscilla Officer',
      email: 'officer@vendorbridge.com',
      password: 'password123',
      role: 'officer',
    });

    const manager = await User.create({
      name: 'Marcus Manager',
      email: 'manager@vendorbridge.com',
      password: 'password123',
      role: 'manager',
    });

    // Vendors
    const vendor1 = await User.create({
      name: 'Tech Solutions Inc',
      email: 'vendor1@vendorbridge.com',
      password: 'password123',
      role: 'vendor',
    });

    const vendor2 = await User.create({
      name: 'Elite Stationers Ltd',
      email: 'vendor2@vendorbridge.com',
      password: 'password123',
      role: 'vendor',
    });

    const vendor3 = await User.create({
      name: 'Apex Logistics Corp',
      email: 'vendor3@vendorbridge.com',
      password: 'password123',
      role: 'vendor',
    });

    console.log('Users created.');

    // Create Vendor Profiles
    const vp1 = await VendorProfile.create({
      userId: vendor1._id,
      companyName: 'Tech Solutions Inc',
      category: 'IT Solutions',
      gstNumber: '29ABCDE1234F1Z1',
      phone: '+1 555-0199',
      address: 'Suite 400, Tech Park, Bangalore',
      status: 'approved',
      rating: 4.8,
    });

    const vp2 = await VendorProfile.create({
      userId: vendor2._id,
      companyName: 'Elite Stationers Ltd',
      category: 'Office Supplies',
      gstNumber: '29FGHIJ5678K2Z2',
      phone: '+1 555-0200',
      address: 'Industrial Area Phase 1, New Delhi',
      status: 'pending',
      rating: 3.5,
    });

    const vp3 = await VendorProfile.create({
      userId: vendor3._id,
      companyName: 'Apex Logistics Corp',
      category: 'Logistics',
      gstNumber: '29KLMNO9012L3Z3',
      phone: '+1 555-0300',
      address: 'Cargo Bay 3, Port Area, Mumbai',
      status: 'approved',
      rating: 4.5,
    });

    console.log('Vendor profiles created.');

    // Create RFQs
    const rfq1 = await RFQ.create({
      title: 'Procurement of High-End Office Laptops',
      description: 'Requesting quotations for 20 developer-grade laptops (32GB RAM, 1TB SSD, Core i7 or equivalent) and 5 designer laptops with graphics cards.',
      items: [
        { name: 'Developer Laptops', quantity: 20, unit: 'pcs' },
        { name: 'Designer Laptops', quantity: 5, unit: 'pcs' },
      ],
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      assignedVendors: [vendor1._id, vendor3._id],
      status: 'open',
      createdBy: officer._id,
    });

    const rfq2 = await RFQ.create({
      title: 'Annual Office Stationery Supply 2026',
      description: 'Requirement for regular office desk stationery including paper bundles, note pads, folders, and markers.',
      items: [
        { name: 'A4 Paper Boxes (5 reams/box)', quantity: 50, unit: 'boxes' },
        { name: 'Executive Notepad Packs', quantity: 30, unit: 'packs' },
        { name: 'Whiteboard Marker Sets', quantity: 15, unit: 'sets' },
      ],
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      assignedVendors: [vendor2._id],
      status: 'open',
      createdBy: officer._id,
    });

    console.log('RFQs created.');

    // Create Mock Quotations for RFQ 1
    const quote1 = await Quotation.create({
      rfqId: rfq1._id,
      vendorId: vendor1._id,
      items: [
        { name: 'Developer Laptops', quantity: 20, unitPrice: 75000, total: 1500000 },
        { name: 'Designer Laptops', quantity: 5, unitPrice: 95000, total: 475000 },
      ],
      deliveryTimeline: 7, // days
      notes: 'Laptops will include pre-loaded basic OS and 3 years manufacturer warranty. Expedited delivery available.',
      status: 'submitted',
    });

    const quote2 = await Quotation.create({
      rfqId: rfq1._id,
      vendorId: vendor3._id,
      items: [
        { name: 'Developer Laptops', quantity: 20, unitPrice: 78000, total: 1560000 },
        { name: 'Designer Laptops', quantity: 5, unitPrice: 92000, total: 460000 },
      ],
      deliveryTimeline: 12, // days
      notes: 'Special discounts applied for bulk purchase. Warranty extension options available upon request.',
      status: 'submitted',
    });

    console.log('Quotations created.');

    // Log some initial actions
    await ActivityLog.create([
      { userId: admin._id, userName: admin.name, userRole: admin.role, action: 'SYSTEM_INIT', details: 'Database initialized and seeded.' },
      { userId: officer._id, userName: officer.name, userRole: officer.role, action: 'RFQ_CREATED', details: `Created RFQ for High-End Office Laptops.` },
      { userId: officer._id, userName: officer.name, userRole: officer.role, action: 'RFQ_CREATED', details: `Created RFQ for Annual Office Stationery Supply.` },
      { userId: vendor1._id, userName: vendor1.name, userRole: vendor1.role, action: 'QUOTE_SUBMITTED', details: `Submitted quotation for High-End Office Laptops.` },
      { userId: vendor3._id, userName: vendor3.name, userRole: vendor3.role, action: 'QUOTE_SUBMITTED', details: `Submitted quotation for High-End Office Laptops.` },
    ]);

    console.log('Activity Logs created.');
    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
