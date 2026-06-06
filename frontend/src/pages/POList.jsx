import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { FileText, Printer, Download, PlusCircle, CheckCircle, Receipt } from 'lucide-react';
import '../styles/POList.css';

const POList = () => {
  const { user, token, authFetch } = useAuth();
  const [pos, setPos] = useState([]);
  const [awaitingQuotes, setAwaitingQuotes] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [showPOModal, setShowPOModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Billing states
  const [billingDate, setBillingDate] = useState('');
  const [showInvoiceConfirm, setShowInvoiceConfirm] = useState(false);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchPOs = async () => {
    setLoading(true);
    try {
      // Fetch PO List
      const poRes = await authFetch('/purchase-orders');
      const poData = await poRes.json();
      if (poRes.ok) {
        setPos(poData);
      }

      // If officer, fetch quotations that are approved but do not have POs yet
      if (user.role === 'officer') {
        const approvalsRes = await authFetch('/approvals');
        const approvalsData = await approvalsRes.json();
        
        if (approvalsRes.ok) {
          // Filter approvals where status is approved
          const approvedBids = approvalsData.filter(a => a.status === 'approved');
          
          // Filter out those that already have POs
          const existingQuotationIds = poData.map(p => p.quotationId);
          const pendingPOs = approvedBids.filter(b => !existingQuotationIds.includes(b.quotationId?._id));
          setAwaitingQuotes(pendingPOs);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPOs();
    }
  }, [token]);

  const handleGeneratePO = async (quotationId) => {
    setError('');
    setMessage('');
    try {
      const res = await authFetch('/purchase-orders', {
        method: 'POST',
        body: JSON.stringify({ quotationId })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Purchase Order ${data.poNumber} generated successfully!`);
        fetchPOs();
      } else {
        setError(data.message || 'Failed to generate PO');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerateInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPO) return;

    setError('');
    setMessage('');
    try {
      const res = await authFetch('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          purchaseOrderId: selectedPO._id,
          dueDate: billingDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Invoice ${data.invoiceNumber} successfully generated for PO ${selectedPO.poNumber}!`);
        setShowPOModal(false);
        setShowInvoiceConfirm(false);
        fetchPOs();
      } else {
        setError(data.message || 'Failed to submit invoice');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="main-content">
      <Navbar title="Purchase Orders Registry" />

      <div className="po-page-layout animate-fade-in">
        
        {message && <div className="auth-alert alert-success">{message}</div>}
        {error && <div className="auth-alert alert-error">{error}</div>}

        {/* 1. Approved Quotations section (Officer only) */}
        {user.role === 'officer' && awaitingQuotes.length > 0 && (
          <div className="po-card glass-panel awaiting-section">
            <div className="card-header">
              <h3>Approved Quotations Awaiting PO Issuance</h3>
              <span className="badge badge-warning">{awaitingQuotes.length} Quotes</span>
            </div>
            
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>RFQ Subject</th>
                    <th>Supplier Vendor</th>
                    <th>Subtotal Bid</th>
                    <th>Timeline</th>
                    <th>Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {awaitingQuotes.map(quoteApp => {
                    const subtotal = quoteApp.quotationId?.items?.reduce((sum, item) => sum + item.total, 0) || 0;
                    return (
                      <tr key={quoteApp._id}>
                        <td><strong>{quoteApp.rfqId?.title}</strong></td>
                        <td>{quoteApp.quotationId?.vendorId?.name || 'N/A'}</td>
                        <td><strong className="text-accent">{formatCurrency(subtotal)}</strong></td>
                        <td>{quoteApp.quotationId?.deliveryTimeline} days</td>
                        <td>
                          <button 
                            onClick={() => handleGeneratePO(quoteApp.quotationId?._id)}
                            className="btn btn-success text-xs"
                          >
                            <PlusCircle size={14} />
                            <span>Issue PO</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. PO Registry list */}
        <div className="po-card glass-panel">
          <div className="card-header">
            <h3>Issued Purchase Orders</h3>
            <span className="badge badge-info">{pos.length} Issued</span>
          </div>

          {loading ? (
            <div className="no-data">Fetching purchase orders...</div>
          ) : pos.length === 0 ? (
            <div className="no-data">No Purchase Orders have been generated yet.</div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>RFQ Subject</th>
                    <th>Vendor Partner</th>
                    <th>Subtotal</th>
                    <th>Total Value</th>
                    <th>Status</th>
                    <th>Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {pos.map(po => (
                    <tr key={po._id}>
                      <td><strong className="text-white">{po.poNumber}</strong></td>
                      <td>{po.rfqId?.title || 'General'}</td>
                      <td>{po.vendorId?.name || 'N/A'}</td>
                      <td>{formatCurrency(po.subtotal)}</td>
                      <td><strong className="text-accent">{formatCurrency(po.totalAmount)}</strong></td>
                      <td><span className={`badge ${po.status === 'issued' ? 'badge-warning' : po.status === 'completed' ? 'badge-success' : 'badge-info'}`}>{po.status}</span></td>
                      <td>
                        <button 
                          onClick={() => { setSelectedPO(po); setShowPOModal(true); }}
                          className="btn btn-secondary text-xs"
                        >
                          <span>Review Document</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* PO Review Modal */}
      {selectedPO && (
        <Modal 
          isOpen={showPOModal} 
          onClose={() => { setShowPOModal(false); setShowInvoiceConfirm(false); }}
          title={`Document Preview: ${selectedPO.poNumber}`}
        >
          <div className="po-receipt-document print-area">
            <div className="receipt-header">
              <div className="header-left">
                <h1 className="company-logo-text">VendorBridge ERP</h1>
                <p>Global Procurement Operations</p>
                <p>Karnataka Office, Bangalore, India</p>
              </div>
              <div className="header-right">
                <h2>PURCHASE ORDER</h2>
                <div className="meta-box-inner">
                  <div className="meta-row"><span>PO Number:</span> <strong>{selectedPO.poNumber}</strong></div>
                  <div className="meta-row"><span>Date Issued:</span> <span>{new Date(selectedPO.createdAt).toLocaleDateString()}</span></div>
                  <div className="meta-row"><span>Status:</span> <span className="text-accent">{selectedPO.status.toUpperCase()}</span></div>
                </div>
              </div>
            </div>

            <hr className="divider" />

            <div className="receipt-parties">
              <div className="party-col">
                <h4>Issued To (Supplier):</h4>
                <p className="party-name">{selectedPO.vendorId?.name}</p>
                <p className="party-sub">Email: {selectedPO.vendorId?.email}</p>
                <p>Tax code / GSTIN: 29ABCDE1234F1Z1</p>
              </div>
              <div className="party-col text-right">
                <h4>Bill & Ship To:</h4>
                <p className="party-name">VendorBridge Corp Ltd</p>
                <p>Whitefield Outer Ring Rd, Bangalore</p>
                <p>GSTIN: 29TEST987654C1Z1</p>
              </div>
            </div>

            <div className="receipt-items-table">
              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Qty</th>
                    <th>Unit Price (INR)</th>
                    <th>Total Price (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPO.items.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                  <tr className="summary-row">
                    <td colSpan="2"></td>
                    <td>Subtotal:</td>
                    <td>{formatCurrency(selectedPO.subtotal)}</td>
                  </tr>
                  <tr className="summary-row">
                    <td colSpan="2"></td>
                    <td>GST Rate (18%):</td>
                    <td>{formatCurrency(selectedPO.taxAmount)}</td>
                  </tr>
                  <tr className="summary-row grand-total">
                    <td colSpan="2"></td>
                    <td>Grand Total:</td>
                    <td><strong>{formatCurrency(selectedPO.totalAmount)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="receipt-notes">
              <h4>Terms & Conditions:</h4>
              <p>1. Please reference the PO Number on all shipping boxes and invoices.</p>
              <p>2. Payment terms: 30 days net from invoice submission date.</p>
            </div>
          </div>

          <div className="modal-actions-buttons no-print">
            <button onClick={handlePrint} className="btn btn-secondary flex-1">
              <Printer size={16} />
              <span>Print Receipt</span>
            </button>
            
            {/* Vendor can generate Invoice */}
            {user.role === 'vendor' && selectedPO.status === 'issued' && !showInvoiceConfirm && (
              <button onClick={() => setShowInvoiceConfirm(true)} className="btn btn-success flex-1">
                <Receipt size={16} />
                <span>Submit Invoice</span>
              </button>
            )}
          </div>

          {/* Inline billing date dialog */}
          {showInvoiceConfirm && (
            <form onSubmit={handleGenerateInvoiceSubmit} className="invoice-confirm-form no-print animate-fade-in">
              <h4>Specify Invoice Settlement Parameters</h4>
              
              <div className="form-group">
                <label className="form-label">Payment Due Date</label>
                <input 
                  type="date"
                  className="form-input"
                  value={billingDate}
                  onChange={(e) => setBillingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="actions-button-row">
                <button type="submit" className="btn btn-success flex-1">
                  <span>Submit Billing Request</span>
                </button>
                <button type="button" onClick={() => setShowInvoiceConfirm(false)} className="btn btn-secondary flex-1">
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

    </div>
  );
};

export default POList;
