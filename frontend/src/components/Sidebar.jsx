import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FilePlus, 
  FileText, 
  ClipboardList, 
  CheckSquare, 
  Receipt, 
  History, 
  LogOut, 
  ShieldCheck, 
  Boxes 
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <span className="role-badge admin">Admin</span>;
      case 'officer': return <span className="role-badge officer">Procurement</span>;
      case 'manager': return <span className="role-badge manager">Approver</span>;
      case 'vendor': return <span className="role-badge vendor">Vendor</span>;
      default: return null;
    }
  };

  return (
    <aside className="sidebar-container glass-panel no-print">
      <div className="sidebar-header">
        <div className="logo-box">
          <ShieldCheck className="logo-icon" size={28} />
          <span className="logo-text">Vendor<span>Bridge</span></span>
        </div>
        <div className="user-profile-summary">
          <div className="avatar-circle">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info-text">
            <h4 className="user-name">{user.name}</h4>
            {getRoleBadge(user.role)}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {/* Admin Navigation */}
        {user.role === 'admin' && (
          <>
            <NavLink to="/vendors" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>Vendor Registry</span>
            </NavLink>
            <NavLink to="/logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <History size={20} />
              <span>System Logs</span>
            </NavLink>
          </>
        )}

        {/* Procurement Officer Navigation */}
        {user.role === 'officer' && (
          <>
            <NavLink to="/rfqs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ClipboardList size={20} />
              <span>RFQs List</span>
            </NavLink>
            <NavLink to="/rfqs/create" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FilePlus size={20} />
              <span>Create RFQ</span>
            </NavLink>
            <NavLink to="/vendors" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>Vendors</span>
            </NavLink>
            <NavLink to="/pos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={20} />
              <span>Purchase Orders</span>
            </NavLink>
            <NavLink to="/invoices" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Receipt size={20} />
              <span>Invoices</span>
            </NavLink>
            <NavLink to="/logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <History size={20} />
              <span>Activity Logs</span>
            </NavLink>
          </>
        )}

        {/* Manager/Approver Navigation */}
        {user.role === 'manager' && (
          <>
            <NavLink to="/approvals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <CheckSquare size={20} />
              <span>Pending Approvals</span>
            </NavLink>
            <NavLink to="/logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <History size={20} />
              <span>Procurement Logs</span>
            </NavLink>
          </>
        )}

        {/* Vendor Navigation */}
        {user.role === 'vendor' && (
          <>
            <NavLink to="/rfqs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ClipboardList size={20} />
              <span>Assigned RFQs</span>
            </NavLink>
            <NavLink to="/vendor/quotations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Boxes size={20} />
              <span>My Quotations</span>
            </NavLink>
            <NavLink to="/pos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={20} />
              <span>Purchase Orders</span>
            </NavLink>
            <NavLink to="/invoices" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Receipt size={20} />
              <span>My Invoices</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
