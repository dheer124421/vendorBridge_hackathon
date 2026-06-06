import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Tag } from 'lucide-react';
import '../styles/VendorQuotations.css';

const VendorQuotations = () => {
  const { token, authFetch } = useAuth();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuotations = async () => {
      setLoading(true);
      try {
        const res = await authFetch('/quotations/vendor/my');
        const data = await res.json();
        if (res.ok) {
          setQuotations(data);
        } else {
          setError(data.message || 'Failed to fetch quotations');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchQuotations();
    }
  }, [token]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="badge badge-success">Approved / Accepted</span>;
      case 'rejected': return <span className="badge badge-danger">Rejected</span>;
      case 'under_review': return <span className="badge badge-info">Under Review</span>;
      default: return <span className="badge badge-warning">Submitted</span>;
    }
  };

  return (
    <div className="main-content">
      <Navbar title="My Quotations Bids Portfolio" />

      <div className="my-quotes-page animate-fade-in">
        
        {error && <div className="auth-alert alert-error">{error}</div>}

        <div className="quotes-list-card glass-panel">
          <div className="card-header">
            <h3>My Quotation Submissions</h3>
            <span className="badge badge-info">{quotations.length} Submissions</span>
          </div>

          {loading ? (
            <div className="no-data">Loading quotations...</div>
          ) : quotations.length === 0 ? (
            <div className="no-data">You have not submitted any quotation proposals yet.</div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Assigned RFQ Name</th>
                    <th>Subtotal Price</th>
                    <th>Estimated Delivery</th>
                    <th>Bidding Date</th>
                    <th>Approval Status</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map(quote => {
                    const total = quote.items.reduce((sum, item) => sum + item.total, 0);
                    return (
                      <tr 
                        key={quote._id} 
                        onClick={() => navigate(`/rfqs/${quote.rfqId?._id}`)} 
                        className="cursor-pointer"
                      >
                        <td>
                          <div>
                            <strong className="text-white">{quote.rfqId?.title || 'Deleted RFQ'}</strong>
                            <p className="sub-text">RFQ Due: {new Date(quote.rfqId?.deadline).toLocaleDateString()}</p>
                          </div>
                        </td>
                        <td><strong className="text-accent">{formatCurrency(total)}</strong></td>
                        <td><span>{quote.deliveryTimeline} Days</span></td>
                        <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                        <td>{getStatusBadge(quote.status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default VendorQuotations;
