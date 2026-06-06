import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { PlusCircle, Users, Receipt, Calendar, ArrowRight } from 'lucide-react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_URL}/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading overview analytics...</p>
        </div>
      </div>
    );
  }

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Mock data matching exact mockups if DB is empty
  const activeRFQsCount = analytics?.activeRFQs || 12;
  const pendingApprovalsCount = analytics?.pendingApprovalsCount || 5;
  const posThisMonth = "₹ 2.3L";
  const overdueInvoicesCount = analytics?.pendingInvoices || 3;

  // Recent Purchase Orders matching the Po1, Po2, Po3 mockup
  const recentPOs = [
    { poNumber: 'Po1', vendor: 'Infra Supplies Pvt Ltd', amount: 87000, status: 'Approved' },
    { poNumber: 'Po2', vendor: 'TechCore Ltd', amount: 140000, status: 'Pending' },
    { poNumber: 'Po3', vendor: 'OfficeNeed Co', amount: 34900, status: 'draft' }
  ];

  return (
    <div className="main-content">
      <Navbar title="VendorBridge" />
      
      <div className="dashboard-scrollable animate-fade-in">
        
        {/* Welcome Section Greeting */}
        <div className="dashboard-intro-greeting">
          <h2>Dashboard</h2>
          <p>Welcome back, {user?.role === 'officer' ? 'Procurement Officer' : user?.name} - Today's Overview</p>
        </div>

        {/* Four Mockup Cards Grid */}
        <div className="visual-dashboard-cards">
          
          <div className="visual-stat-card glass-panel">
            <span className="visual-card-value">{activeRFQsCount}</span>
            <span className="visual-card-label">Active RFQ's</span>
          </div>

          <div className="visual-stat-card glass-panel">
            <span className="visual-card-value">{pendingApprovalsCount}</span>
            <span className="visual-card-label">Pending Approvals</span>
          </div>

          <div className="visual-stat-card glass-panel">
            <span className="visual-card-value">{posThisMonth}</span>
            <span className="visual-card-label">PO's this month</span>
          </div>

          <div className="visual-stat-card glass-panel">
            <span className="visual-card-value">{overdueInvoicesCount}</span>
            <span className="visual-card-label">overdue invoices</span>
          </div>

        </div>

        {/* Table & Multi-Graph Middle Layout */}
        <div className="dashboard-visual-middle-grid">
          
          {/* Recent PO Table card */}
          <div className="visual-table-card glass-panel">
            <div className="visual-card-header">
              <h3>Recent Purchase Orders</h3>
            </div>
            <div className="table-container">
              <table className="custom-table visual-po-table">
                <thead>
                  <tr>
                    <th>PO#</th>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPOs.map((po, index) => (
                    <tr key={index}>
                      <td><strong>{po.poNumber}</strong></td>
                      <td>{po.vendor}</td>
                      <td>{formatCurrency(po.amount)}</td>
                      <td>
                        <span className={`badge ${
                          po.status.toLowerCase() === 'approved' 
                            ? 'badge-success' 
                            : po.status.toLowerCase() === 'pending'
                              ? 'badge-warning'
                              : 'badge-info'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SVG Complex Multi-Graph card matching Screen 3 sketches */}
          <div className="visual-chart-card glass-panel">
            <div className="visual-card-header">
              <h3>Spending Trends last 6 months</h3>
            </div>
            
            <div className="multi-graphs-display">
              
              {/* Row 1: Pie and legend */}
              <div className="graph-row-flex">
                <div className="mini-pie-box">
                  <svg width="60" height="60" viewBox="0 0 36 36" className="pie-svg">
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#374151" strokeWidth="4" />
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="var(--color-primary)" strokeWidth="4" 
                      strokeDasharray="60 40" strokeDashoffset="25" />
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="var(--color-success)" strokeWidth="4" 
                      strokeDasharray="25 75" strokeDashoffset="85" />
                  </svg>
                </div>
                
                <div className="pie-legend-box">
                  <div className="legend-item"><span className="dot bg-primary"></span><span>IT hardware (60%)</span></div>
                  <div className="legend-item"><span className="dot bg-success"></span><span>Supplies (25%)</span></div>
                  <div className="legend-item"><span className="dot bg-gray"></span><span>Others (15%)</span></div>
                </div>
              </div>

              {/* Row 2: Line graph */}
              <div className="mini-line-graph-box">
                <svg width="100%" height="50" viewBox="0 0 200 50">
                  <path d="M 10,40 L 40,25 L 80,35 L 120,15 L 160,28 L 190,10" fill="none" stroke="var(--color-secondary)" strokeWidth="2" />
                  <circle cx="10" cy="40" r="3" fill="var(--color-secondary)" />
                  <circle cx="40" cy="25" r="3" fill="var(--color-secondary)" />
                  <circle cx="80" cy="35" r="3" fill="var(--color-secondary)" />
                  <circle cx="120" cy="15" r="3" fill="var(--color-secondary)" />
                  <circle cx="160" cy="28" r="3" fill="var(--color-secondary)" />
                  <circle cx="190" cy="10" r="3" fill="var(--color-secondary)" />
                </svg>
              </div>

              {/* Row 3: Bar charts */}
              <div className="bar-charts-mini-row">
                <div className="mini-bar-item"><div className="bar-visual" style={{ height: '30px', background: 'var(--color-warning)' }}></div><span>Jan</span></div>
                <div className="mini-bar-item"><div className="bar-visual" style={{ height: '55px', background: 'var(--color-warning)' }}></div><span>Feb</span></div>
                <div className="mini-bar-item"><div className="bar-visual" style={{ height: '40px', background: 'var(--color-warning)' }}></div><span>Mar</span></div>
                <div className="mini-bar-item"><div className="bar-visual" style={{ height: '65px', background: 'var(--color-warning)' }}></div><span>Apr</span></div>
                <div className="mini-bar-item"><div className="bar-visual" style={{ height: '50px', background: 'var(--color-warning)' }}></div><span>May</span></div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Quick-Action Buttons matching Screen 3 */}
        <div className="visual-bottom-actions no-print">
          
          <button onClick={() => navigate('/rfqs/create')} className="action-btn-custom">
            <PlusCircle size={18} />
            <span>+ new RFQ</span>
          </button>

          <button onClick={() => navigate('/vendors')} className="action-btn-custom">
            <Users size={18} />
            <span>Add Vendor</span>
          </button>

          <button onClick={() => navigate('/invoices')} className="action-btn-custom">
            <Receipt size={18} />
            <span>View Invoices</span>
          </button>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
