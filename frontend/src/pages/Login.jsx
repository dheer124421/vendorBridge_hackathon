import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User as UserIcon, Building2, Phone, MapPin, ReceiptText, Globe, Info } from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
  const { login, register, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration specific fields matching Screen 2
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('officer');
  const [country, setCountry] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('IT Solutions');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');

  const [formError, setFormError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please fill in username/email and password');
      return;
    }
    setFormError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName) {
      setFormError('First name, Last name, Email and Password are required');
      return;
    }

    setFormError('');
    setIsLoading(true);

    try {
      const payload = {
        name: `${firstName} ${lastName}`,
        email,
        password,
        role,
        companyName: role === 'vendor' ? companyName : `${firstName} Corp`,
        category,
        gstNumber: role === 'vendor' ? gstNumber : 'N/A',
        phone: phoneNumber,
        address: role === 'vendor' ? address : country,
        country,
        additionalInfo
      };
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setFormError('Email is required');
      return;
    }

    setFormError('');
    setIsLoading(true);

    try {
      const data = await forgotPassword(email);
      setInfoMessage(data.message);
      setIsForgot(false);
    } catch (err) {
      setFormError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="bg-gradient-glow"></div>
      
      <div className={`login-card glass-panel animate-fade-in ${isSignup ? 'signup-large' : ''}`}>
        <div className="login-header">
          <div className="photo-circle-placeholder">
            <span>Photo</span>
          </div>
          <div className="login-logo">
            <h1>Vendor<span>Bridge</span></h1>
          </div>
          <p className="login-subtitle">
            {isForgot 
              ? 'Forgot Password Verification' 
              : isSignup 
                ? 'Screen 2: Registration Form' 
                : 'Screen 1: Login Form'}
          </p>
        </div>

        {formError && <div className="auth-alert alert-error">{formError}</div>}
        {infoMessage && <div className="auth-alert alert-success">{infoMessage}</div>}

        {isForgot ? (
          <form onSubmit={handleForgotSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Send Reset Instructions'}
            </button>

            <div className="auth-footer">
              <button type="button" className="link-btn" onClick={() => setIsForgot(false)}>
                Back to Login Screen
              </button>
            </div>
          </form>
        ) : isSignup ? (
          <form onSubmit={handleSignupSubmit} className="auth-form">
            <div className="form-grid-double">
              
              <div className="form-group">
                <label className="form-label">First Name</label>
                <div className="input-with-icon">
                  <UserIcon size={18} className="input-icon" />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter first name" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <div className="input-with-icon">
                  <UserIcon size={18} className="input-icon" />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter last name" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="name@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="Contact number" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Role (Admin, officer, etc)</label>
                <select 
                  className="form-select" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="officer">Procurement Officer</option>
                  <option value="vendor">Vendor Partner</option>
                  <option value="manager">Manager / Approver</option>
                  <option value="admin">ERP System Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <div className="input-with-icon">
                  <Globe size={18} className="input-icon" />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Your country" 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              {role === 'vendor' ? (
                <div className="form-group">
                  <label className="form-label">Company Legal Name</label>
                  <div className="input-with-icon">
                    <Building2 size={18} className="input-icon" />
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Tech Solutions Ltd" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required 
                    />
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Vessel / Division</label>
                  <select 
                    className="form-select" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="IT Solutions">IT Solutions</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Construction">Construction</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
              )}

            </div>

            {role === 'vendor' && (
              <div className="vendor-extras animate-fade-in">
                <div className="form-grid-double">
                  <div className="form-group">
                    <label className="form-label">GSTIN Details</label>
                    <div className="input-with-icon">
                      <ReceiptText size={18} className="input-icon" />
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="29AAAAA1111A1Z1" 
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Vendor Category</label>
                    <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="IT Solutions">IT Solutions</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Construction">Construction</option>
                      <option value="Logistics">Logistics</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Office Address</label>
                  <textarea className="form-textarea" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address"></textarea>
                </div>
              </div>
            )}

            <div className="form-group full-width-textarea">
              <label className="form-label">Additional Information ....</label>
              <div className="input-with-icon">
                <Info size={18} className="input-icon textarea-icon" />
                <textarea 
                  className="form-textarea" 
                  rows={3} 
                  placeholder="Enter details..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </button>

            <div className="auth-footer">
              <p>Already registered? <button type="button" className="link-btn text-accent" onClick={() => setIsSignup(false)}>Sign In</button></p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Username (Email)</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="Enter email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <div className="flex-row-between">
                <label className="form-label">Password</label>
                <button type="button" className="link-btn text-xs text-muted" onClick={() => setIsForgot(true)}>
                  Forgot?
                </button>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Login Button'}
            </button>

            <div className="auth-footer">
              <p>New account? <button type="button" className="link-btn text-accent" onClick={() => setIsSignup(true)}>Register</button></p>
            </div>

            <div className="demo-accounts-hint">
              <h4>Hackathon Quick-Login:</h4>
              <p>Officer: <strong>officer@vendorbridge.com</strong> (Pass: <strong>password123</strong>)</p>
              <p>Vendor 1: <strong>vendor1@vendorbridge.com</strong></p>
              <p>Manager: <strong>manager@vendorbridge.com</strong></p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
