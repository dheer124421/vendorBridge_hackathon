import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { Receipt, Printer, Download, Mail, CreditCard, Send, ShieldCheck } from 'lucide-react';
import '../styles/InvoiceList.css';

const InvoiceList = () => {
  const { user, token, authFetch } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Email form fields
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/invoices');
      const data = await res.json();
      if (res.ok) {
        setInvoices(data);
        if (data.length > 0) {
          setSelectedInvoice(data[0]);
        }
      } else {
        setError(data.message || 'Failed to fetch invoices');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInvoices();
    }
  }, [token]);

  const handlePayInvoice = async (invoiceId) => {
    setError('');
    setMessage('');
    setActionLoading(true);
    try {
      const res = await authFetch(`/invoices/${invoiceId}/pay`, {
        method: 'PUT'
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(`Invoice ${data.invoiceNumber} successfully paid!`);
        fetchInvoices();
        if (selectedInvoice && selectedInvoice._id === invoiceId) {
          setSelectedInvoice({ ...selectedInvoice, status: 'paid' });
        }
      } else {
        setError(data.message || 'Failed to process payment');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEmailModal = (invoice) => {
    setSelectedInvoice(invoice);
    setEmailTo(invoice.vendorId?.email || 'supplier@company.com');
    setEmailSubject(`Settlement Details for Invoice: ${invoice.invoiceNumber}`);
    setEmailBody(`Dear Partner,\n\nWe have received your Invoice ${invoice.invoiceNumber} corresponding to Purchase Order ${invoice.purchaseOrderId?.poNumber || 'PO-2025-0068'}.\n\nThe invoice value of ${formatCurrency(invoice.totalAmount)} is currently processed for settlement.\n\nRegards,\nProcurement Team\nVendorBridge Corp.`);
    setShowEmailModal(true);
  };

  const handleSendEmailSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setError('');
    setMessage('');
    setActionLoading(true);

    try {
      const res = await authFetch(`/invoices/${selectedInvoice._id}/email`, {
        method: 'POST',
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject,
          body: emailBody
        })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Email sent successfully!');
        setShowEmailModal(false);
      } else {
        setError(data.message || 'Failed to send email');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
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

  // Tax calculations split CGST (9%) and SGST (9%) matching Screen 9
  const subtotalVal = selectedInvoice?.subtotal || 169500;
  const cgstVal = (subtotalVal * 9) / 100;
  const sgstVal = (subtotalVal * 9) / 100;
  const totalAmountVal = subtotalVal + cgstVal + sgstVal;

  return (
    <div className="main-content">
      <Navbar title="VendorBridge" />

      <div className="invoice-page-layout animate-fade-in">
        
        {message && <div className="auth-alert alert-success">{message}</div>}
        {error && <div className="auth-alert alert-error">{error}</div>}

        <div className="invoice-visual-split-grid">
          
          {/* Left Side: Invoice List Registry */}
          <div className="invoice-left-card glass-panel">
            <div className="card-header">
              <h3>Invoices Registry</h3>
              <span className="badge badge-info">{invoices.length} Bills</span>
            </div>

            {loading ? (
              <div className="no-data">Loading invoices list...</div>
            ) : invoices.length === 0 ? (
              <div className="no-data">No invoices registered.</div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>PO Ref</th>
                      <th>Vendor</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr 
                        key={inv._id} 
                        onClick={() => setSelectedInvoice(inv)}
                        className={`cursor-pointer ${selectedInvoice?._id === inv._id ? 'row-active' : ''}`}
                      >
                        <td><strong>{inv.invoiceNumber}</strong></td>
                        <td>{inv.purchaseOrderId?.poNumber || 'PO-2025-0068'}</td>
                        <td>{inv.vendorId?.name || 'Supplier'}</td>
                        <td><strong className="text-accent">{formatCurrency(inv.totalAmount)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Side: Sketched Screen 9 Purchase Order & Invoice Sheet */}
          <div className="invoice-right-col glass-panel">
            {selectedInvoice ? (
              <div className="sketched-po-invoice-sheet">
                
                {/* Header title block matching Screen 9 */}
                <div className="sheet-header-sketched">
                  <div className="sheet-title-left">
                    <h2>Purchase Order & Invoice</h2>
                    <p>PO-{selectedInvoice.purchaseOrderId?.poNumber || '2024'}-auto-generated after approval</p>
                  </div>
                  
                  {/* Actions buttons */}
                  <div className="sheet-actions-right no-print">
                    <button type="button" onClick={handlePrint} className="btn-action-sheet" title="Download PDF">
                      <Download size={14} />
                      <span>Download PDF</span>
                    </button>
                    <button type="button" onClick={handlePrint} className="btn-action-sheet" title="Print">
                      <Printer size={14} />
                      <span>Print</span>
                    </button>
                    <button type="button" onClick={() => handleOpenEmailModal(selectedInvoice)} className="btn-action-sheet" title="Email Invoice">
                      <Mail size={14} />
                      <span>Email Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Billing details card splits */}
                <div className="sheet-parties-sketched">
                  <div className="party-box">
                    <h4>Bill to:</h4>
                    <strong>Your Organization Name</strong>
                    <p>123 business park, ahmedabad</p>
                    <p>GSTIN: 24TEST987654C1Z</p>
                  </div>

                  <div className="party-box">
                    <h4>Vendor</h4>
                    <strong>{selectedInvoice.vendorId?.name || 'Infra supplies pvt ltd'}</strong>
                    <p>{selectedInvoice.vendorId?.email || '456, industrial estate, surat'}</p>
                    <p>GSTIN: 24ABCDE1234F1Z1</p>
                  </div>
                </div>

                {/* PO Number dates row */}
                <div className="sheet-po-dates-row">
                  <div className="date-field">
                    <span>PO Number:</span>
                    <strong>{selectedInvoice.purchaseOrderId?.poNumber || 'PO-2025-0068'}</strong>
                  </div>
                  <div className="date-field">
                    <span>PO date:</span>
                    <span>21 May, 2026</span>
                  </div>
                  <div className="date-field">
                    <span>Invoice date:</span>
                    <span>{new Date(selectedInvoice.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="date-field">
                    <span>Due date:</span>
                    <span className="text-danger">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Item prices table */}
                <div className="table-container sheet-table-box">
                  <table className="custom-table table-sheet">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Unit price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.unitPrice)}</td>
                          <td>{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                      
                      {/* Calculations summary splits CGST / SGST matching Screen 9 */}
                      <tr className="sheet-summary-row border-t-thick">
                        <td colSpan="2"></td>
                        <td className="text-right">Subtotal:</td>
                        <td>{formatCurrency(subtotalVal)}</td>
                      </tr>
                      <tr className="sheet-summary-row">
                        <td colSpan="2"></td>
                        <td className="text-right">CGST (9%):</td>
                        <td>{formatCurrency(cgstVal)}</td>
                      </tr>
                      <tr className="sheet-summary-row">
                        <td colSpan="2"></td>
                        <td className="text-right">SGST (9%):</td>
                        <td>{formatCurrency(sgstVal)}</td>
                      </tr>
                      <tr className="sheet-summary-row grand-total">
                        <td colSpan="2"></td>
                        <td className="text-right"><strong>Grand total:</strong></td>
                        <td><strong className="text-accent">{formatCurrency(totalAmountVal)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bottom status remittee matching Screen 9 */}
                <div className="sheet-status-remittee-bar">
                  <div className="status-badge-highlight">
                    <span>status:</span>
                    <span className={`badge ${selectedInvoice.status === 'paid' ? 'badge-success' : 'badge-yellow-highlight'}`}>
                      {selectedInvoice.status === 'paid' ? 'Remitted' : 'Pending Payment'}
                    </span>
                  </div>

                  {user.role === 'officer' && selectedInvoice.status === 'unpaid' && (
                    <button 
                      onClick={() => handlePayInvoice(selectedInvoice._id)}
                      className="btn btn-success text-xs no-print btn-mark-paid"
                      disabled={actionLoading}
                    >
                      <CreditCard size={14} />
                      <span>Mark as Paid</span>
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="select-prompt-box">
                <Receipt size={48} className="prompt-icon" />
                <h3>No Invoice Selected</h3>
                <p>Select an invoice row on the left to verify specifications and make payments.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Email form overlay */}
      {showEmailModal && selectedInvoice && (
        <Modal 
          isOpen={showEmailModal} 
          onClose={() => setShowEmailModal(false)}
          title={`Email Dispatch: ${selectedInvoice.invoiceNumber}`}
        >
          <form onSubmit={handleSendEmailSubmit} className="email-dispatch-form no-print">
            <div className="form-group">
              <label className="form-label">Recipient Email (To)</label>
              <input 
                type="email"
                className="form-input"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input 
                type="text"
                className="form-input"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Message Body</label>
              <textarea 
                className="form-textarea"
                rows={5}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="email-attachment-box">
              <Receipt size={16} />
              <span>Attachment: <strong>{selectedInvoice.invoiceNumber}.pdf</strong> (Automated generation)</span>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={actionLoading}>
              <Send size={16} />
              <span>{actionLoading ? 'Dispatching Mail...' : 'Send Simulated Email'}</span>
            </button>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default InvoiceList;
