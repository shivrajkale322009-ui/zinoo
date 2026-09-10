import React, { useState } from 'react';
import {
  X,
  Settings,
  Sun,
  Moon,
  Languages,
  User,
  Trash2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import DeleteAccountModal from './DeleteAccountModal';
import UserAvatar from './UserAvatar';

/**
 * SettingsModal Component
 * 
 * Provides a clean Material Design settings interface corresponding to
 * Profile -> Settings -> Delete Account.
 * 
 * @param {Object} props
 * @param {import('firebase/auth').User} props.user
 * @param {boolean} props.isOpen
 * @param {boolean} props.isDarkMode
 * @param {() => void} props.onThemeToggle
 * @param {() => void} props.onClose
 * @param {(message: string) => void} props.onAccountDeleted
 */
export default function SettingsModal({
  user,
  isOpen,
  isDarkMode,
  onThemeToggle,
  onClose,
  onAccountDeleted
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [language, setLanguage] = useState(() => {
    try {
      return window.localStorage.getItem('flinok-language') || 'en';
    } catch (_) {
      return 'en';
    }
  });

  if (!isOpen) return null;

  const handleLanguageChange = (e) => {
    const nextLang = e.target.value;
    setLanguage(nextLang);
    try {
      window.localStorage.setItem('flinok-language', nextLang);
      document.documentElement.lang = nextLang;
    } catch (_) {}
  };

  const userName = user?.displayName || user?.name || user?.email || 'User';
  const userEmail = user?.email || user?.phoneNumber || '';

  return (
    <>
      <div
        className="modal-overlay settings-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="modal-card settings-modal-card m3-dialog">
          <header className="settings-modal-header">
            <div className="settings-title-group">
              <Settings size={22} className="settings-header-icon" />
              <h2 id="settings-title">Account Settings</h2>
            </div>
            <button
              type="button"
              className="close-modal-btn"
              onClick={onClose}
              aria-label="Close settings"
            >
              <X size={20} />
            </button>
          </header>

          <div className="settings-modal-body">
            {/* User Profile Brief */}
            <div className="settings-user-hero">
              <UserAvatar profile={user} fallbackLabel="User" className="settings-avatar" />
              <div className="settings-user-info">
                <strong>{userName}</strong>
                <small>{userEmail}</small>
              </div>
            </div>

            {/* Appearance Section */}
            <section className="settings-section">
              <h3 className="settings-section-title">Appearance</h3>
              <div className="settings-card">
                <button
                  type="button"
                  className="settings-row-btn"
                  onClick={onThemeToggle}
                >
                  <div className="row-left">
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    <span>Theme</span>
                  </div>
                  <span className="row-value">{isDarkMode ? 'Dark mode' : 'Light mode'}</span>
                </button>
              </div>
            </section>

            {/* Language Section */}
            <section className="settings-section">
              <h3 className="settings-section-title">Language</h3>
              <div className="settings-card">
                <div className="settings-row-select">
                  <div className="row-left">
                    <Languages size={20} />
                    <span>App Language</span>
                  </div>
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    aria-label="App Language"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="mr">मराठी</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Danger Zone / Delete Account Section */}
            <section className="settings-section danger-zone">
              <h3 className="settings-section-title danger-title">Account Management</h3>
              <div className="settings-card danger-card">
                <button
                  type="button"
                  className="settings-row-btn danger-row-btn"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <div className="row-left danger-text">
                    <Trash2 size={20} className="danger-icon" />
                    <div className="danger-row-label">
                      <strong>Delete Account</strong>
                      <small>Permanently purge your account and personal data</small>
                    </div>
                  </div>
                  <ChevronRight size={18} className="danger-chevron" />
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          user={user}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={(msg) => {
            setShowDeleteModal(false);
            onClose();
            if (onAccountDeleted) onAccountDeleted(msg);
          }}
        />
      )}
    </>
  );
}
