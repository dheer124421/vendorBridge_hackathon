import ActivityLog from '../models/ActivityLog.js';
import RFQ from '../models/RFQ.js';
import Quotation from '../models/Quotation.js';
import PurchaseOrder from '../models/PO.js';
import Invoice from '../models/Invoice.js';
import VendorProfile from '../models/VendorProfile.js';
import User from '../models/User.js';

// @desc    Get dashboard analytics depending on user role
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardAnalytics = async (req, res) => {
  const { role, _id: userId } = req.user;

  try {
    let stats = {};

    if (role === 'admin' || role === 'officer') {
      // General metrics
      const activeRFQs = await RFQ.countDocuments({ status: 'open' });
      const totalPOs = await PurchaseOrder.countDocuments({});
      const pendingInvoices = await Invoice.countDocuments({ status: 'unpaid' });
      const totalVendors = await VendorProfile.countDocuments({});

      // Sum of spend (Completed and Sent POs)
      const poList = await PurchaseOrder.find({});
      const totalSpend = poList.reduce((sum, po) => sum + po.totalAmount, 0);

      // Category breakdown
      const vendorList = await VendorProfile.find({});
      const categoryBreakdown = {};
      vendorList.forEach(vendor => {
        categoryBreakdown[vendor.category] = (categoryBreakdown[vendor.category] || 0) + 1;
      });

      // Monthly spending trend (mock data calculated from real orders, grouped by month)
      const monthlySpend = [
        { month: 'Jan', spend: 0 },
        { month: 'Feb', spend: 0 },
        { month: 'Mar', spend: 0 },
        { month: 'Apr', spend: 0 },
        { month: 'May', spend: 0 },
        { month: 'Jun', spend: 0 },
      ];

      poList.forEach(po => {
        const monthIndex = new Date(po.createdAt).getMonth();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthLabel = months[monthIndex];
        
        const trendItem = monthlySpend.find(m => m.month === monthLabel);
        if (trendItem) {
          trendItem.spend += po.totalAmount;
        } else if (monthIndex < 12) {
          // If month is Jul-Dec, add dynamically
          monthlySpend.push({ month: monthLabel, spend: po.totalAmount });
        }
      });

      // Recent items
      const recentRFQs = await RFQ.find({}).limit(5).sort({ createdAt: -1 });
      const recentPOs = await PurchaseOrder.find({}).limit(5).populate('vendorId', 'name').sort({ createdAt: -1 });
      const recentInvoices = await Invoice.find({}).limit(5).populate('vendorId', 'name').sort({ createdAt: -1 });

      stats = {
        activeRFQs,
        totalPOs,
        pendingInvoices,
        totalVendors,
        totalSpend,
        categoryBreakdown,
        monthlySpend,
        recentRFQs,
        recentPOs,
        recentInvoices
      };
    } else if (role === 'vendor') {
      // Vendor metrics
      const assignedRFQs = await RFQ.countDocuments({ assignedVendors: userId });
      const submittedQuotes = await Quotation.countDocuments({ vendorId: userId });
      const winCount = await Quotation.countDocuments({ vendorId: userId, status: 'approved' });
      
      const pos = await PurchaseOrder.find({ vendorId: userId });
      const activePOs = pos.filter(po => po.status !== 'completed').length;
      const totalEarnings = pos.reduce((sum, po) => sum + po.totalAmount, 0);

      // Invoices summaries
      const invoices = await Invoice.find({ vendorId: userId });
      const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
      const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid').length;

      stats = {
        assignedRFQs,
        submittedQuotes,
        winRate: submittedQuotes > 0 ? Math.round((winCount / submittedQuotes) * 100) : 0,
        activePOs,
        totalEarnings,
        paidInvoices,
        unpaidInvoices,
        recentPOs: pos.slice(0, 5)
      };
    } else if (role === 'manager') {
      // Approver metrics
      const pendingApprovals = await RFQ.countDocuments({ status: 'open' }); // simplified view
      const activeApprovalsCount = await Quotation.countDocuments({ status: 'under_review' });

      stats = {
        pendingApprovalsCount: activeApprovalsCount,
        recentActivity: await ActivityLog.find({}).limit(5).sort({ createdAt: -1 })
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system logs
// @route   GET /api/analytics/logs
// @access  Private (Admin, Officer)
export const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({}).limit(100).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
