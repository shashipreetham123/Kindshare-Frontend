import { useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import './ChangePasswordCard.css';

function ChangePasswordCard() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!formData.oldPassword) {
      setFeedback({ type: 'error', message: 'Please enter your current (old) password.' });
      return;
    }

    if (!formData.newPassword) {
      setFeedback({ type: 'error', message: 'Please enter your new password.' });
      return;
    }

    if (formData.newPassword.length < 4) {
      setFeedback({ type: 'error', message: 'New password must be at least 4 characters.' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setFeedback({ type: 'error', message: 'New Password and Confirm New Password do not match.' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/user/change-password', formData);
      setFeedback({
        type: 'success',
        message: res.message || 'Password changed successfully!'
      });
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Change password error:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to change password. Please verify your old password.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-card">
      <div className="card-header-row">
        <div className="header-icon-badge">
          <KeyRound size={22} />
        </div>
        <div>
          <h3>Change Account Password</h3>
          <p className="card-subtitle">
            Update your account password by confirming your current credentials
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`password-feedback alert-${feedback.type}`}>
          <div className="feedback-content">
            {feedback.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="change-password-form">
        {/* Old Password */}
        <div className="input-group">
          <label htmlFor="old-password-input">Old Password *</label>
          <div className="password-input-wrapper">
            <Lock size={17} className="field-prefix-icon" />
            <input
              id="old-password-input"
              type={showOld ? 'text' : 'password'}
              name="oldPassword"
              placeholder="Enter current password"
              value={formData.oldPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-visibility-btn"
              onClick={() => setShowOld((prev) => !prev)}
              aria-label={showOld ? 'Hide old password' : 'Show old password'}
            >
              {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="input-group">
          <label htmlFor="new-password-input">New Password *</label>
          <div className="password-input-wrapper">
            <Lock size={17} className="field-prefix-icon" />
            <input
              id="new-password-input"
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              placeholder="At least 4 characters"
              value={formData.newPassword}
              onChange={handleChange}
              minLength={4}
              required
            />
            <button
              type="button"
              className="toggle-visibility-btn"
              onClick={() => setShowNew((prev) => !prev)}
              aria-label={showNew ? 'Hide new password' : 'Show new password'}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="input-group">
          <label htmlFor="confirm-password-input">Confirm New Password *</label>
          <div className="password-input-wrapper">
            <ShieldCheck size={17} className="field-prefix-icon" />
            <input
              id="confirm-password-input"
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Re-enter new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={4}
              required
            />
            <button
              type="button"
              className="toggle-visibility-btn"
              onClick={() => setShowConfirm((prev) => !prev)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-action-row">
          <button
            type="submit"
            className="btn-update-password"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="btn-spinner" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <KeyRound size={16} />
                <span>Update Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChangePasswordCard;

