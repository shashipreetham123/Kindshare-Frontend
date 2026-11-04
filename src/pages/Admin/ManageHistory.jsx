import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Calendar,
  RotateCcw,
  User,
  Shield,
  FileText,
  Clock,
  Loader2,
  X,
  ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import './ManageHistory.css';

function ManageHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUsername = searchParams.get('username') || '';

  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [usernameFilter, setUsernameFilter] = useState(initialUsername);
  const [eventFilter, setEventFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const u = searchParams.get('username') || '';
    if (u !== usernameFilter) {
      setUsernameFilter(u);
    }
  }, [searchParams]);

  const fetchGlobalHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (usernameFilter.trim()) {
        params.username = usernameFilter.trim();
      }
      if (eventFilter && eventFilter !== 'all') {
        params.event = eventFilter;
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const res = await api.get('/admin/history', { params });
      setHistoryList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch admin audit history:', err);
      setError(err.message || 'Failed to fetch global system audit history');
    } finally {
      setLoading(false);
    }
  }, [usernameFilter, eventFilter, startDate, endDate]);

  useEffect(() => {
    fetchGlobalHistory();
  }, [fetchGlobalHistory]);

  const handleResetFilters = () => {
    setUsernameFilter('');
    setEventFilter('all');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setSearchParams({});
  };

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return historyList;
    const q = searchQuery.toLowerCase().trim();
    return historyList.filter(
      (item) =>
        (item.username && item.username.toLowerCase().includes(q)) ||
        (item.event && item.event.toLowerCase().includes(q)) ||
        (item.summaryShort && item.summaryShort.toLowerCase().includes(q)) ||
        (item.summaryLong && item.summaryLong.toLowerCase().includes(q))
    );
  }, [historyList, searchQuery]);

  const getEventBadgeClass = (eventName = '') => {
    const ev = eventName.toLowerCase();
    if (ev.includes('admin')) return 'admin-event';
    if (ev.includes('product')) return 'product-event';
    if (ev.includes('request')) return 'request-event';
    if (ev.includes('reserve')) return 'reserve-event';
    return 'generic-event';
  };

  return (
    <div className="admin-history-container">
      <header className="admin-history-header">
        <div className="header-left-group">
          <div className="header-icon-wrap history-theme">
            <History size={26} />
          </div>
          <div>
            <h1>Global Audit & Activity Log</h1>
            <p className="header-subtitle">
              System-wide audit trail of listings, requests, completions, and administrative events
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={fetchGlobalHistory}
            title="Refresh logs"
          >
            <RotateCcw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <div className="history-filters-card">
        <div className="filters-row">
          <div className="filter-input-wrap">
            <Search size={16} className="filter-icon" />
            <input
              type="text"
              placeholder="Search audit descriptions, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-field-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-input-wrap">
            <User size={16} className="filter-icon" />
            <input
              type="text"
              placeholder="Filter by target username..."
              value={usernameFilter}
              onChange={(e) => {
                setUsernameFilter(e.target.value);
                if (e.target.value) {
                  setSearchParams({ username: e.target.value });
                } else {
                  setSearchParams({});
                }
              }}
            />
            {usernameFilter && (
              <button
                type="button"
                className="clear-field-btn"
                onClick={() => {
                  setUsernameFilter('');
                  setSearchParams({});
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-input-wrap" style={{ flex: '0 1 200px' }}>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            >
              <option value="all">All Event Types</option>
              <option value="admin">Admin Actions</option>
              <option value="product">Product Events</option>
              <option value="request">Request Events</option>
              <option value="reserve">Reserve Events</option>
            </select>
          </div>
        </div>

        <div className="filters-row" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="date-filter-group">
              <span>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="date-filter-group">
              <span>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className="btn-reset-filters"
            onClick={handleResetFilters}
          >
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Member</th>
              <th>Action / Event</th>
              <th>Activity Description</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="admin-loading-row">
                  <Loader2 size={32} className="spinner-icon" />
                  <p style={{ marginTop: '0.5rem' }}>Loading audit records...</p>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="admin-empty-row" style={{ color: '#dc2626' }}>
                  <p>{error}</p>
                </td>
              </tr>
            ) : filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={4} className="admin-empty-row">
                  <History size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                  <p>No audit log entries found matching criteria.</p>
                </td>
              </tr>
            ) : (
              filteredHistory.map((entry, index) => {
                const dateObj = entry.date ? new Date(entry.date) : new Date();
                return (
                  <tr key={entry._id || index}>
                    <td>
                      <div className="history-date-col">
                        <span className="history-date-primary">
                          {dateObj.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span>
                          {dateObj.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="user-link-pill"
                        onClick={() => {
                          setUsernameFilter(entry.username);
                          setSearchParams({ username: entry.username });
                        }}
                        style={{ cursor: 'pointer' }}
                        title={`Filter logs for @${entry.username}`}
                      >
                        <User size={13} />
                        @{entry.username}
                      </span>
                    </td>
                    <td>
                      <span className={`event-badge ${getEventBadgeClass(entry.event)}`}>
                        {entry.event}
                      </span>
                    </td>
                    <td>
                      <div className="history-summary-short">{entry.summaryShort}</div>
                      {entry.summaryLong && entry.summaryLong !== entry.summaryShort && (
                        <div className="history-summary-long">{entry.summaryLong}</div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageHistory;
