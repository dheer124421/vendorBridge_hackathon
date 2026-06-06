import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { History, Search, CheckCircle2, Clock, ShieldCheck, Tag, Terminal, Receipt, HelpCircle } from 'lucide-react';
import '../styles/SystemLogs.css';

const SystemLogs = () => {
  const { token, authFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs filter matching Screen 10 mockup tabs
  const [activeTab, setActiveTab] = useState('All');
  
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/analytics/logs');
      const data = await res.json();
      if (res.ok) {
        setLogs(data);
      } else {
        setError(data.message || 'Failed to fetch logs');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [token]);

  // Mock list mirroring Screen 10 exactly if real DB lacks entries
  const mockLogs = [
    { id: 1, action: 'QUOTE_APPROVED', category: 'Approvals', details: 'Quotation selected - Infra Supplies pvt ltd selected for office furniture Q2', time: '23 May 2026, 9:15 PM' },
    { id: 2, action: 'APPROVAL_PENDING', category: 'Approvals', details: 'Approval pending - PO-2024 awaiting L2 approval by priya shah', time: '22 May 2026, 11:15 AM' },
    { id: 3, action: 'RFQ_PUBLISHED', category: 'RFQ', details: 'RFQ published - office furniture Q2 sent to 3 vendors', time: '19 May 2026' },
    { id: 4, action: 'VENDOR_ADDED', category: 'Vendors', details: 'Vendor added - FastLog transport registered and pending verifications', time: '18 May 2026, 3:20 PM' }
  ];

  // Helper to determine active list
  const getActiveLogs = () => {
    const list = logs.length > 0 ? logs.map(l => ({
      id: l._id,
      action: l.action,
      category: l.action.startsWith('RFQ') ? 'RFQ' 
              : l.action.startsWith('QUOTE') || l.action.startsWith('APPROVAL') ? 'Approvals'
              : l.action.startsWith('INVOICE') || l.action.startsWith('PO') ? 'Invoices'
              : l.action.startsWith('VENDOR') ? 'Vendors' : 'Other',
      details: l.details,
      time: new Date(l.createdAt).toLocaleString()
    })) : mockLogs;

    // Filter by tab
    let filtered = list;
    if (activeTab !== 'All') {
      filtered = list.filter(l => l.category === activeTab);
    }

    // Filter by search
    if (search) {
      filtered = filtered.filter(l => 
        l.details.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  };

  const finalLogs = getActiveLogs();

  const getLogIcon = (action) => {
    if (action.includes('APPROVE') || action.includes('SUCCESS') || action.includes('OK')) {
      return <CheckCircle2 size={16} className="text-success-green" />;
    }
    if (action.includes('PENDING') || action.includes('INIT') || action.includes('UPDATE')) {
      return <Clock size={16} className="text-warning-blue" />;
    }
    if (action.includes('PUBLISH') || action.includes('RFQ') || action.includes('QUOTE')) {
      return <Terminal size={16} className="text-primary-indigo" />;
    }
    if (action.includes('VENDOR') || action.includes('ADD')) {
      return <ShieldCheck size={16} className="text-pink-sec" />;
    }
    return <HelpCircle size={16} className="text-muted" />;
  };

  return (
    <div className="main-content">
      <Navbar title="VendorBridge" />

      <div className="logs-page-layout animate-fade-in">
        
        {/* Naming headers matching Screen 10 */}
        <div className="logs-header-block">
          <h2>Activity & Logs</h2>
          <p>Procurement audit trail</p>
        </div>

        {error && <div className="auth-alert alert-error">{error}</div>}

        {/* Filter Tabs matching Screen 10: All, RFQ, Approvals, Invoices, Vendors */}
        <div className="logs-tabs-row no-print">
          <button className={`tab-btn-pill ${activeTab === 'All' ? 'active' : ''}`} onClick={() => setActiveTab('All')}>All</button>
          <button className={`tab-btn-pill ${activeTab === 'RFQ' ? 'active' : ''}`} onClick={() => setActiveTab('RFQ')}>RFQ</button>
          <button className={`tab-btn-pill ${activeTab === 'Approvals' ? 'active' : ''}`} onClick={() => setActiveTab('Approvals')}>Approvals</button>
          <button className={`tab-btn-pill ${activeTab === 'Invoices' ? 'active' : ''}`} onClick={() => setActiveTab('Invoices')}>Invoices</button>
          <button className={`tab-btn-pill ${activeTab === 'Vendors' ? 'active' : ''}`} onClick={() => setActiveTab('Vendors')}>Vendors</button>
        </div>

        {/* Search bar */}
        <div className="search-bar-box glass-panel no-print">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search audit trail logs..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Timeline list card matching Screen 10 visual feed */}
        <div className="sketched-timeline-card glass-panel">
          <div className="card-header-inner">
            <h3>Audit timeline</h3>
            <span className="badge badge-info">{finalLogs.length} Events</span>
          </div>

          <div className="timeline-items-list-sketched">
            {finalLogs.length === 0 ? (
              <div className="no-data">No audit trail records found.</div>
            ) : (
              finalLogs.map(log => (
                <div key={log.id} className="timeline-row-sketched">
                  <div className="row-icon-capsule">
                    {getLogIcon(log.action)}
                  </div>
                  <div className="row-content-sketched">
                    <p className="timeline-details-desc">{log.details}</p>
                    <span className="timeline-timestamp">{log.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SystemLogs;
