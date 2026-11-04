import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  RotateCcw,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Loader2,
  X,
  User,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import './ManageProducts.css';
import './ManageUsers.css';

function ManageProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [usernameFilter, setUsernameFilter] = useState('');

  const [delistTarget, setDelistTarget] = useState(null);
  const [delistConfirmInput, setDelistConfirmInput] = useState('');
  const [isDelisting, setIsDelisting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/product?limit=200');
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch platform products' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p._id && p._id.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term));

      const uTerm = usernameFilter.toLowerCase().trim();
      const matchUser = !uTerm || (p.username && p.username.toLowerCase().includes(uTerm));

      return matchSearch && matchUser;
    });
  }, [products, searchTerm, usernameFilter]);

  const handleConfirmDelist = async () => {
    if (!delistTarget) return;
    setIsDelisting(true);
    const targetId = delistTarget._id || delistTarget.id;
    try {
      await api.delete(`/admin/product/${targetId}`);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== targetId));
      setFeedback({
        type: 'success',
        message: `Product "${delistTarget.name}" delisted and associated requests removed.`
      });
      setDelistTarget(null);
      setDelistConfirmInput('');
    } catch (err) {
      console.error('Delist product error:', err);
      setFeedback({
        type: 'error',
        message: err.message || `Failed to delist "${delistTarget.name}"`
      });
    } finally {
      setIsDelisting(false);
    }
  };

  return (
    <div className="admin-products-container">
      <header className="admin-products-header">
        <div className="header-left-group">
          <div className="header-icon-wrap product-theme">
            <Package size={26} />
          </div>
          <div>
            <h1>Listing Moderation</h1>
            <p className="header-subtitle">
              Inspect community listings, donor verification statuses, and moderate or delist items
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={fetchProducts}
            title="Refresh listings"
          >
            <RotateCcw size={16} />
            <span>Refresh</span>
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

      <div className="users-toolbar-card">
        <div className="search-field-wrap">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search by product name, ID, or description..."
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

        <div className="filter-input-wrap" style={{ flex: '0 1 240px' }}>
          <User size={16} className="filter-icon" />
          <input
            type="text"
            placeholder="Filter by donor username..."
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Donor</th>
              <th>Donor Status</th>
              <th>Quantity Available</th>
              <th>Listed Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="admin-loading-row">
                  <Loader2 size={32} className="spinner-icon" />
                  <p style={{ marginTop: '0.5rem' }}>Loading community listings...</p>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-empty-row">
                  <Package size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                  <p>No products found matching moderation criteria.</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const prodId = p._id || p.id;
                const dateObj = p.listedAt || p.createdAt ? new Date(p.listedAt || p.createdAt) : null;
                return (
                  <tr key={prodId}>
                    <td>
                      <div className="prod-cell">
                        {p.coverImage ? (
                          <img
                            src={p.coverImage}
                            alt={p.name}
                            className="prod-thumbnail"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="prod-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={20} color="#94a3b8" />
                          </div>
                        )}
                        <div>
                          <div className="prod-title">{p.name}</div>
                          <div className="prod-desc-sub">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="user-username">@{p.username}</span>
                    </td>
                    <td>
                      {p.verified ? (
                        <span className="status-badge-btn verified" style={{ cursor: 'default' }}>
                          <CheckCircle size={13} /> Verified
                        </span>
                      ) : (
                        <span className="status-badge-btn unverified" style={{ cursor: 'default' }}>
                          <XCircle size={13} /> Unverified
                        </span>
                      )}
                    </td>
                    <td>
                      <strong>{p.quantity !== undefined ? p.quantity : p.available}</strong> in stock
                    </td>
                    <td>
                      {dateObj ? dateObj.toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div className="row-actions-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-action-icon"
                          onClick={() => navigate(`/dashboard/product/${prodId}`, { state: { product: p } })}
                          title="View public product page"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-action-icon danger"
                          onClick={() => {
                            setDelistTarget(p);
                            setDelistConfirmInput('');
                          }}
                          title={`Delist "${p.name}"`}
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
        isOpen={Boolean(delistTarget)}
        onClose={() => setDelistTarget(null)}
        title="Confirm Product Delisting"
        size="medium"
      >
        {delistTarget && (
          <div>
            <div className="delete-warning-box">
              <AlertTriangle size={20} style={{ marginBottom: '0.35rem' }} />
              <p>
                <strong>Moderator Action:</strong> Delisting{' '}
                <span className="delete-target-name">"{delistTarget.name}"</span> will remove
                it from public discovery and purge any active beneficiary requests or reserves.
              </p>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>
              Type <strong>delist</strong> to confirm:
            </p>
            <input
              type="text"
              className="confirm-delete-input"
              placeholder="delist"
              value={delistConfirmInput}
              onChange={(e) => setDelistConfirmInput(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDelistTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ backgroundColor: '#dc2626', borderColor: '#b91c1c' }}
                disabled={delistConfirmInput.toLowerCase() !== 'delist' || isDelisting}
                onClick={handleConfirmDelist}
              >
                {isDelisting ? 'Delisting...' : 'Confirm Delisting'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ManageProducts;
