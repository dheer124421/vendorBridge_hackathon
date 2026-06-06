import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Plus, Trash, AlertTriangle, Save, Sparkles, UploadCloud, X } from 'lucide-react';
import '../styles/RFQCreate.css';

const RFQCreate = () => {
  const { token, authFetch } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Office Furniture');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  
  // Dynamic Items list matching mockup columns: Item, Qty, Unit
  const [items, setItems] = useState([
    { name: 'Ergonomic chair', quantity: 25, unit: 'pcs' },
    { name: 'Standing desks', quantity: 10, unit: 'pcs' }
  ]);
  
  // Vendors assignment tags list matching Screen 5 tag pills
  const [approvedVendors, setApprovedVendors] = useState([]);
  const [assignedVendors, setAssignedVendors] = useState([]); // Array of objects: { id, name }

  const [loading, setLoading] = useState(false);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Fetch approved vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await authFetch('/vendors?status=approved');
        const data = await res.json();
        if (res.ok) {
          setApprovedVendors(data);
          
          // Pre-populate some tags from mock vendors if database is small
          if (data.length > 0) {
            const preAssigned = data.slice(0, 1).map(v => ({
              id: v.userId?._id,
              name: v.companyName
            }));
            setAssignedVendors(preAssigned);
          }
        } else {
          setError(data.message || 'Failed to fetch vendor registry');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setVendorsLoading(false);
      }
    };

    if (token) {
      fetchVendors();
    }
  }, [token]);

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, unit: 'pcs' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    const list = [...items];
    list.splice(index, 1);
    setItems(list);
  };

  const handleItemChange = (index, field, value) => {
    const list = [...items];
    list[index][field] = value;
    setItems(list);
  };

  const handleAddVendorTag = (e) => {
    const vendorId = e.target.value;
    if (!vendorId) return;

    const vendorObj = approvedVendors.find(v => v.userId?._id === vendorId);
    if (vendorObj && !assignedVendors.some(v => v.id === vendorId)) {
      setAssignedVendors([...assignedVendors, { id: vendorId, name: vendorObj.companyName }]);
    }
    // Reset select
    e.target.value = '';
  };

  const handleRemoveVendorTag = (vendorId) => {
    setAssignedVendors(assignedVendors.filter(v => v.id !== vendorId));
  };

  const handleFormSubmit = async (e, rfqStatus = 'open') => {
    e.preventDefault();

    if (!title || !deadline) {
      setError('Title and Deadline are required fields');
      return;
    }

    // Validate Items
    const emptyItems = items.some(item => !item.name.trim() || item.quantity <= 0);
    if (emptyItems) {
      setError('Please specify valid names and quantities for all item lines');
      return;
    }

    if (assignedVendors.length === 0) {
      setError('Please assign at least one vendor partner');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const payload = {
        title,
        description,
        items,
        deadline,
        assignedVendors: assignedVendors.map(v => v.id),
        status: rfqStatus
      };

      const res = await authFetch('/rfq', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(rfqStatus === 'draft' ? 'RFQ saved successfully as draft!' : 'RFQ successfully created and sent to vendors!');
        setTimeout(() => {
          navigate('/rfqs');
        }, 1500);
      } else {
        setError(data.message || 'Failed to submit RFQ');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <Navbar title="VendorBridge" />

      <div className="rfq-create-layout animate-fade-in">
        
        {message && <div className="auth-alert alert-success">{message}</div>}
        {error && <div className="auth-alert alert-error">{error}</div>}

        <div className="rfq-create-card-wrapper glass-panel">
          
          {/* Visual Naming Headers */}
          <div className="rfq-form-title-block">
            <h2>Create RFQ's</h2>
            <p>new request for quotation</p>
          </div>

          {/* Visual Step Progress indicator */}
          <div className="steps-indicator-visual no-print">
            <div className="indicator-step done">
              <span className="step-num">1</span>
              <span className="step-lbl">Define Request</span>
            </div>
            <div className="indicator-divider"></div>
            <div className="indicator-step">
              <span className="step-num">2</span>
              <span className="step-lbl">Assign Bidders</span>
            </div>
            <div className="indicator-divider"></div>
            <div className="indicator-step">
              <span className="step-num">3</span>
              <span className="step-lbl">Publish Bid</span>
            </div>
          </div>

          <form className="rfq-sketched-form">
            <div className="form-sketched-columns">
              
              {/* Left Form: Fields */}
              <div className="form-fields-column-sketched">
                
                <div className="form-group">
                  <label className="form-label">RFQ's title*</label>
                  <input 
                    type="text"
                    placeholder="e.g. Office Furniture procurement Q2"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input 
                    type="text"
                    placeholder="e.g. Furniture"
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deadline*</label>
                  <input 
                    type="date"
                    className="form-input"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-textarea"
                    rows={4}
                    placeholder="e.g. Ergonomic chairs and standing desks for 3rd floor"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                {/* Left Form Bottom: Buttons */}
                <div className="form-submit-buttons-row-sketched no-print">
                  <button 
                    type="button" 
                    onClick={(e) => handleFormSubmit(e, 'open')}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    <span>Save & Send To Vendors</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={(e) => handleFormSubmit(e, 'draft')}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    <span>Save as Draft</span>
                  </button>
                </div>

              </div>

              {/* Right Form: Line items and vendors list */}
              <div className="form-visual-column-sketched">
                
                {/* Line Items checklist table */}
                <div className="sketched-items-card">
                  <div className="card-header-inner">
                    <h4>Line Items</h4>
                    <button type="button" onClick={handleAddItem} className="btn btn-secondary text-xs btn-add-mini">
                      + add line item
                    </button>
                  </div>

                  <div className="table-container mini-items-table">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Unit</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <input 
                                type="text"
                                className="inline-table-input item-name"
                                value={item.name}
                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                placeholder="Item name"
                                required
                              />
                            </td>
                            <td>
                              <input 
                                type="number"
                                className="inline-table-input qty"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                required
                              />
                            </td>
                            <td>
                              <select 
                                className="inline-table-select"
                                value={item.unit}
                                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                              >
                                <option value="pcs">pcs</option>
                                <option value="sets">sets</option>
                                <option value="boxes">boxes</option>
                              </select>
                            </td>
                            <td>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveItem(index)}
                                className="btn-table-delete"
                                disabled={items.length === 1}
                              >
                                <X size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Assign Vendors visual tags and selector */}
                <div className="sketched-vendors-assignment-card mt-4">
                  <h4>Assign Vendors</h4>
                  
                  {/* Removable Bidders tags */}
                  <div className="assigned-vendor-capsules-box">
                    {assignedVendors.length === 0 ? (
                      <span className="no-assigned-hint">No vendors assigned yet</span>
                    ) : (
                      assignedVendors.map(vendor => (
                        <span key={vendor.id} className="vendor-pill-tag">
                          <span>{vendor.name}</span>
                          <button type="button" onClick={() => handleRemoveVendorTag(vendor.id)} className="pill-remove-btn">
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add vendor dropdown selector */}
                  {vendorsLoading ? (
                    <div className="text-xs">Loading approved vendors list...</div>
                  ) : (
                    <div className="select-vendor-adder-box">
                      <select onChange={handleAddVendorTag} className="form-select select-mini" defaultValue="">
                        <option value="" disabled>+ add vendor</option>
                        {approvedVendors.map(v => (
                          <option 
                            key={v.userId?._id} 
                            value={v.userId?._id}
                            disabled={assignedVendors.some(a => a.id === v.userId?._id)}
                          >
                            {v.companyName} ({v.category})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Drag and Drop Mockup Attachment section */}
                <div className="sketched-attachments-card mt-4 no-print">
                  <h4>Attachments</h4>
                  <div className="drag-drop-visual-zone">
                    <UploadCloud size={24} className="upload-icon" />
                    <span className="upload-text">Drag & drop files or click to upload</span>
                  </div>
                </div>

              </div>

            </div>
          </form>

        </div>

      </div>
    </div>
  );
};

export default RFQCreate;
