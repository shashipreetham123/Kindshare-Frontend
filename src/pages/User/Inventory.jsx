import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import {
  Package,
  Search,
  Plus,
  RotateCcw,
  Loader2,
  Trash2,
  Edit,
  X,
  AlertCircle,
  CheckCircle,
  Archive
} from 'lucide-react';
import api from '../../services/api';
import InventoryCard from '../../components/InventoryCard';
import Modal from '../../components/Modal';
import './Inventory.css';

function Inventory() {
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const { user } = context;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selectedProductToDelete, setSelectedProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchMyInventory = useCallback(async () => {
    if (!user || !user.username) return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      params.append('username', user.username);
      params.append('limit', 100);

      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim());
      }

      const res = await api.get(`/user/product?${params.toString()}`);
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError(err.message || 'Unable to load your inventory listings.');
    } finally {
      setLoading(false);
    }
  }, [user, debouncedSearch]);

  useEffect(() => {
    fetchMyInventory();
  }, [fetchMyInventory]);

  const handleEditOrNavigate = (product) => {
    const productId = product._id || product.id;
    if (productId) {
      navigate(`/dashboard/myproduct/${productId}`, { state: { product } });
    }
  };

  const handleOpenDeleteModal = (product) => {
    setSelectedProductToDelete(product);
    setDeleteConfirmationInput('');
  };

  const handleConfirmDelete = async () => {
    if (!selectedProductToDelete) return;

    const productId = selectedProductToDelete._id || selectedProductToDelete.id;
    try {
      setIsDeleting(true);
      setError(null);

      await api.delete(`/user/product/${productId}`);

      setSuccessMsg(`"${selectedProductToDelete.name}" was deleted successfully.`);
      setSelectedProductToDelete(null);
      setDeleteConfirmationInput('');

      await fetchMyInventory();

      setTimeout(() => {
        setSuccessMsg('');
      }, 3500);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete the product from inventory.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="inventory-page-container">
      <header className="inventory-header">
        <div className="inventory-header-left">
          <div className="inventory-title-row">
            <Archive className="inventory-header-icon" size={26} />
            <div>
              <h1>My Inventory</h1>
              <p className="inventory-subtitle">
                Manage goods and supplies listed under your account (@{user ? user.username : 'you'})
              </p>
            </div>
          </div>
        </div>

        <div className="inventory-header-actions">
          <Link to="/dashboard/add-product" className="btn-add-offering">
            <Plus size={16} />
            <span>Add New Product</span>
          </Link>
        </div>
      </header>

      <div className="inventory-search-bar">
        <div className="inventory-search-input-wrap">
          <Search size={18} className="search-field-icon" />
          <input
            type="text"
            placeholder="Search your inventory by product name or MongoDB ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inventory-search-input"
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search query"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {searchTerm && (
          <button
            type="button"
            className="btn-reset-search"
            onClick={() => setSearchTerm('')}
          >
            <RotateCcw size={14} />
            <span>Clear Filter</span>
          </button>
        )}
      </div>

      {error && (
        <div className="inventory-alert alert-error">
          <AlertCircle size={18} className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="inventory-alert alert-success">
          <CheckCircle size={18} className="alert-icon" />
          <span>{successMsg}</span>
        </div>
      )}

      <main className="inventory-content-area">
        {loading ? (
          <div className="inventory-loading-state">
            <Loader2 size={36} className="spin-icon" />
            <p>Loading your inventory listings...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="inventory-empty-state">
            <div className="empty-box-icon">
              <Package size={48} />
            </div>
            <h3>
              {searchTerm ? 'No matching inventory found' : 'Your inventory is currently empty'}
            </h3>
            <p>
              {searchTerm
                ? `No items found matching "${searchTerm}". Try another search term.`
                : 'You have not listed any items or donations yet. Share surplus goods with your community!'}
            </p>
            {searchTerm ? (
              <button
                type="button"
                className="btn-empty-action"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            ) : (
              <Link to="/dashboard/add-product" className="btn-empty-action">
                <Plus size={16} />
                <span>List Your First Product</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="inventory-cards-grid">
            {products.map((product) => (
              <InventoryCard
                key={product._id || product.id}
                item={product}
                onClick={() => handleEditOrNavigate(product)}
                onEdit={() => handleEditOrNavigate(product)}
                onDelete={() => handleOpenDeleteModal(product)}
              />
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={Boolean(selectedProductToDelete)}
        onClose={() => {
          setSelectedProductToDelete(null);
          setDeleteConfirmationInput('');
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Product Deletion"
        type="danger"
        confirmText="Yes, Delete Product"
        cancelText="Cancel & Keep"
        confirmIcon={Trash2}
        isLoading={isDeleting}
        message={
          selectedProductToDelete
            ? `Are you sure you want to delete "${selectedProductToDelete.name}"?`
            : 'Are you sure you want to delete this product?'
        }
        description={
          <div>
            <p style={{ margin: '0 0 0.5rem 0', color: '#b91c1c' }}>
              This will permanently delist the item from the community marketplace and terminate any pending request or reserved allocation associated with it.
            </p>
          </div>
        }
        inputs={[
          {
            name: 'confirmText',
            label: `Type "${selectedProductToDelete ? selectedProductToDelete.name : ''}" to confirm:`,
            type: 'text',
            value: deleteConfirmationInput,
            onChange: (e) => setDeleteConfirmationInput(e.target.value),
            placeholder: selectedProductToDelete ? selectedProductToDelete.name : '',
            required: false
          }
        ]}
      />
    </div>
  );
}

export default Inventory;
