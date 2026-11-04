import { useOutletContext } from 'react-router-dom';
import {
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ChangePasswordCard from '../../components/ChangePasswordCard';
import '../Admin/ManageUsers.css';

function UserSettings() {
  const context = useOutletContext() || {};
  const { user } = context;

  return (
    <div className="admin-users-container" style={{ maxWidth: '850px' }}>
      {/* Header */}
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

      {/* Profile Overview */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} color="#2563eb" />
          <span>Profile Details</span>
        </h3>

        {user ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div className="form-field-group">
              <label>Username</label>
              <input type="text" value={`@${user.username || ''}`} disabled style={{ backgroundColor: '#f8fafc', color: '#475569' }} />
            </div>

            <div className="form-field-group">
              <label>Account Type</label>
              <input type="text" value={user.type || 'Individual'} disabled style={{ backgroundColor: '#f8fafc', color: '#475569', textTransform: 'capitalize' }} />
            </div>

            <div className="form-field-group">
              <label>Email Address</label>
              <input type="email" value={user.email || '—'} disabled style={{ backgroundColor: '#f8fafc', color: '#475569' }} />
            </div>

            <div className="form-field-group">
              <label>Phone Number</label>
              <input type="text" value={user.phoneNumber ? `${user.countryCode ? user.countryCode + ' ' : ''}${user.phoneNumber}` : '—'} disabled style={{ backgroundColor: '#f8fafc', color: '#475569' }} />
            </div>

            <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
              <label>Registered Address</label>
              <input type="text" value={user.address || '—'} disabled style={{ backgroundColor: '#f8fafc', color: '#475569' }} />
            </div>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>

      {/* Change Password Component */}
      <ChangePasswordCard />
    </div>
  );
}

export default UserSettings;

