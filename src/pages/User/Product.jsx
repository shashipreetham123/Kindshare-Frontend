import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  User,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Layers,
  Send,
  X,
  Plus,
  Minus,
  CheckCircle,
  Loader2,
  ImageOff,
  Sparkles,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import './Product.css';

const ACCESS_LEVEL_LABELS = {
  1: 'Individuals Only',
  2: 'Organizations Only',
  3: 'Businesses Only',
  4: 'Everyone (Public Community)'
};

function Product() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const context = useOutletContext() || {};
  const { user, isAdmin } = context;

  const initialProduct = location.state && location.state.product ? location.state.product : null;

  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [activeImage, setActiveImage] = useState(initialProduct ? initialProduct.coverImage : '');

  const [requestQuantity, setRequestQuantity] = useState(1);
  const [requestNote, setRequestNote] = useState('');

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const [showAdminRemoveModal, setShowAdminRemoveModal] = useState(false);
  const [adminRemoveConfirmInput, setAdminRemoveConfirmInput] = useState('');
  const [isRemovingByAdmin, setIsRemovingByAdmin] = useState(false);

  useEffect(() => {
    async function fetchProductDetails() {
      const targetId = productId || (initialProduct && (initialProduct._id || initialProduct.id));
      if (!targetId) {
        setError('No product specified.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let data = null;
        try {
          const res = await api.get(`/user/product/${targetId}`);
          data = res.data;
        } catch (e) {

          const res = await api.get(`/user/product?_id=${targetId}`);
          if (res.data && res.data.length > 0) {
            data = res.data[0];
          }
        }

        if (!data) {
          setError('Product not found or has been delisted.');
          return;
        }

        setProduct(data);
        setActiveImage(data.coverImage || (data.images && data.images[0]) || '');
      } catch (err) {
        console.error('Failed to load product:', err);
        setError(err.message || 'Unable to load product details.');
      } finally {
        setLoading(false);
      }
    }

    if (!initialProduct || !initialProduct.name) {
      fetchProductDetails();
    } else {
      setActiveImage(initialProduct.coverImage || '');
    }
  }, [productId]);

  const handleCancel = () => {
    navigate(-1);
  };

  const availableQuantity = product
    ? product.quantity !== undefined
      ? product.quantity
      : product.available || 0
    : 0;

  const isOwner = Boolean(
    user && product && user.username && product.username &&
    user.username.toLowerCase() === product.username.toLowerCase()
  );

  const isOutOfStock = availableQuantity <= 0;

  const handleOpenRequestModal = () => {
    setError(null);
    setSuccessMsg('');

    if (isOwner) {
      setError('You cannot request your own listed product.');
      return;
    }

    if (isOutOfStock) {
      setError('This product is currently out of stock.');
      return;
    }

    if (requestQuantity > availableQuantity) {
      setError(`Requested quantity cannot exceed available stock (${availableQuantity}).`);
      return;
    }

    setShowRequestModal(true);
  };

  const handleAdminRemoveProduct = async () => {
    const targetId = product._id || product.id || productId;
    if (!targetId) return;

    try {
      setIsRemovingByAdmin(true);
      setError(null);

      await api.delete(`/admin/product/${targetId}`);
      setShowAdminRemoveModal(false);
      setSuccessMsg(`Product "${product.name}" has been removed and delisted by administrator.`);

      setTimeout(() => {
        navigate('/dashboard/browse');
      }, 1500);
    } catch (err) {
      console.error('Failed to remove product as admin:', err);
      setError(err.message || 'Failed to remove product.');
      setShowAdminRemoveModal(false);
    } finally {
      setIsRemovingByAdmin(false);
    }
  };

  const handleConfirmRequest = async () => {
    try {
      setSubmittingRequest(true);
      setError(null);

      const payload = {
        productId: product._id || product.id || productId,
        donorUsername: product.username,
        beneficiaryUsername: user ? user.username : undefined,
        quantity: Number(requestQuantity),
        note: requestNote.trim()
      };

      const res = await api.post('/user/request', payload);

      setShowRequestModal(false);
      setRequestNote('');
      setSuccessMsg(res.message || 'Your request has been submitted to the donor successfully!');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Request failed:', err);
      setError(err.message || 'Failed to submit request. Please try again.');
      setShowRequestModal(false);
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="product-view-loading">
        <Loader2 size={36} className="spin-icon" />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="product-view-error">
        <AlertCircle size={44} className="error-icon" />
        <h3>Unable to Display Product</h3>
        <p>{error}</p>
        <button type="button" onClick={handleCancel} className="btn-error-back">
          <ArrowLeft size={16} />
          <span>Back to Browse</span>
        </button>
      </div>
    );
  }

  const allImages = [
    product.coverImage,
    ...(Array.isArray(product.images) ? product.images : [])
  ].filter(Boolean);

  const formattedDate = product.listedAt
    ? new Date(product.listedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Recently';

  return (
    <div className="product-details-page">
      <div className="product-topbar">
        <button type="button" onClick={handleCancel} className="btn-back">
          <ArrowLeft size={18} />
          <span>Back to Browse</span>
        </button>
        <div className="topbar-breadcrumb">
          <span>Browse</span> / <span>Product Details</span>
        </div>
      </div>

      {error && (
        <div className="product-alert alert-error">
          <AlertCircle size={18} className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="product-alert alert-success">
          <CheckCircle size={18} className="alert-icon" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="product-showcase-container">
        <div className="product-media-column">
          <div className="main-image-display">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="active-display-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="image-display-fallback">
                <ImageOff size={44} />
                <span>No Image Available</span>
              </div>
            )}

            <div className="stock-overlay-chip">
              <Package size={14} />
              <span>
                {isOutOfStock ? 'Out of Stock' : `${availableQuantity} Available`}
              </span>
            </div>
          </div>

          {allImages.length > 1 && (
            <div className="gallery-thumbnails-strip">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`gallery-thumb-btn ${activeImage === img ? 'thumb-active' : ''}`}
                  onClick={() => setActiveImage(img)}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="gallery-thumb-img" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info-column">
          <div className="product-title-section">
            <span className="product-badge-category">
              <Sparkles size={13} />
              <span>Community Donation</span>
            </span>
            <h1 className="product-main-name">{product.name}</h1>

            <div className="product-meta-row">
              <div className="meta-pill">
                <Calendar size={13} />
                <span>Listed {formattedDate}</span>
              </div>
              <div className="meta-pill">
                <Layers size={13} />
                <span>{ACCESS_LEVEL_LABELS[product.accessLevel] || 'Everyone'}</span>
              </div>
            </div>
          </div>

          <div className="donor-card-box">
            <div className="donor-card-avatar">
              <User size={18} />
            </div>
            <div className="donor-card-info">
              <span className="donor-card-label">Offered with kindness by</span>
              <div className="donor-card-name-row">
                <strong className="donor-card-username">@{product.username}</strong>
                {product.verified ? (
                  <span className="donor-verified-badge" title="Verified platform member">
                    <ShieldCheck size={12} />
                    <span>Verified Donor</span>
                  </span>
                ) : (
                  <span className="donor-unverified-badge">
                    <AlertCircle size={12} />
                    <span>Community Member</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="product-description-section">
            <h3>About This Offering</h3>
            <p className="product-description-text">{product.description}</p>
          </div>

          <div className="request-action-card">
            {isAdmin ? (
              <div className="admin-moderation-panel">
                <div className="admin-moderation-title">
                  <ShieldCheck size={18} />
                  <span>Administrator Oversight Mode</span>
                </div>
                <p className="admin-moderation-desc">
                  Administrators can view all item specifications, donor metadata, and inventory levels, but cannot place personal item requests. You may remove or delist this listing if needed.
                </p>
              </div>
            ) : isOwner ? (
              <div className="owner-notice">
                <p>
                  You are the donor of this listing. To update details or manage its stock, go to{' '}
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/myproduct/${product._id || product.id}`)}
                    className="link-btn"
                  >
                    My Inventory
                  </button>.
                </p>
              </div>
            ) : isOutOfStock ? (
              <div className="out-of-stock-notice">
                <AlertCircle size={18} />
                <span>This item has been fully requested or allocated.</span>
              </div>
            ) : (
              <div className="request-controls-wrap">
                <div className="request-quantity-selector">
                  <label htmlFor="req-qty">Quantity to Request:</label>
                  <div className="qty-counter-widget">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setRequestQuantity((q) => Math.max(1, q - 1))}
                      disabled={requestQuantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      id="req-qty"
                      type="number"
                      min="1"
                      max={availableQuantity}
                      value={requestQuantity}
                      onChange={(e) =>
                        setRequestQuantity(
                          Math.max(1, Math.min(availableQuantity, Number(e.target.value) || 1))
                        )
                      }
                      className="qty-number-input"
                    />
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() =>
                        setRequestQuantity((q) => Math.min(availableQuantity, q + 1))
                      }
                      disabled={requestQuantity >= availableQuantity}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="qty-max-hint">(Max available: {availableQuantity})</span>
                </div>
              </div>
            )}

            <div className="product-buttons-row">
              <button type="button" onClick={handleCancel} className="btn-product-cancel">
                <X size={16} />
                <span>Cancel</span>
              </button>

              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => {
                    setAdminRemoveConfirmInput('');
                    setShowAdminRemoveModal(true);
                  }}
                  className="btn-admin-remove"
                >
                  <Trash2 size={16} />
                  <span>Remove Listing</span>
                </button>
              ) : (
                !isOwner && !isOutOfStock && (
                  <button
                    type="button"
                    onClick={handleOpenRequestModal}
                    className="btn-product-request"
                  >
                    <Send size={16} />
                    <span>Request Product</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onConfirm={handleConfirmRequest}
        title="Confirm Product Request"
        type="primary"
        confirmText="Submit Request"
        cancelText="Cancel"
        confirmIcon={Send}
        isLoading={submittingRequest}
        message={`Request ${requestQuantity} unit(s) of "${product.name}"?`}
        description={
          <div>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              Your request will be sent directly to <strong>@{product.username}</strong> for review and reservation handoff.
            </p>
          </div>
        }
        inputs={[
          {
            name: 'note',
            label: 'Optional message to the donor',
            type: 'textarea',
            value: requestNote,
            onChange: (e) => setRequestNote(e.target.value),
            placeholder: 'Introduce yourself or provide pickup availability...',
            rows: 3
          }
        ]}
      />

      <Modal
        isOpen={showAdminRemoveModal}
        onClose={() => setShowAdminRemoveModal(false)}
        title="Admin: Remove Community Listing"
        size="medium"
      >
        <div>
          <div className="admin-remove-warning">
            <div className="admin-remove-warning-header">
              <ShieldAlert size={18} />
              <span>Administrative Removal Notice</span>
            </div>
            <p style={{ margin: 0 }}>
              Removing <strong>"{product.name}"</strong> will immediately delist it from the community catalog and cancel any active beneficiary requests or reserves.
            </p>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>
            To confirm, please type <strong>delist</strong> in the box below:
          </p>

          <input
            type="text"
            value={adminRemoveConfirmInput}
            onChange={(e) => setAdminRemoveConfirmInput(e.target.value)}
            placeholder="delist"
            className="admin-delist-input"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn-back"
              onClick={() => setShowAdminRemoveModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdminRemoveProduct}
              disabled={adminRemoveConfirmInput.toLowerCase().trim() !== 'delist' || isRemovingByAdmin}
              className="btn-admin-confirm-remove"
            >
              <Trash2 size={15} />
              <span>{isRemovingByAdmin ? 'Removing Listing...' : 'Confirm Remove'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Product;
