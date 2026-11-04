import { useOutletContext } from 'react-router-dom';
import { Settings, User } from 'lucide-react';
import ChangePasswordCard from '../../components/ChangePasswordCard';
import '../Admin/ManageUsers.css';

function UserSettings() {
  const context = useOutletContext() || {};
  const { user } = context;

  return (
    <div className="admin-users-container" style={{ maxWidth: '850px' }}>
      <header className="admin-users-header">
        <div className="header-left-group">
          <div className="header-icon-wrap" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Settings size={26} />
          </div>
          <div>
            <h1>Account Settings</h1>
            <p className="header-subtitle">
              Manage your personal profile information and security credentials
            </p>
          </div>
        </div>
      </header>

      <div className="settings-card">
        <h3 className="settings-section-title">
          <User size={20} color="#2563eb" />
          <span>Profile Details</span>
        </h3>

        {user ? (
          <div className="profile-fields-grid">
            <div className="form-field-group">
              <label>Username</label>
              <input type="text" value={`@${user.username || ''}`} disabled className="disabled-field-input" />
            </div>

            <div className="form-field-group">
              <label>Account Type</label>
              <input type="text" value={user.type || 'Individual'} disabled className="disabled-field-input" style={{ textTransform: 'capitalize' }} />
            </div>

            <div className="form-field-group">
              <label>Email Address</label>
              <input type="email" value={user.email || '—'} disabled className="disabled-field-input" />
            </div>

            <div className="form-field-group">
              <label>Phone Number</label>
              <input type="text" value={user.phoneNumber ? `${user.countryCode ? user.countryCode + ' ' : ''}${user.phoneNumber}` : '—'} disabled className="disabled-field-input" />
            </div>

            <div className="form-field-group form-full-width">
              <label>Registered Address</label>
              <input type="text" value={user.address || '—'} disabled className="disabled-field-input" />
            </div>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>

      <ChangePasswordCard />
    </div>
  );
}

export default UserSettings;
