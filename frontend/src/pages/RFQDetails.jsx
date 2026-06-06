import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Calendar, User, ShieldAlert, Award, ArrowLeft, Send } from 'lucide-react';
import '../styles/RFQDetails.css';

const RFQDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, authFetch } = useAuth();

  const [rfq, setRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submittingApprovalId, setSubmittingApprovalId] = useState(null);

  const fetchRFQDetails = async () => {
    try {
      const res = await authFetch(`/rfq/${id}`);
      const data = await res.json();
      
      if (res.ok) {
        setRfq(data);
        if (user.role !== 'vendor') {
          const quotesRes = await authFetch(`/quotations/rfq/${id}`);
          const quotesData = await quotesRes.json();
          if (quotesRes.ok) {
            setQuotations(quotesData);
          }
        } else {
          const quotesRes = await authFetch('/quotations/vendor/my');
          const quotesData = await quotesRes.json();
          if (quotesRes.ok) {
            const myQuote = quotesData.find(q => q.rfqId._id === id);
            if (myQuote) {
              setQuotations([myQuote]);
            }
          }
        }
      } else {
        setError(data.message || 'Failed to fetch RFQ specifications');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchRFQDetails();
    }
  }, [token, id]);

  const handleInitiateApproval = async (quotationId, remarks = 'Initiated approval workflow - Level 1 Review.') => {
    setSubmittingApprovalId(quotationId);
    setError('');
    setMessage('');
    try {
      const res = await authFetch('/approvals/initiate', {
        method: 'POST',
        body: JSON.stringify({
          quotationId,
          rfqId: id,
          remarks
        })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Approval workflow successfully initiated for Manager evaluation!');
        fetchRFQDetails();
      } else {
        setError(data.message || 'Failed to initiate approval');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingApprovalId(null);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading details...</p>
        </div>
      </div>
    );
  }

  if (error && !rfq) {
    return (
      <div className="main-content">
        <Navbar title="RFQ Details" />
        <div className="auth-alert alert-error mt-4">{error}</div>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Find lowest price quotation
  const quoteTotals = quotations.map(q => q.items.reduce((sum, item) => sum + item.total, 0) * 1.18); // including tax
  const minTotal = quoteTotals.length > 0 ? Math.min(...quoteTotals) : 0;

  return (
    <div className="main-content">
      <Navbar title="VendorBridge" />

      <div className="rfq-details-layout animate-fade-in">
        
        <button onClick={() => navigate('/rfqs')} className="text-btn back-btn no-print">
          <ArrowLeft size={16} />
          <span>Back to RFQs List</span>
        </button>

        {message && <div className="auth-alert alert-success">{message}</div>}
        {error && <div className="auth-alert alert-error">{error}</div>}

        <div className="rfq-spec-grid">
          
          {/* RFQ basic specifications */}
          <div className="rfq-info-column glass-panel">
            <div className="rfq-title-row">
              <span className={`badge ${rfq.status === 'open' ? 'badge-success' : 'badge-danger'}`}>
                {rfq.status.toUpperCase()}
              </span>
              <h2>{rfq.title}</h2>
            </div>
            
            <p className="rfq-desc-text">{rfq.description || 'No description provided.'}</p>
            
            <div className="rfq-meta-items">
              <div className="meta-item">
                <Calendar size={16} />
                <span>Deadline: <strong>{new Date(rfq.deadline).toLocaleDateString()}</strong></span>
              </div>
              <div className="meta-item">
                <User size={16} />
                <span>Created by: {rfq.createdBy?.name}</span>
              </div>
            </div>

            <div className="rfq-items-table-box">
              <h3>Requested items list</h3>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfq.items.map((item, i) => (
                      <tr key={i}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.quantity}</td>
                        <td><span className="badge badge-info">{item.unit}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Vendors checklists side column */}
          {user.role !== 'vendor' && (
            <div className="rfq-actions-column glass-panel no-print">
              <div className="officer-actions-box">
                <h3>Assigned Bidders</h3>
                <p className="sub-text">Vendor partners assigned to respond:</p>
                <div className="assigned-vendors-list">
                  {rfq.assignedVendors.map(vendor => {
                    const hasSubmitted = quotations.some(q => q.vendorId?._id === vendor._id);
                    return (
                      <div key={vendor._id} className="assigned-vendor-row">
                        <div className="vendor-row-left">
                          <span className="avatar-mini">{vendor.name.charAt(0)}</span>
                          <div>
                            <span className="vendor-name-title">{vendor.name}</span>
                            <span className="vendor-email-subtitle">{vendor.email}</span>
                          </div>
                        </div>
                        <span className={`badge ${hasSubmitted ? 'badge-success' : 'badge-warning'}`}>
                          {hasSubmitted ? 'Submitted' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* If vendor responds */}
          {user.role === 'vendor' && (
            <div className="rfq-actions-column glass-panel no-print">
              <div className="vendor-actions-box">
                <h3>Quotation Bidding status</h3>
                {quotations.length > 0 ? (
                  <div className="my-quotation-summary">
                    <div className="my-quote-status">
                      <span>Status:</span>
                      <span className={`badge ${
                        quotations[0].status === 'approved' 
                          ? 'badge-success' 
                          : quotations[0].status === 'rejected' 
                            ? 'badge-danger' 
                            : 'badge-warning'
                      }`}>{quotations[0].status}</span>
                    </div>

                    <div className="my-quote-items">
                      {quotations[0].items.map((item, i) => (
                        <div key={i} className="quote-item-summary-line">
                          <span>{item.name}</span>
                          <strong>{formatCurrency(item.total)}</strong>
                        </div>
                      ))}
                      <div className="quote-item-summary-line total border-t">
                        <span>Grand total (Subtotal):</span>
                        <strong>{formatCurrency(quotations[0].items.reduce((sum, item) => sum + item.total, 0))}</strong>
                      </div>
                    </div>

                    {rfq.status === 'open' && (
                      <button 
                        onClick={() => navigate(`/rfqs/${rfq._id}/quotation`)}
                        className="btn btn-secondary w-full mt-4"
                      >
                        Edit Quotation Proposal
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="no-quote-prompt">
                    <p>You have not submitted a bid quotation for this RFQ yet.</p>
                    {rfq.status === 'open' ? (
                      <button 
                        onClick={() => navigate(`/rfqs/${rfq._id}/quotation`)}
                        className="btn btn-primary w-full mt-4"
                      >
                        <Send size={16} />
                        <span>Submit Quotation Bid</span>
                      </button>
                    ) : (
                      <span className="badge badge-danger w-full mt-4">RFQ IS CLOSED</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* 2. Quotation Comparison Matrix (Screen 7 Layout columns) */}
        {user.role !== 'vendor' && (
          <div className="quotation-comparison-section glass-panel">
            <div className="comparison-header">
              <Award size={22} className="logo-icon" />
              <h3>Quotation Comparison</h3>
              <p className="subtitle-comparison">RFQ: {rfq.title} - {quotations.length} quotations received</p>
            </div>

            {quotations.length === 0 ? (
              <p className="no-data">Waiting for vendors to submit quotations...</p>
            ) : (
              <div className="sketched-comparison-matrix-board">
                <div className="comparison-matrix-grid">
                  
                  {/* Column 1: Criteria header */}
                  <div className="criteria-column-sketched">
                    <div className="matrix-cell header-cell">Criteria</div>
                    <div className="matrix-cell">Grand Total</div>
                    <div className="matrix-cell">GST %</div>
                    <div className="matrix-cell">Delivery (days)</div>
                    <div className="matrix-cell">Vendor rating</div>
                    <div className="matrix-cell">Payment terms</div>
                    <div className="matrix-cell button-cell no-print">Select Bids</div>
                  </div>

                  {/* Vendor Columns */}
                  {quotations.map(quote => {
                    const subtotal = quote.items.reduce((sum, item) => sum + item.total, 0);
                    const grandTotal = subtotal * 1.18;
                    const isLowest = grandTotal === minTotal;
                    
                    return (
                      <div 
                        key={quote._id} 
                        className={`vendor-column-sketched ${isLowest ? 'highlight-lowest-green' : ''}`}
                      >
                        <div className="matrix-cell header-cell">
                          <strong>{quote.vendorId?.name || 'Supplier'}</strong>
                          {isLowest && <span className="lowest-capsule-lbl">(lowest)</span>}
                        </div>
                        <div className="matrix-cell val-cell">
                          <strong>{formatCurrency(grandTotal)}</strong>
                        </div>
                        <div className="matrix-cell val-cell">18%</div>
                        <div className="matrix-cell val-cell">{quote.deliveryTimeline} days</div>
                        <div className="matrix-cell val-cell">4.5/5</div>
                        <div className="matrix-cell val-cell">30 days</div>
                        <div className="matrix-cell button-cell no-print">
                          {rfq.status === 'open' ? (
                            quote.status === 'submitted' || quote.status === 'rejected' ? (
                              <button 
                                onClick={() => handleInitiateApproval(quote._id)}
                                className={`btn w-full text-xs ${isLowest ? 'btn-success' : 'btn-secondary'}`}
                                disabled={submittingApprovalId === quote._id}
                              >
                                {submittingApprovalId === quote._id 
                                  ? 'Initiating...' 
                                  : isLowest 
                                    ? 'Select & Approve' 
                                    : 'Select'}
                              </button>
                            ) : quote.status === 'under_review' ? (
                              <span className="matrix-label-info">Sent to Manager</span>
                            ) : quote.status === 'approved' ? (
                              <span className="badge badge-success text-xs">Approved Quote</span>
                            ) : null
                          ) : (
                            <span className="matrix-label-closed">Closed</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                </div>

                <div className="caption-text-sketched no-print">
                  <p>Green = lowest price, selecting vendor initiates the approval workflow.</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default RFQDetails;
