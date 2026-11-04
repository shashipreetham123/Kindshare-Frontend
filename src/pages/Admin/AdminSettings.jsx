import { useOutletContext } from 'react-router-dom';
import { Settings, ShieldCheck, KeyRound } from 'lucide-react';
import ChangePasswordCard from '../../components/ChangePasswordCard';
import './ManageUsers.css';

function AdminSettings() {
  const context = useOutletContext() || {};
  const { user } = context;

  return (
    <div className="admin-users-container" style={{ maxWidth: '900px' }}>
      <header className="admin-users-header">
        <div className="header-left-group">
          <div className="header-icon-wrap" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
            <Settings size={26} />
          </div>
          <div>
            <h1>Admin Account Settings</h1>
            <p className="header-subtitle">
              Review root administrator credentials, system configuration, and privileges
            </p>
          </div>
        </div>
      </header>

      <div className="settings-card">
        <h3 className="settings-section-title">
          <ShieldCheck size={20} color="#4f46e5" />
          <span>Administrator Profile Information</span>
        </h3>

        {user ? (
          <div className="profile-fields-grid">
            <div className="form-field-group">
              <label>Administrator Username</label>
              <input type="text" value={user.username || ''} disabled className="disabled-field-input" />
            </div>

            <div className="form-field-group">
              <label>Role</label>
              <input type="text" value="System Administrator" disabled className="disabled-field-input" />
            </div>

            <div className="form-field-group">
              <label>Email Address</label>
              <input type="email" value={user.email || 'admin@kindshare.org'} disabled className="disabled-field-input" />
            </div>

            <div className="form-field-group">
              <label>Account Type</label>
              <input type="text" value={user.type || 'organization'} disabled className="disabled-field-input" />
            </div>

            <div className="form-field-group form-full-width">
              <label>Registered Headquarters / Address</label>
              <input type="text" value={user.address || 'KindShare System HQ'} disabled className="disabled-field-input" />
            </div>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}

        <div className="admin-security-note">
          <h4 className="admin-security-title">
            <KeyRound size={17} color="#6366f1" />
            <span>Root Administrator Security</span>
          </h4>
          <p className="admin-security-desc">
            You are operating with full administrative security rights. All administrative actions (user creations, verifications, delistings, and terminations) are signed and recorded automatically in the KindShare Global Audit Ledger.
          </p>
        </div>
      </div>

      <ChangePasswordCard />
    </div>
  );
}

export default AdminSettings;
