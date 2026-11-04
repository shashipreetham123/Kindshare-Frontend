import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  BookmarkCheck,
  Search,
  RotateCcw,
  CheckCircle,
  Clock,
  User,
  Package,
  Layers,
  Loader2,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import './ManageUsers.css';

function ManageRequestsReserves() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [reserves, setReserves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, resRes] = await Promise.all([
        api.get('/admin/request'),
        api.get('/admin/reserve')
      ]);
      setRequests(reqRes.data || []);
      setReserves(resRes.data || []);
    } catch (err) {
      console.error('Failed to fetch requests/reserves:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRequests = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return requests;
    return requests.filter(
      (r) =>
        (r.donorUsername && r.donorUsername.toLowerCase().includes(q)) ||
        (r.beneficiaryUsername && r.beneficiaryUsername.toLowerCase().includes(q)) ||
        (r.note && r.note.toLowerCase().includes(q)) ||
        (r.productId && String(r.productId).toLowerCase().includes(q))
    );
  }, [requests, searchTerm]);

  const filteredReserves = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return reserves;
    return reserves.filter(
      (r) =>
        (r.donorUsername && r.donorUsername.toLowerCase().includes(q)) ||
        (r.beneficiaryUsername && r.beneficiaryUsername.toLowerCase().includes(q)) ||
        (r.pickupNotes && r.pickupNotes.toLowerCase().includes(q)) ||
        (r.productId && String(r.productId).toLowerCase().includes(q))
    );
  }, [reserves, searchTerm]);

  return (
    <div className="admin-users-container">
      <header className="admin-users-header">
        <div className="header-left-group">
          <div className="header-icon-wrap" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
            {activeTab === 'requests' ? <Inbox size={26} /> : <BookmarkCheck size={26} />}
          </div>
          <div>
            <h1>Platform Transactions & Reservations</h1>
            <p className="header-subtitle">
              Inspect all beneficiary allocation requests and active community reserves in real time
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={fetchData}
            title="Refresh transactions"
          >
            <RotateCcw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <div className="admin-tab-nav">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`admin-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
        >
          <Inbox size={17} />
          <span>Active Requests ({requests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reserves')}
          className={`admin-tab-btn ${activeTab === 'reserves' ? 'active' : ''}`}
        >
          <BookmarkCheck size={17} />
          <span>Active Reserves ({reserves.length})</span>
        </button>
      </div>

      <div className="users-toolbar-card">
        <div className="search-field-wrap">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search by donor, beneficiary, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table-container">
        {activeTab === 'requests' ? (
          <table className="users-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Donor</th>
                <th>Beneficiary</th>
                <th>Requested Qty</th>
                <th>Request Date</th>
                <th>Message / Note</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="admin-loading-row">
                    <Loader2 size={32} className="spinner-icon" />
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty-row">
                    <Inbox size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                    <p>No active requests found.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r, i) => (
                  <tr key={r._id || i}>
                    <td>
                      <code>{String(r.productId).slice(-8)}</code>
                    </td>
                    <td>
                      <span className="user-username">@{r.donorUsername}</span>
                    </td>
                    <td>
                      <span className="user-username">@{r.beneficiaryUsername}</span>
                    </td>
                    <td>
                      <strong>{r.quantity}</strong> item(s)
                    </td>
                    <td>
                      {r.requestedOn ? new Date(r.requestedOn).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                        {r.note || r.beneficiaryNote || 'No note attached'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Donor</th>
                <th>Beneficiary</th>
                <th>Reserved Qty</th>
                <th>Reserved Date</th>
                <th>Handoff Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="admin-loading-row">
                    <Loader2 size={32} className="spinner-icon" />
                  </td>
                </tr>
              ) : filteredReserves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty-row">
                    <BookmarkCheck size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                    <p>No active reservations found.</p>
                  </td>
                </tr>
              ) : (
                filteredReserves.map((r, i) => (
                  <tr key={r._id || i}>
                    <td>
                      <code>{String(r.productId).slice(-8)}</code>
                    </td>
                    <td>
                      <span className="user-username">@{r.donorUsername}</span>
                    </td>
                    <td>
                      <span className="user-username">@{r.beneficiaryUsername}</span>
                    </td>
                    <td>
                      <strong>{r.quantity}</strong> item(s)
                    </td>
                    <td>
                      {r.reservedOn ? new Date(r.reservedOn).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span>Donor Confirmed: {r.donorCompleted ? '✅ Yes' : '⏳ Pending'}</span>
                        <span>Beneficiary Confirmed: {r.beneficiaryCompleted ? '✅ Yes' : '⏳ Pending'}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageRequestsReserves;
