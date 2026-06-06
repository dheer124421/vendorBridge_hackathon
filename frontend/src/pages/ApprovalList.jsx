import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Check, X, FileSignature, History, CheckCircle, Clock } from 'lucide-react';
import '../styles/ApprovalList.css';

const ApprovalList = () => {
  const { token, authFetch } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const pendingRes = await authFetch('/approvals/pending');
      const pendingData = await pendingRes.json();
      if (pendingRes.ok) {
        setApprovals(pendingData);
        // Pre-select first pending approval
        if (pendingData.length > 0) {
          setSelectedApproval(pendingData[0]);
        }
      }

      const historyRes = await authFetch('/approvals');
      const historyData = await historyRes.json();
      if (historyRes.ok) {
        const processed = historyData.filter(a => a.status !== 'pending');
        setHistory(processed);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchApprovals();
    }
  }, [token]);

  const handleAction = async (approvalId, status) => {
    if (!remarks.trim()) {
      setError('Please add evaluation remarks first');
      return;
    }

    setError('');
    setMessage('');
    setActionLoading(true);

    try {
      const res = await authFetch(`/approvals/${approvalId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, remarks })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(`Quotation successfully ${status === 'approved' ? 'Approved' : 'Rejected'}!`);
        setSelectedApproval(null);
        setRemarks('');
        fetchApprovals();
      } else {
        setError(data.message || 'Failed to process approval');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="badge badge-success">Approved</span>;
      case 'rejected': return <span className="badge badge-danger">Rejected</span>;
      default: return <span className="badge badge-warning">Pending Review</span>;
    }
  };

  const currentTotal = selectedApproval?.quotationId?.items?.reduce((sum, item) => sum + item.total, 0) * 1.18 || 0;

  return (
    <div className="main-content">
      <Navbar title="VendorBridge" />

      <div className="approvals-page-layout animate-fade-in">
        
        {message && <div className="auth-alert alert-success">{message}</div>}
        {error && <div className="auth-alert alert-error">{error}</div>}

        <div className="approvals-grid">
          
          {/* Left Side: Pending List & History */}
          <div className="approvals-left-col">
            
            <div className="approvals-card glass-panel">
              <div className="card-header">
                <h3><FileSignature size={18} /> Pending Bids Review</h3>
                <span className="badge badge-warning">{approvals.length} Pending</span>
              </div>

              {loading ? (
                <div className="no-data">Loading pending reviews...</div>
              ) : approvals.length === 0 ? (
                <div className="no-data">No pending reviews.</div>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>RFQ Title</th>
                        <th>Vendor Company</th>
                        <th>Quote Grand Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvals.map(app => {
                        const total = app.quotationId?.items?.reduce((sum, item) => sum + item.total, 0) * 1.18 || 0;
                        return (
                          <tr 
                            key={app._id} 
                            onClick={() => { setSelectedApproval(app); setError(''); }}
                            className={`cursor-pointer ${selectedApproval?._id === app._id ? 'row-active' : ''}`}
                          >
                            <td><strong>{app.rfqId?.title}</strong></td>
                            <td>{app.quotationId?.vendorId?.name || 'N/A'}</td>
                            <td><strong className="text-accent">{formatCurrency(total)}</strong></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* History processed list */}
            <div className="approvals-card glass-panel mt-6">
              <div className="card-header">
                <h3><History size={18} /> Review History</h3>
                <span className="badge badge-info">{history.length} Reviewed</span>
              </div>

              {loading ? (
                <div className="no-data">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="no-data">No history records found.</div>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>RFQ Title</th>
                        <th>Vendor</th>
                        <th>Total Value</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(app => {
                        const total = app.quotationId?.items?.reduce((sum, item) => sum + item.total, 0) * 1.18 || 0;
                        return (
                          <tr key={app._id}>
                            <td><strong>{app.rfqId?.title}</strong></td>
                            <td>{app.quotationId?.vendorId?.name || 'N/A'}</td>
                            <td>{formatCurrency(total)}</td>
                            <td>{getStatusBadge(app.status)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Side: Sketched Screen 8 Approval Workflow panel */}
          <div className="approvals-right-col glass-panel">
            {selectedApproval ? (
              <div className="sketched-approval-workflow-box">
                
                {/* Header Subheading matching Screen 8 */}
                <div className="workflow-title-block">
                  <h2>Approval Workflow</h2>
                  <p>RFQ: {selectedApproval.rfqId?.title} - Vendor: {selectedApproval.quotationId?.vendorId?.name} - {formatCurrency(currentTotal)}</p>
                </div>

                {/* Step indicator progress line matching Screen 8 */}
                <div className="sketched-steps-indicator no-print">
                  <div className="sketched-step active">
                    <span className="step-circle">1</span>
                    <span className="step-tag">Submitted</span>
                  </div>
                  <div className="sketched-step-line done"></div>
                  
                  <div className="sketched-step active">
                    <span className="step-circle">2</span>
                    <span className="step-tag">L1 Review</span>
                  </div>
                  <div className="sketched-step-line active"></div>

                  <div className="sketched-step highlight">
                    <span className="step-circle">3</span>
                    <span className="step-tag">L2 approval</span>
                  </div>
                  <div className="sketched-step-line"></div>

                  <div className="sketched-step">
                    <span className="step-circle">4</span>
                    <span className="step-tag">Generate PO</span>
                  </div>
                </div>

                {/* Split columns: Chain vs Summary */}
                <div className="sketched-chain-summary-flex">
                  
                  {/* Approval Chain (Left) */}
                  <div className="sketched-approval-chain-box">
                    <h4>Approval Chain</h4>
                    <div className="chain-list-sketched">
                      
                      <div className="chain-item-sketched approved">
                        <div className="icon-wrapper-sketched green">
                          <CheckCircle size={16} />
                        </div>
                        <div className="chain-item-info">
                          <span className="chain-officer-name">Rahul Mehta (Procurement head)</span>
                          <span className="chain-date">Approved on May 20, 10:32 AM</span>
                        </div>
                      </div>

                      <div className="chain-item-sketched pending">
                        <div className="icon-wrapper-sketched blue">
                          <Clock size={16} />
                        </div>
                        <div className="chain-item-info">
                          <span className="chain-officer-name">Priya Shah (finance manager)</span>
                          <span className="chain-date">Awaiting | Assigned May 21</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Quotations Summary Card (Right) */}
                  <div className="sketched-quotations-summary-card">
                    <h4>Quotations Summary</h4>
                    <div className="summary-fields-list">
                      <div className="summary-field">
                        <span>Vendor:</span>
                        <strong>{selectedApproval.quotationId?.vendorId?.name || 'Infra Supplies Pvt Ltd'}</strong>
                      </div>
                      <div className="summary-field">
                        <span>Total:</span>
                        <strong>{formatCurrency(currentTotal)}</strong>
                      </div>
                      <div className="summary-field">
                        <span>Delivery:</span>
                        <strong>{selectedApproval.quotationId?.deliveryTimeline} days</strong>
                      </div>
                      <div className="summary-field">
                        <span>Rating:</span>
                        <strong className="text-accent">4.5 / 5</strong>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Remarks & buttons */}
                <div className="sketched-remarks-submit-box">
                  <div className="form-group">
                    <label className="form-label">Approval Remarks</label>
                    <textarea 
                      className="form-textarea"
                      rows={3}
                      placeholder="Add your comments or conditions...."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="actions-button-row no-print">
                    <button 
                      onClick={() => handleAction(selectedApproval._id, 'approved')}
                      className="btn btn-success flex-1"
                      disabled={actionLoading}
                    >
                      <span>Approve</span>
                    </button>
                    <button 
                      onClick={() => handleAction(selectedApproval._id, 'rejected')}
                      className="btn btn-danger flex-1"
                      disabled={actionLoading}
                    >
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="select-prompt-box">
                <FileSignature size={48} className="prompt-icon" />
                <h3>No Workflow Selected</h3>
                <p>Select a pending quotation package from the list on the left to verify logs and process workflow states.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ApprovalList;
