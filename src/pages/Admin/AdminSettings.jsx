import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Settings,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  KeyRound
} from 'lucide-react';
import ChangePasswordCard from '../../components/ChangePasswordCard';
import './ManageUsers.css';

function AdminSettings() {
  const context = useOutletContext() || {};
  const { user } = context;
  const navigate = useNavigate();

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

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="#4f46e5" />
          <span>Administrator Profile Information</span>
        </h3>

        {user ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-field-group">
              <label>Administrator Username</label>
              <input type="text" value={user.username || ''} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
            </div>

            <div className="form-field-group">
              <label>Role</label>
              <input type="text" value="System Administrator" disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
            </div>

            <div className="form-field-group">
              <label>Email Address</label>
              <input type="email" value={user.email || 'admin@kindshare.org'} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
            </div>

            <div className="form-field-group">
              <label>Account Type</label>
              <input type="text" value={user.type || 'organization'} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
            </div>

            <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
              <label>Registered Headquarters / Address</label>
              <input type="text" value={user.address || 'KindShare System HQ'} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
            </div>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}

        <div style={{ marginTop: '2rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <KeyRound size={17} color="#6366f1" />
            <span>Root Administrator Security</span>
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            You are operating with full administrative security rights. All administrative actions (user creations, verifications, delistings, and terminations) are signed and recorded automatically in the KindShare Global Audit Ledger.
          </p>
        </div>
      </div>

      {/* Change Password Feature */}
      <ChangePasswordCard />
    </div>
  );
}

export default AdminSettings;

