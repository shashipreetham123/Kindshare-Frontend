import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Search,
  RotateCcw,
  CheckCircle,
  XCircle,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Filter,
  Loader2,
  X,
  AlertTriangle,
  History,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import './ManageUsers.css';

function ManageUsers() {
  const context = useOutletContext() || {};
  const { user: currentUser } = context;
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verifyFilter, setVerifyFilter] = useState('all');

  const [feedback, setFeedback] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    type: 'individual',
    countryCode: '+1',
    phoneNumber: '',
    address: '',
    email: '',
    isAdmin: false,
    verified: false
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/user');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch registered users' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const stats = useMemo(() => {
    const total = users.length;
    const verified = users.filter((u) => u.verified).length;
    const unverified = total - verified;
    const admins = users.filter((u) => u.isAdmin).length;
    return { total, verified, unverified, admins };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        (u.username && u.username.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.phoneNumber && u.phoneNumber.includes(term)) ||
        (u.address && u.address.toLowerCase().includes(term));

      const matchRole =
        roleFilter === 'all'
          ? true
          : roleFilter === 'admin'
          ? u.isAdmin
          : !u.isAdmin;

      const matchVerify =
        verifyFilter === 'all'
          ? true
          : verifyFilter === 'verified'
          ? u.verified
          : !u.verified;

      return matchSearch && matchRole && matchVerify;
    });
  }, [users, searchTerm, roleFilter, verifyFilter]);

  const handleToggleVerification = async (targetUser) => {
    const newStatus = !targetUser.verified;
    try {
      await api.put(`/admin/user/${targetUser.username}/verify`, { verified: newStatus });
      setUsers((prev) =>
        prev.map((u) =>
          u.username === targetUser.username ? { ...u, verified: newStatus } : u
        )
      );
      setFeedback({
        type: 'success',
        message: `User @${targetUser.username} is now ${newStatus ? 'Verified' : 'Unverified'}.`
      });
    } catch (err) {
      console.error('Verification toggle error:', err);
      setFeedback({
        type: 'error',
        message: err.message || `Failed to update verification for @${targetUser.username}`
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await api.post('/admin/user', formData);
      setFeedback({
        type: 'success',
        message: `User account @${formData.username} created successfully!`
      });
      setIsCreateOpen(false);
      setFormData({
        username: '',
        password: '',
        type: 'individual',
        countryCode: '+1',
        phoneNumber: '',
        address: '',
        email: '',
        isAdmin: false,
        verified: false
      });
      fetchUsers();
    } catch (err) {
      console.error('Create user error:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to create user. Please check form validation.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/user/${deleteTarget.username}`);
      setUsers((prev) => prev.filter((u) => u.username !== deleteTarget.username));
      setFeedback({
        type: 'success',
        message: `User @${deleteTarget.username} and their active items/requests were deleted.`
      });
      setDeleteTarget(null);
      setDeleteConfirmInput('');
    } catch (err) {
      console.error('Delete user error:', err);
      setFeedback({
        type: 'error',
        message: err.message || `Failed to delete user @${deleteTarget.username}`
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-users-container">
      <header className="admin-users-header">
        <div className="header-left-group">
          <div className="header-icon-wrap">
            <Users size={26} />
          </div>
          <div>
            <h1>User Management</h1>
            <p className="header-subtitle">
              Manage platform members, assign administrator privileges, and toggle verification
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={fetchUsers}
            title="Refresh list"
          >
            <RotateCcw size={16} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <UserPlus size={16} />
            <span>Create New User</span>
          </button>
        </div>
      </header>

      {feedback && (
        <div className={`admin-alert-banner alert-${feedback.type}`}>
          <div className="alert-left">
            {feedback.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            className="alert-dismiss-btn"
            onClick={() => setFeedback(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="admin-stats-row">
        <div className="stat-card">
          <div className="stat-icon total">
            <Users size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Registered</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon verified">
            <UserCheck size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.verified}</div>
            <div className="stat-label">Verified Members</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon unverified">
            <UserX size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.unverified}</div>
            <div className="stat-label">Unverified Members</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon admins">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.admins}</div>
            <div className="stat-label">Admin Accounts</div>
          </div>
        </div>
      </div>

      <div className="users-toolbar-card">
        <div className="search-field-wrap">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search by username, email, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="filters-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="user">Standard Users Only</option>
          </select>

          <select
            value={verifyFilter}
            onChange={(e) => setVerifyFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Verification</th>
              <th>Contact Details</th>
              <th>Address</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="admin-loading-row">
                  <Loader2 size={32} className="spinner-icon" />
                  <p style={{ marginTop: '0.5rem' }}>Loading platform users...</p>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-empty-row">
                  <Users size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                  <p>No user accounts found matching your filters.</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((item) => {
                const isSelf = currentUser && currentUser.username === item.username;
                return (
                  <tr key={item.username}>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatar-circle">
                          {item.username ? item.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="user-names-col">
                          <span className="user-username">@{item.username}</span>
                          <span className="user-type-tag">{item.type || 'individual'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {item.isAdmin ? (
                        <span className="badge-role-admin">
                          <ShieldCheck size={13} /> Admin
                        </span>
                      ) : (
                        <span className="badge-role-user">User</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`status-badge-btn ${item.verified ? 'verified' : 'unverified'}`}
                        onClick={() => handleToggleVerification(item)}
                        title={`Click to ${item.verified ? 'revoke' : 'grant'} verification`}
                      >
                        {item.verified ? (
                          <>
                            <CheckCircle size={13} /> Verified
                          </>
                        ) : (
                          <>
                            <XCircle size={13} /> Unverified
                          </>
                        )}
                      </button>
                    </td>
                    <td>
                      <div className="contact-info-cell">
                        {item.email && (
                          <div className="contact-item" title={item.email}>
                            <Mail size={13} /> {item.email}
                          </div>
                        )}
                        {item.phoneNumber && (
                          <div className="contact-item">
                            <Phone size={13} /> {item.countryCode ? `${item.countryCode} ` : ''}{item.phoneNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="contact-item" title={item.address || 'No address provided'}>
                        <MapPin size={13} />
                        <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.address || '—'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="row-actions-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-action-icon"
                          onClick={() => navigate(`/dashboard/history?username=${item.username}`)}
                          title={`View audit history for @${item.username}`}
                        >
                          <History size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-action-icon danger"
                          onClick={() => {
                            setDeleteTarget(item);
                            setDeleteConfirmInput('');
                          }}
                          disabled={isSelf}
                          title={isSelf ? 'You cannot delete your own account' : `Delete @${item.username}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New User Account"
        size="large"
      >
        <form onSubmit={handleCreateUser} className="user-form-grid">
          <div className="form-field-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              placeholder="e.g. foodbank_east"
              value={formData.username}
              onChange={handleFormChange}
              required
              minLength={4}
              maxLength={20}
            />
          </div>

          <div className="form-field-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Min 4 characters"
              value={formData.password}
              onChange={handleFormChange}
              required
              minLength={4}
            />
          </div>

          <div className="form-field-group">
            <label>User Type *</label>
            <select name="type" value={formData.type} onChange={handleFormChange} required>
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div className="form-field-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="contact@kindshare.org"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-field-group">
            <label>Country Code *</label>
            <input
              type="text"
              name="countryCode"
              placeholder="+1 or 91"
              value={formData.countryCode}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-field-group">
            <label>Phone Number *</label>
            <input
              type="text"
              name="phoneNumber"
              placeholder="7 to 15 digits"
              value={formData.phoneNumber}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-field-group form-full-width">
            <label>Address *</label>
            <input
              type="text"
              name="address"
              placeholder="Physical street address or city/state"
              value={formData.address}
              onChange={handleFormChange}
              required
              minLength={5}
            />
          </div>

          <div className="form-full-width" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            <label className="checkbox-row">
              <input
                type="checkbox"
                name="isAdmin"
                checked={formData.isAdmin}
                onChange={handleFormChange}
              />
              <span>Grant Full Administrator Privileges</span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="verified"
                checked={formData.verified}
                onChange={handleFormChange}
              />
              <span>Mark as Verified Member</span>
            </label>
          </div>

          <div className="form-full-width" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating User...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm User Deletion"
        size="medium"
      >
        {deleteTarget && (
          <div>
            <div className="delete-warning-box">
              <AlertTriangle size={20} style={{ marginBottom: '0.35rem' }} />
              <p>
                <strong>Warning:</strong> Deleting account{' '}
                <span className="delete-target-name">@{deleteTarget.username}</span> will
                permanently remove all their listed products, pending requests, and active reservations.
              </p>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>
              To confirm deletion, please type the username{' '}
              <strong>{deleteTarget.username}</strong> below:
            </p>
            <input
              type="text"
              className="confirm-delete-input"
              placeholder={deleteTarget.username}
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ backgroundColor: '#dc2626', borderColor: '#b91c1c' }}
                disabled={deleteConfirmInput !== deleteTarget.username || isDeleting}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete User'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ManageUsers;
