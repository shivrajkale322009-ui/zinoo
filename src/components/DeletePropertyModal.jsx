import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, LoaderCircle, Trash2, X } from 'lucide-react';
import { isDeleteConfirmationValid } from '../utils/deletePropertyConfirmation';

function DeletePropertyModal({ property, deleting, error, onCancel, onConfirm }) {
  const [confirmation, setConfirmation] = useState('');
  const inputRef = useRef(null);
  const validConfirmation = isDeleteConfirmationValid(confirmation);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!property) return null;

  const cancel = () => {
    if (!deleting) onCancel();
  };

  return (
    <div className="modal-overlay delete-property-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) cancel();
    }}>
      <section className="modal-content delete-property-modal" role="dialog" aria-modal="true" aria-labelledby="delete-property-title">
        <header className="modal-header">
          <div className="delete-property-title">
            <span className="delete-property-icon"><Trash2 size={20} /></span>
            <h2 id="delete-property-title">Delete Property</h2>
          </div>
          <button type="button" className="close-button" disabled={deleting} onClick={cancel} aria-label="Close delete property dialog">
            <X size={19} />
          </button>
        </header>

        <div className="delete-property-body">
          <p>Are you sure you want to permanently delete this property?</p>
          <dl className="delete-property-details">
            <div><dt>Property:</dt><dd>{property.name || 'Untitled Project'}</dd></div>
            <div><dt>Property ID:</dt><dd>{property.projectId || property.id}</dd></div>
          </dl>
          <div className="delete-property-warning"><AlertTriangle size={17} /><strong>This action cannot be undone.</strong></div>

          <label htmlFor="delete-property-confirmation">To confirm, type <strong>DELETE</strong></label>
          <input
            ref={inputRef}
            id="delete-property-confirmation"
            className="form-control"
            value={confirmation}
            disabled={deleting}
            placeholder="Type DELETE to continue"
            autoComplete="off"
            onChange={(event) => setConfirmation(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') cancel();
              if (event.key === 'Enter' && validConfirmation && !deleting) onConfirm(confirmation);
            }}
          />
          {error && <div className="app-error delete-property-error" role="alert">{error}</div>}
        </div>

        <footer className="delete-property-actions">
          <button type="button" className="btn-secondary" disabled={deleting} onClick={cancel}>Cancel</button>
          <button
            type="button"
            className="btn-danger delete-property-confirm"
            disabled={deleting || !validConfirmation}
            onClick={() => onConfirm(confirmation)}
          >
            {deleting ? <><LoaderCircle className="button-spinner" size={17} /> Deleting…</> : <><Trash2 size={17} /> Delete Property</>}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default DeletePropertyModal;
