import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { Search, Star, Phone, MapPin, Tag, Plus, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import '../styles/VendorManagement.css';

const VendorManagement = () => {
  const { user, token, authFetch } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Tabs filter matching Screen 4
  const [activeTab, setActiveTab] = useState('All');
  
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  // Registration Form Toggle
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorRep, setNewVendorRep] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorGst, setNewVendorGst] = useState('');
  const [newVendorCategory, setNewVendorCategory] = useState('IT Solutions');
  const [newVendorAddress, setNewVendorAddress] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      let url = `/vendors?`;
      if (search) url += `search=${search}&`;

      const res = await authFetch(url);
      const data = await res.json();
      if (res.ok) {
        setVendors(data);
      } else {
        setError(data.message || 'Failed to fetch vendor records');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVendors();
    }
  }, [token, search]);

  const handleStatusUpdate = async (profileId, newStatus) => {
    try {
      const res = await authFetch(`/vendors/${profileId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(`Vendor successfully ${newStatus}!`);
        fetchVendors();
        if (selectedVendor && selectedVendor._id === profileId) {
          setSelectedVendor({ ...selectedVendor, status: newStatus });
        }
      } else {
        setError(data.message || 'Failed to update status');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Add Vendor handler
  const handleAddVendorSubmit = async (e) => {
    e.preventDefault();
    if (!newVendorEmail || !newVendorName || !newVendorGst) {
      setError('Name, Email and GST details are required');
      return;
    }

    setError('');
    setMessage('');
    setActionLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newVendorRep || newVendorName,
          email: newVendorEmail,
          password: 'password123', // default password for seeded accounts
          role: 'vendor',
          companyName: newVendorName,
          category: newVendorCategory,
          gstNumber: newVendorGst,
          phone: newVendorPhone,
          address: newVendorAddress
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Vendor ${newVendorName} registered successfully! Default Password: password123`);
        setShowAddModal(false);
        // Clear fields
        setNewVendorName('');
        setNewVendorRep('');
        setNewVendorEmail('');
        setNewVendorPhone('');
        setNewVendorGst('');
        setNewVendorAddress('');
        fetchVendors();
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter vendors by activeTab
  const getFilteredVendors = () => {
    switch(activeTab) {
      case 'active':
        return vendors.filter(v => v.status === 'approved');
      case 'Pending':
        return vendors.filter(v => v.status === 'pending');
      case 'Blocked':
        return vendors.filter(v => v.status === 'rejected');
      default:
        return vendors;
    }
  };

  const filteredList = getFilteredVendors();

  // Tab counts
  const allCount = vendors.length;
  const activeCount = vendors.filter(v => v.status === 'approved').length;
  const pendingCount = vendors.filter(v => v.status === 'pending').length;
  const blockedCount = vendors.filter(v => v.status === 'rejected').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="badge badge-success">Active</span>;
      case 'rejected': return <span className="badge badge-danger">Blocked</span>;
      default: return <span className="badge badge-warning">Pending</span>;
    }
  };

  return (
    <div className="main-content">
      <Navbar title="VendorBridge" />

      <div className="vendor-page-layout animate-fade-in">
        
        {/* Header Title block */}
        <div className="vendor-header-block">
          <div className="title-left">
            <h2>Vendors</h2>
            <p>Manage supplier profiles and registrations</p>
          </div>
          
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary no-print">
            <Plus size={16} />
            <span>+ Add Vendor</span>
          </button>
        </div>

        {message && <div className="auth-alert alert-success">{message}</div>}
        {error && <div className="auth-alert alert-error">{error}</div>}

        {/* Search Input matching mockup Screen 4 */}
        <div className="search-bar-box glass-panel no-print">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search bar ..... search by name, gst number, category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Tab Filters matching mockup All, active, Pending, Blocked */}
        <div className="vendor-tabs-row no-print">
          <button className={`tab-btn-pill ${activeTab === 'All' ? 'active' : ''}`} onClick={() => setActiveTab('All')}>
            All ({allCount})
          </button>
          <button className={`tab-btn-pill ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
            active ({activeCount})
          </button>
          <button className={`tab-btn-pill ${activeTab === 'Pending' ? 'active' : ''}`} onClick={() => setActiveTab('Pending')}>
            Pending ({pendingCount})
          </button>
          <button className={`tab-btn-pill ${activeTab === 'Blocked' ? 'active' : ''}`} onClick={() => setActiveTab('Blocked')}>
            Blocked ({blockedCount})
          </button>
        </div>

        {/* Directory Grid */}
        <div className="vendor-catalog-grid">
          
          <div className="vendors-list-container glass-panel">
            {loading ? (
              <div className="no-data">Loading vendors list...</div>
            ) : filteredList.length === 0 ? (
              <div className="no-data">No vendor records found for this tab selection.</div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Vendor Name</th>
                      <th>Category</th>
                      <th>GST #</th>
                      <th>contact no.</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map(vendor => (
                      <tr 
                        key={vendor._id} 
                        onClick={() => setSelectedVendor(vendor)}
                        className={`cursor-pointer ${selectedVendor?._id === vendor._id ? 'row-active' : ''}`}
                      >
                        <td>
                          <div>
                            <strong className="text-white">{vendor.companyName}</strong>
                            <p className="sub-text">{vendor.userId?.name || 'Representative'}</p>
                          </div>
                        </td>
                        <td><span className="category-tag"><Tag size={12} /> {vendor.category}</span></td>
                        <td><code>{vendor.gstNumber}</code></td>
                        <td>{vendor.phone}</td>
                        <td>{getStatusBadge(vendor.status)}</td>
                        <td>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedVendor(vendor); }} 
                            className="btn btn-secondary text-xs"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Details column */}
          <div className="vendor-details-container glass-panel">
            {selectedVendor ? (
              <div className="vendor-profile-detail">
                <div className="detail-header-card">
                  <div className="avatar-large">
                    {selectedVendor.companyName.charAt(0).toUpperCase()}
                  </div>
                  <h2>{selectedVendor.companyName}</h2>
                  <p className="detail-category">{selectedVendor.category}</p>
                  <div className="status-row-large">
                    {getStatusBadge(selectedVendor.status)}
                  </div>
                </div>

                <div className="detail-body-list">
                  <div className="detail-item">
                    <span className="detail-label">Representative Name</span>
                    <span className="detail-value">{selectedVendor.userId?.name || 'N/A'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-value">{selectedVendor.userId?.email || 'N/A'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">GSTIN Details</span>
                    <span className="detail-value"><code>{selectedVendor.gstNumber}</code></span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Contact Phone</span>
                    <span className="detail-value-row"><Phone size={14} /> {selectedVendor.phone}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Corporate Address</span>
                    <span className="detail-value-row"><MapPin size={14} /> {selectedVendor.address}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Performance Star Rating</span>
                    <span className="detail-value-row rating">
                      <Star size={16} className="star-icon fill" stroke="var(--color-gold)" />
                      <strong>{selectedVendor.rating.toFixed(1)} / 5.0</strong>
                    </span>
                  </div>
                </div>

                {/* Verification Actions */}
                {user?.role === 'admin' && selectedVendor.status === 'pending' && (
                  <div className="admin-actions-box no-print">
                    <button 
                      onClick={() => handleStatusUpdate(selectedVendor._id, 'approved')} 
                      className="btn btn-success flex-1"
                    >
                      <CheckCircle size={18} />
                      <span>Approve</span>
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedVendor._id, 'rejected')} 
                      className="btn btn-danger flex-1"
                    >
                      <XCircle size={18} />
                      <span>Block</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="select-prompt-box">
                <ShieldAlert size={48} className="prompt-icon" />
                <h3>No Supplier Selected</h3>
                <p>Select a supplier from the list to review their registration details and verification parameters.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Add Vendor Modal Form matching mockup "+ Add Vendor" */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register Vendor Partner Account">
        <form onSubmit={handleAddVendorSubmit} className="add-vendor-modal-form">
          <div className="form-group">
            <label className="form-label">Company Legal Name *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Infra Supplies Pvt Ltd" 
              value={newVendorName}
              onChange={(e) => setNewVendorName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Representative Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Rahul Sharma" 
              value={newVendorRep}
              onChange={(e) => setNewVendorRep(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Representative Email Address *</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="e.g. contact@infra.com" 
              value={newVendorEmail}
              onChange={(e) => setNewVendorEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Phone Number</label>
            <input 
              type="tel" 
              className="form-input" 
              placeholder="e.g. +91 99999 88888" 
              value={newVendorPhone}
              onChange={(e) => setNewVendorPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">GSTIN Details *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. 29AAAAA1111A1Z1" 
              value={newVendorGst}
              onChange={(e) => setNewVendorGst(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              className="form-select" 
              value={newVendorCategory}
              onChange={(e) => setNewVendorCategory(e.target.value)}
            >
              <option value="IT Solutions">IT Solutions</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Construction">Construction</option>
              <option value="Logistics">Logistics</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Corporate Address</label>
            <textarea 
              className="form-textarea" 
              rows={2} 
              placeholder="Enter corporate address" 
              value={newVendorAddress}
              onChange={(e) => setNewVendorAddress(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={actionLoading}>
            <span>{actionLoading ? 'Creating Profile...' : 'Submit Profile for Verification'}</span>
          </button>
        </form>
      </Modal>

    </div>
  );
};

export default VendorManagement;
