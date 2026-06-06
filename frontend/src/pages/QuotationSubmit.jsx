import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { ClipboardList, ArrowLeft, Send, Save } from 'lucide-react';
import '../styles/QuotationSubmit.css';

const QuotationSubmit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, authFetch } = useAuth();

  const [rfq, setRfq] = useState(null);
  const [items, setItems] = useState([]);
  
  // Custom inputs matching Screen 6 mockup
  const [deliveryTimeline, setDeliveryTimeline] = useState(7);
  const [taxRate, setTaxRate] = useState(18); // default GST 18%
  const [notes, setNotes] = useState('Payment terms: 30 days net...');

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchRFQAndQuotation = async () => {
      try {
        // Fetch RFQ Details
        const rfqRes = await authFetch(`/rfq/${id}`);
        const rfqData = await rfqRes.json();
        
        if (!rfqRes.ok) {
          setError(rfqData.message || 'Failed to fetch RFQ details');
          setLoading(false);
          return;
        }

        setRfq(rfqData);

        // Fetch user's existing quotation for this RFQ if it exists
        const quotesRes = await authFetch('/quotations/vendor/my');
        const quotesData = await quotesRes.json();
        
        if (quotesRes.ok) {
          const existingQuote = quotesData.find(q => q.rfqId._id === id);
          if (existingQuote) {
            setItems(existingQuote.items);
            setDeliveryTimeline(existingQuote.deliveryTimeline);
            setNotes(existingQuote.notes || '');
          } else {
            // Map RFQ items into Quotation structure
            const mappedItems = rfqData.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: 0,
              total: 0
            }));
            setItems(mappedItems);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchRFQAndQuotation();
    }
  }, [token, id]);

  const handlePriceChange = (index, price) => {
    const unitPrice = parseFloat(price) || 0;
    const list = [...items];
    list[index].unitPrice = unitPrice;
    list[index].total = list[index].quantity * unitPrice;
    setItems(list);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const subtotalVal = calculateSubtotal();
  const gstVal = (subtotalVal * taxRate) / 100;
  const grandTotalVal = subtotalVal + gstVal;

  const handleFormSubmit = async (e, quoteStatus = 'submitted') => {
    e.preventDefault();

    const invalidPrice = items.some(item => item.unitPrice <= 0);
    if (invalidPrice && quoteStatus === 'submitted') {
      setError('Please provide unit price greater than 0 for all items');
      return;
    }

    setError('');
    setMessage('');
    setSubmitLoading(true);

    try {
      const payload = {
        rfqId: id,
        items,
        deliveryTimeline,
        notes,
        status: quoteStatus
      };

      const res = await authFetch('/quotations', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(quoteStatus === 'draft' ? 'Draft saved successfully!' : 'Your quotation has been successfully submitted!');
        setTimeout(() => {
          navigate(`/rfqs/${id}`);
        }, 1500);
      } else {
        setError(data.message || 'Quotation submission failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading quotation bidding form...</p>
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

  return (
    <div className="main-content">
      <Navbar title="VendorBridge" />

      <div className="quote-submit-layout animate-fade-in">
        
        <button onClick={() => navigate(`/rfqs/${id}`)} className="text-btn back-btn no-print">
          <ArrowLeft size={16} />
          <span>Back to RFQ Specs</span>
        </button>

        {message && <div className="auth-alert alert-success">{message}</div>}
        {error && <div className="auth-alert alert-error">{error}</div>}

        <div className="quote-form-card glass-panel">
          
          {/* Header Title block */}
          <div className="quote-header-title-block">
            <h2>Submit Quotations</h2>
            <p>RFQ: {rfq?.title} - deadline {rfq && new Date(rfq.deadline).toLocaleDateString()}</p>
          </div>

          {/* RFQ Summary Card matching Screen 6 mockup */}
          <div className="rfq-summary-card-inner">
            <span>RFQ Summary:</span>
            <p>
              {rfq?.items?.map(i => `${i.name} * ${i.quantity}`).join(', ')} - category {rfq?.description ? 'furniture' : 'general'}
            </p>
          </div>

          <form className="quote-submission-form-sketched">
            
            {/* Table with pricing input */}
            <div className="quote-items-table-sketched">
              <h4>Your Quotation</h4>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Unit price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.quantity} {item.unit}</td>
                        <td>
                          <div className="price-input-wrapper">
                            <span className="cur-sym">₹</span>
                            <input 
                              type="number"
                              min="0"
                              className="form-input table-price-input"
                              placeholder="0"
                              value={item.unitPrice || ''}
                              onChange={(e) => handlePriceChange(index, e.target.value)}
                              required
                            />
                          </div>
                        </td>
                        <td>
                          <strong className="table-total-text">
                            {formatCurrency(item.total)}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Split layout: inputs vs calculations box */}
            <div className="quote-submit-bottom-flex">
              
              {/* Inputs */}
              <div className="quote-submit-inputs-left">
                
                <div className="form-group">
                  <label className="form-label">Delivery (days)</label>
                  <input 
                    type="number"
                    min="1"
                    className="form-input"
                    value={deliveryTimeline}
                    onChange={(e) => setDeliveryTimeline(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">tax / GST %</label>
                  <input 
                    type="number"
                    min="0"
                    className="form-input"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Note / terms</label>
                  <textarea 
                    className="form-textarea"
                    rows={3}
                    placeholder="Input payment terms, warranty rules..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>

              </div>

              {/* Calculations Box matching Screen 6 summary block */}
              <div className="quote-calculations-right-card">
                <div className="calc-row">
                  <span>Subtotal</span>
                  <strong>{formatCurrency(subtotalVal)}</strong>
                </div>
                <div className="calc-row">
                  <span>GST ({taxRate}%)</span>
                  <strong>{formatCurrency(gstVal)}</strong>
                </div>
                <div className="calc-row grand-total-calc border-t-thick">
                  <span>Grand total</span>
                  <strong className="text-accent">{formatCurrency(grandTotalVal)}</strong>
                </div>
              </div>

            </div>

            {/* Actions Footer matching Screen 6 */}
            <div className="quote-submit-action-footer no-print">
              <button 
                type="button" 
                onClick={(e) => handleFormSubmit(e, 'submitted')}
                className="btn btn-primary"
                disabled={submitLoading}
              >
                <span>Submit Quotation</span>
              </button>
              <button 
                type="button" 
                onClick={(e) => handleFormSubmit(e, 'draft')}
                className="btn btn-secondary"
                disabled={submitLoading}
              >
                <span>Save Draft</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};

export default QuotationSubmit;
