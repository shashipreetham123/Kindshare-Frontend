import { useEffect, useRef } from 'react';
import { X, AlertCircle, HelpCircle, CheckCircle, Info, Loader2 } from 'lucide-react';
import './Modal.css';

function Modal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message,
  description,
  type = 'primary',
  size = 'medium',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmIcon: ConfirmIcon,
  isLoading = false,
  inputs = [],
  children
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target) && !isLoading) {
      onClose();
    }
  };

  const getHeaderIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertCircle size={22} className="modal-header-icon icon-danger" />;
      case 'warning':
        return <AlertCircle size={22} className="modal-header-icon icon-warning" />;
      case 'success':
        return <CheckCircle size={22} className="modal-header-icon icon-success" />;
      case 'info':
        return <Info size={22} className="modal-header-icon icon-info" />;
      default:
        return <HelpCircle size={22} className="modal-header-icon icon-primary" />;
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!isLoading && onConfirm) {
      onConfirm();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className={`modal-container modal-type-${type} modal-size-${size}`} ref={modalRef}>
        <div className="modal-header">
          <div className="modal-header-left">
            {getHeaderIcon()}
            <h3 className="modal-title">{title}</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="modal-form">
          <div className="modal-body">
            {message && <p className="modal-message">{message}</p>}
            {description && <div className="modal-description">{description}</div>}

            {inputs && inputs.length > 0 && (
              <div className="modal-inputs-wrap">
                {inputs.map((inp) => (
                  <div key={inp.name || inp.label} className="modal-input-group">
                    {inp.label && (
                      <label htmlFor={`modal-input-${inp.name}`} className="modal-input-label">
                        {inp.label} {inp.required && <span className="req-star">*</span>}
                      </label>
                    )}
                    {inp.type === 'textarea' ? (
                      <textarea
                        id={`modal-input-${inp.name}`}
                        name={inp.name}
                        value={inp.value}
                        onChange={inp.onChange}
                        placeholder={inp.placeholder}
                        required={inp.required}
                        rows={inp.rows || 3}
                        className="modal-textarea"
                        disabled={isLoading}
                      />
                    ) : (
                      <input
                        id={`modal-input-${inp.name}`}
                        type={inp.type || 'text'}
                        name={inp.name}
                        value={inp.value}
                        onChange={inp.onChange}
                        placeholder={inp.placeholder}
                        required={inp.required}
                        className="modal-input"
                        disabled={isLoading}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {children}
          </div>

          {(cancelText || confirmText) && (
            <div className="modal-footer">
              {cancelText && (
                <button
                  type="button"
                  className="modal-btn modal-btn-cancel"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelText}
                </button>
              )}

              {confirmText && (
                <button
                  type="submit"
                  className={`modal-btn modal-btn-confirm btn-${type}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="modal-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {ConfirmIcon && <ConfirmIcon size={16} />}
                      <span>{confirmText}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Modal;
