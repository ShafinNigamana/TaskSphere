import React, { useEffect } from 'react';

/**
 * Reusable confirmation dialog modal.
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  // Trap focus and handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop confirm-dialog-backdrop" style={{ zIndex: 1100 }}>
      <div className="modal-content confirm-dialog-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>
        <div className="confirm-dialog-body" style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', padding: 'var(--space-2) 0' }}>
          {message}
        </div>
        <div className="modal-actions" style={{ marginTop: 'var(--space-2)' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button 
            type="button" 
            className="btn btn-danger" 
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
