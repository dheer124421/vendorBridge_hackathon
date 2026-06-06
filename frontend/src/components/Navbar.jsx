import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Bell, Calendar, User as UserIcon } from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = ({ title }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Fetch logs to simulate notifications based on role
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        let alerts = [];
        if (user.role === 'vendor') {
          alerts = [
            { id: 1, text: `You have new RFQ assignments awaiting quotation.`, time: 'Just now' },
            { id: 2, text: `Quotation status updated. Check My Quotations.`, time: '1 hour ago' }
          ];
        } else if (user.role === 'manager') {
          alerts = [
            { id: 1, text: `Quotation is pending approval: Laptops Purchase.`, time: 'Just now' }
          ];
        } else {
          // Officer or Admin
          alerts = [
            { id: 1, text: `New quotation submitted for Office Laptops.`, time: '5 mins ago' },
            { id: 2, text: `Vendor "Tech Solutions Inc" is approved.`, time: '30 mins ago' },
            { id: 3, text: `Quotation approved. PO generation pending.`, time: '2 hours ago' }
          ];
        }
        setNotifications(alerts);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
  }, [token, user]);

  const getTodayDate = () => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header className="navbar-container glass-panel no-print">
      <div className="navbar-left">
        <h2 className="navbar-title">{title}</h2>
      </div>

      <div className="navbar-right">
        <div className="date-indicator">
          <Calendar size={16} />
          <span>{getTodayDate()}</span>
        </div>

        <div className="notification-bell-box">
          <button 
            className="navbar-icon-btn" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="bell-badge"></span>}
          </button>

          {showDropdown && (
            <div className="notifications-dropdown glass-panel animate-fade-in">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <span className="badge badge-info">{notifications.length} New</span>
              </div>
              <div className="dropdown-body">
                {notifications.length === 0 ? (
                  <p className="no-notifications">No new notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="notification-item">
                      <div className="item-dot"></div>
                      <div className="item-content">
                        <p>{n.text}</p>
                        <span>{n.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="navbar-user-tag">
          <div className="user-avatar-small">
            <UserIcon size={16} />
          </div>
          <span>{user?.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
