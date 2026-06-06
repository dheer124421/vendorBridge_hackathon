import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Pages Import
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VendorManagement from './pages/VendorManagement';
import RFQList from './pages/RFQList';
import RFQCreate from './pages/RFQCreate';
import RFQDetails from './pages/RFQDetails';
import QuotationSubmit from './pages/QuotationSubmit';
import VendorQuotations from './pages/VendorQuotations';
import ApprovalList from './pages/ApprovalList';
import POList from './pages/POList';
import InvoiceList from './pages/InvoiceList';
import SystemLogs from './pages/SystemLogs';

// Route protection component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Verifying ERP session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Layout wrapper
const LayoutWrapper = () => {
  const { user } = useAuth();
  
  return (
    <div className="app-container">
      {user && <Sidebar />}
      <div className={`main-content-layout-wrapper ${user ? 'with-sidebar' : 'full-width'}`}>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* Vendor Specific */}
          <Route path="/vendor/quotations" element={<ProtectedRoute allowedRoles={['vendor']}><VendorQuotations /></ProtectedRoute>} />
          
          {/* RFQ */}
          <Route path="/rfqs" element={<ProtectedRoute><RFQList /></ProtectedRoute>} />
          <Route path="/rfqs/create" element={<ProtectedRoute allowedRoles={['officer']}><RFQCreate /></ProtectedRoute>} />
          <Route path="/rfqs/:id" element={<ProtectedRoute><RFQDetails /></ProtectedRoute>} />
          <Route path="/rfqs/:id/quotation" element={<ProtectedRoute allowedRoles={['vendor']}><QuotationSubmit /></ProtectedRoute>} />
          
          {/* Vendor Management */}
          <Route path="/vendors" element={<ProtectedRoute allowedRoles={['admin', 'officer']}><VendorManagement /></ProtectedRoute>} />
          
          {/* Approvals */}
          <Route path="/approvals" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><ApprovalList /></ProtectedRoute>} />
          
          {/* Purchase Orders */}
          <Route path="/pos" element={<ProtectedRoute><POList /></ProtectedRoute>} />
          
          {/* Invoices */}
          <Route path="/invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
          
          {/* System Logs */}
          <Route path="/logs" element={<ProtectedRoute allowedRoles={['admin', 'officer', 'manager']}><SystemLogs /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app-main-root-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<LayoutWrapper />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
