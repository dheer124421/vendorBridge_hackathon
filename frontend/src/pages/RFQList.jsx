import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { ClipboardList, PlusCircle, Calendar, ArrowRight, Eye } from 'lucide-react';
import '../styles/RFQList.css';

const RFQList = () => {
  const { user, token, authFetch } = useAuth();
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/rfq');
      const data = await res.json();
      if (res.ok) {
        setRfqs(data);
      } else {
        setError(data.message || 'Failed to fetch RFQs');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRFQs();
    }
  }, [token]);

  const filteredRfqs = filterStatus 
    ? rfqs.filter(r => r.status === filterStatus) 
    : rfqs;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return <span className="badge badge-success">Open</span>;
      case 'closed': return <span className="badge badge-danger">Closed</span>;
      case 'draft': return <span className="badge badge-warning">Draft</span>;
      default: return <span className="badge badge-info">{status}</span>;
    }
  };

  return (
    <div className="main-content">
      <Navbar title={user?.role === 'vendor' ? 'Assigned Request for Quotations' : 'Request for Quotations Database'} />

      <div className="rfq-page-container animate-fade-in">
        
        {error && <div className="auth-alert alert-error">{error}</div>}

        {/* Dashboard Actions and Filters */}
        <div className="list-top-bar glass-panel no-print">
          <div className="filter-controls">
            <button 
              className={`filter-tab-btn ${filterStatus === '' ? 'active' : ''}`}
              onClick={() => setFilterStatus('')}
            >
              All RFQs
            </button>
            <button 
              className={`filter-tab-btn ${filterStatus === 'open' ? 'active' : ''}`}
              onClick={() => setFilterStatus('open')}
            >
              Active / Open
            </button>
            <button 
              className={`filter-tab-btn ${filterStatus === 'closed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('closed')}
            >
              Completed / Closed
            </button>
          </div>

          {user?.role === 'officer' && (
            <button onClick={() => navigate('/rfqs/create')} className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Create New RFQ</span>
            </button>
          )}
        </div>

        {/* Directory Cards list */}
        {loading ? (
          <div className="no-data">Fetching RFQs...</div>
        ) : filteredRfqs.length === 0 ? (
          <div className="no-data">No RFQs found matching this status.</div>
        ) : (
          <div className="rfq-grid">
            {filteredRfqs.map(rfq => (
              <div key={rfq._id} className="rfq-card glass-panel">
                <div className="rfq-card-header">
                  {getStatusBadge(rfq.status)}
                  <span className="deadline-badge">
                    <Calendar size={12} />
                    <span>Due: {new Date(rfq.deadline).toLocaleDateString()}</span>
                  </span>
                </div>

                <div className="rfq-card-body">
                  <h3 className="rfq-card-title">{rfq.title}</h3>
                  <p className="rfq-card-desc">{rfq.description || 'No description provided.'}</p>
                  
                  <div className="rfq-items-summary">
                    <h4>Line Items:</h4>
                    <ul>
                      {rfq.items.slice(0, 3).map((item, i) => (
                        <li key={i}>{item.name} ({item.quantity} {item.unit})</li>
                      ))}
                      {rfq.items.length > 3 && <li className="more-items-indicator">+{rfq.items.length - 3} more items</li>}
                    </ul>
                  </div>
                </div>

                <div className="rfq-card-footer">
                  <span className="created-by-text">Created by: {rfq.createdBy?.name || 'N/A'}</span>
                  
                  <button 
                    onClick={() => navigate(`/rfqs/${rfq._id}`)} 
                    className="btn btn-secondary text-xs btn-icon-only"
                  >
                    <span>{user?.role === 'vendor' ? 'Respond' : 'View Details'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default RFQList;
