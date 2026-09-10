import React, { useState, useRef } from 'react';
import { AlertTriangle, Loader, X, LogOut, ShieldAlert } from 'lucide-react';
import AccountDeletionService from '../services/accountDeletionService';

/**
 * DeleteAccountModal Component
 * 
 * Material Design 3 styled modal dialog for permanent account and data deletion.
 * Fully satisfies Google Play's User Data policy and Firebase Auth re-authentication requirements.
 * 
 * @param {Object} props
 * @param {import('firebase/auth').User} props.user
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {(message: string) => void} props.onSuccess
 */
export default function DeleteAccountModal({ user, isOpen, onClose, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [error, setError] = useState('');
  const [needsReauth, setNeedsReauth] = useState(false);
  const deletionInFlightRef = useRef(false);

  if (!isOpen) return null;

  const handleConfirmDelete = async () => {
    if (deletionInFlightRef.current || isDeleting || isReauthenticating) return;

    deletionInFlightRef.current = true;
    setIsDeleting(true);
    setError('');
    setNeedsReauth(false);

    try {
      await AccountDeletionService.deleteEverything(user);
      const successMessage = 'Your account and associated data have been permanently deleted.';
      if (onSuccess) {
        onSuccess(successMessage);
      }
    } catch (err) {
      console.error('[DeleteAccountModal] Account deletion error:', err);
      const requiresReauth =
        err?.code === 'auth/requires-recent-login' ||
        (typeof err?.message === 'string' && err.message.toLowerCase().includes('re-authentication'));

      if (requiresReauth) {
        setNeedsReauth(true);
        setError('Security rule: Deleting an account requires recent sign-in. Please re-authenticate to confirm deletion.');
      } else {
        setError(err?.message || 'An unexpected error occurred while deleting your account. Please try again.');
      }
    } finally {
      deletionInFlightRef.current = false;
      setIsDeleting(false);
    }
  };

  const handleReauthenticate = async () => {
    if (isReauthenticating) return;
    setIsReauthenticating(true);
    setError('');

    try {
      await AccountDeletionService.reauthenticateUser(user);
      setNeedsReauth(false);
      // Auto-retry deletion after successful re-auth
      await handleConfirmDelete();
    } catch (err) {
      console.error('[DeleteAccountModal] Re-authentication failed:', err);
      const isCancelled = err?.code === 'auth/popup-closed-by-user' || err?.code === 'ERROR_CANCELED';
      if (isCancelled) {
        setError('Re-authentication was cancelled before completing.');
      } else {
        setError('Re-authentication failed. Please sign out, sign in again, and try deleting your account.');
      }
    } finally {
      setIsReauthenticating(false);
    }
  };

  const isProcessing = isDeleting || isReauthenticating;

  return (
    <div
      className="modal-overlay delete-account-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-description"
    >
      <div className="modal-card delete-account-modal-card m3-dialog">
        <header className="delete-account-header">
          <div className="delete-account-badge" aria-hidden="true">
            <AlertTriangle size={28} className="delete-account-warning-icon" />
          </div>
          <h2 id="delete-account-title" className="delete-account-title">
            Delete Account
          </h2>
          <button
            type="button"
            className="close-modal-btn"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </header>

        <div className="delete-account-body">
          <p id="delete-account-description" className="delete-account-message">
            This action is permanent. Your account and all associated personal data will be permanently deleted and cannot be recovered.
          </p>

          <div className="delete-account-scope-list" aria-label="Data to be removed">
            <small className="scope-title">Data that will be permanently removed:</small>
            <ul>
              <li>Profile information, preferences, and saved settings</li>
              <li>Saved properties, favorites, and seller/buyer records</li>
              <li>Uploaded project media, documents, and cashback claims</li>
              <li>Firebase authentication credentials and account login</li>
            </ul>
          </div>

          {error && (
            <div className="modal-error delete-account-error" role="alert">
              <ShieldAlert size={18} className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {isDeleting && (
            <div className="delete-account-loading-status" role="status" aria-live="polite">
              <Loader size={22} className="spin-indicator" />
              <span>Permanently deleting your account and associated personal data...</span>
            </div>
          )}
        </div>

        <footer className="modal-actions delete-account-actions">
          <button
            type="button"
            className="btn btn-secondary cancel-btn"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>

          {needsReauth ? (
            <button
              type="button"
              className="btn btn-primary reauth-btn"
              onClick={handleReauthenticate}
              disabled={isProcessing}
            >
              {isReauthenticating ? (
                <>
                  <Loader size={18} className="spin-indicator" />
                  <span>Re-authenticating...</span>
                </>
              ) : (
                <>
                  <LogOut size={18} />
                  <span>Re-authenticate to Delete</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-danger delete-confirm-btn"
              onClick={handleConfirmDelete}
              disabled={isProcessing}
            >
              {isDeleting ? (
                <>
                  <Loader size={18} className="spin-indicator" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Account</span>
              )}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
