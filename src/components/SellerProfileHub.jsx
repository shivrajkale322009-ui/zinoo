import React from 'react';
import {
  Camera,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Headphones,
  Home,
  LogOut,
  Languages,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound
} from 'lucide-react';
import UserAvatar from './UserAvatar';
import DeleteAccountModal from './DeleteAccountModal';

function SellerProfileHub({ profile, companyName, onBack, onDeveloperProfile, onEdit, onSettings, onSupport, onHelp, onLogout, onBuyer, onAdmin, canOpenAdmin = false, tabPage = false }) {
  const sellerName = profile?.displayName || profile?.name || profile?.email || 'Seller';
  const Row = ({ icon: Icon, label, onClick, danger = false }) => (
    <button type="button" className={`seller-profile-hub-row${danger ? ' danger' : ''}`} onClick={onClick}>
      <Icon size={20} />
      <span>{label}</span>
      <ChevronRight size={18} />
    </button>
  );

  return <section className={`seller-profile-hub${tabPage ? ' seller-profile-hub--tab' : ''}`} aria-label="Seller profile">
    {!tabPage && <header className="seller-profile-hub-bar"><button type="button" onClick={onBack} aria-label="Back to dashboard"><ChevronLeft size={24} /></button><strong>Profile</strong><span /></header>}
    <div className="seller-profile-hub-content">
      <div className="seller-profile-hero">
        <div className="seller-profile-hero-avatar"><UserAvatar profile={profile} fallbackLabel="Seller" useSellerDefault /><span className="seller-profile-camera-badge" aria-hidden="true"><Camera size={18} /></span></div>
        <h1>{sellerName}</h1>
        <p>{companyName || 'Seller account'}</p>
      </div>

      <div className="seller-profile-hub-section seller-profile-destinations">
        <h2>Profile</h2>
        <div className="seller-profile-hub-card">
          <button type="button" className="seller-profile-destination featured" onClick={onDeveloperProfile}><Building2 size={22} /><span><strong>Edit public profile</strong></span><ChevronRight size={18} /></button>
          <button type="button" className="seller-profile-destination" onClick={onEdit}><UserRound size={22} /><span><strong>Edit personal details</strong></span><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="seller-profile-hub-section">
        <h2>Switch section</h2>
        <div className="seller-profile-hub-card">
          <Row icon={Home} label="Go to Buyer section" onClick={onBuyer} />
          {canOpenAdmin && <Row icon={ShieldCheck} label="Go to Admin panel" onClick={onAdmin} />}
        </div>
      </div>

      <div className="seller-profile-hub-section">
        <h2>Account &amp; Support</h2>
        <div className="seller-profile-hub-card">
          <Row icon={Settings} label="Settings" onClick={onSettings} />
          <Row icon={Headphones} label="Customer Support" onClick={onSupport} />
          <Row icon={CircleHelp} label="Help & FAQs" onClick={onHelp} />
        </div>
      </div>

      <div className="seller-profile-hub-section">
        <h2>Other</h2>
        <div className="seller-profile-hub-card"><Row icon={LogOut} label="Logout" onClick={onLogout} danger /></div>
      </div>
      <small className="seller-profile-version">Zinoo v1.0.0</small>
    </div>
  </section>;
}

export function SellerSettingsPage({ user, isDarkMode, onThemeToggle, onBack, onAccountDeleted }) {
  const [language, setLanguage] = React.useState(() => window.localStorage.getItem('flinok-language') || 'en');
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const updateLanguage = (event) => {
    const nextLanguage = event.target.value;
    setLanguage(nextLanguage);
    window.localStorage.setItem('flinok-language', nextLanguage);
    document.documentElement.lang = nextLanguage;
  };

  return (
    <section className="seller-profile-hub seller-settings-page" aria-label="Seller settings">
      <header className="seller-profile-hub-bar">
        <button type="button" onClick={onBack} aria-label="Back to profile">
          <ChevronLeft size={24} />
        </button>
        <strong>Settings</strong>
        <span />
      </header>
      <div className="seller-settings-content">
        <div className="seller-profile-hub-section">
          <h2>Appearance</h2>
          <div className="seller-profile-hub-card">
            <button type="button" className="seller-settings-row" onClick={onThemeToggle}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span>
                <strong>Theme</strong>
                <small>{isDarkMode ? 'Dark mode' : 'Light mode'}</small>
              </span>
              <span className={`seller-settings-switch${isDarkMode ? ' active' : ''}`} aria-hidden="true">
                <i />
              </span>
            </button>
          </div>
        </div>
        <div className="seller-profile-hub-section">
          <h2>Language</h2>
          <label className="seller-settings-language">
            <Languages size={20} />
            <span>
              <strong>App language</strong>
              <small>Choose your preferred language</small>
            </span>
            <select value={language} onChange={updateLanguage} aria-label="App language">
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
            </select>
          </label>
          <p className="seller-settings-note">
            Language preference is saved on this device. Screens remain in English until localized translations are available.
          </p>
        </div>

        <div className="seller-profile-hub-section danger-zone">
          <h2 className="danger-title">Account Management</h2>
          <div className="seller-profile-hub-card danger-card">
            <button
              type="button"
              className="seller-settings-row danger-row"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={20} className="danger-icon" />
              <span>
                <strong className="danger-text">Delete Account</strong>
                <small>Permanently delete your account and personal data</small>
              </span>
              <ChevronRight size={18} className="danger-chevron" />
            </button>
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
            if (onAccountDeleted) onAccountDeleted(msg);
          }}
        />
      )}
    </section>
  );
}

export default SellerProfileHub;

