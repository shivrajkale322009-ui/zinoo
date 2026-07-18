import React, { useState, useRef, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { LogOut, Moon, Sun, MessageCircle, User, ChevronDown, Store, Home } from 'lucide-react';
import EditProfileModal from './EditProfileModal';
import BecomeSellerModal from './BecomeSellerModal';

function ProfileDropdown({
  user,
  onThemeToggle,
  isDarkMode,
  permissions,
  currentView,
  onViewChange,
  onBackToAdmin,
  selectedSeller,
  hideChevron = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBecomeSellerModal, setShowBecomeSellerModal] = useState(false);
  const [sellerRequestStatus, setSellerRequestStatus] = useState(null);
  const dropdownRef = useRef(null);

  const profileName = user?.displayName || user?.phoneNumber || user?.email || 'User';
  const profileInitial = profileName.trim().charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check seller request status
  useEffect(() => {
    const checkSellerRequest = async () => {
      try {
        const requestDoc = await getDoc(doc(db, 'sellerRequests', user.uid));
        if (requestDoc.exists()) {
          setSellerRequestStatus(requestDoc.data().status);
        }
      } catch (err) {
        console.error('Error checking seller request:', err);
      }
    };

    if (user && !permissions?.seller) {
      checkSellerRequest();
    }
  }, [user, permissions]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCustomerSupport = () => {
    window.open('mailto:support@druvio.com?subject=Customer Support Request', '_blank');
  };

  const handleSwitchView = (view) => {
    onViewChange(view);
    setIsOpen(false);
  };

  const hasPendingSellerRequest = sellerRequestStatus === 'pending';
  const canBecomeSeller = permissions?.buyer && !permissions?.seller && !hasPendingSellerRequest;
  const adminReviewingSeller = permissions?.admin && currentView === 'seller' && selectedSeller;
  const moduleOptions = [
    { view: 'admin', label: 'Admin Module', icon: User, available: permissions?.admin },
    { view: 'seller', label: 'Seller Mode', icon: Store, available: permissions?.seller },
    { view: 'buyer', label: 'Buyer Mode', icon: Home, available: permissions?.buyer }
  ].filter((option) => option.available);

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <div className="profile-avatar">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={`${profileName} avatar`} />
          ) : (
            <span>{profileInitial}</span>
          )}
        </div>
        {!hideChevron && <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />}
      </button>

      {isOpen && (
        <div className="dropdown-menu" role="menu" aria-label="Account menu">
          <div className="dropdown-header">
            <div className="dropdown-avatar">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={`${profileName} avatar`} />
              ) : (
                <span>{profileInitial}</span>
              )}
            </div>
            <div className="dropdown-user-info">
              <div className="dropdown-name">{profileName}</div>
              <div className="dropdown-email">{user.email || user.phoneNumber}</div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {moduleOptions.length > 0 && (
            <>
              {adminReviewingSeller && onBackToAdmin && (
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    onBackToAdmin();
                    setIsOpen(false);
                  }}
                  role="menuitem"
                >
                  <Store size={18} />
                  <span>Back to Admin Panel</span>
                </button>
              )}

              {moduleOptions.map(({ view, label, icon: Icon }) => {
                const isCurrentModule = currentView === view;
                return (
                  <button
                    key={view}
                    type="button"
                    className={`dropdown-item${isCurrentModule ? ' selected active-module' : ''}`}
                    onClick={() => !isCurrentModule && handleSwitchView(view)}
                    disabled={isCurrentModule}
                    role="menuitem"
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                    {isCurrentModule && <span className="dropdown-item-status">Current</span>}
                  </button>
                );
              })}
              <div className="dropdown-divider"></div>
            </>
          )}

          <button
            type="button"
            className="dropdown-item"
            onClick={() => {
              setShowEditModal(true);
              setIsOpen(false);
            }}
            role="menuitem"
          >
            <User size={18} />
            <span>{adminReviewingSeller ? 'Edit Seller Profile' : 'Edit Profile'}</span>
          </button>

          {canBecomeSeller && (
            <button
              type="button"
              className="dropdown-item"
              onClick={() => {
                setShowBecomeSellerModal(true);
                setIsOpen(false);
              }}
              role="menuitem"
            >
              <Store size={18} />
              <span>Become a Seller</span>
            </button>
          )}

          {hasPendingSellerRequest && (
            <button
              type="button"
              className="dropdown-item disabled"
              disabled
              role="menuitem"
            >
              <Store size={18} />
              <span>Seller Verification Pending</span>
            </button>
          )}

          <button
            type="button"
            className="dropdown-item"
            onClick={() => {
              onThemeToggle();
              setIsOpen(false);
            }}
            role="menuitem"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            type="button"
            className="dropdown-item"
            onClick={handleCustomerSupport}
            role="menuitem"
          >
            <MessageCircle size={18} />
            <span>Customer Support</span>
          </button>

          <div className="dropdown-divider"></div>

          <button type="button" className="dropdown-item logout" onClick={handleLogout} role="menuitem">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}

      {showEditModal && (
        <EditProfileModal
          user={adminReviewingSeller ? selectedSeller : user}
          allowAuthUpdate={!adminReviewingSeller}
          title={adminReviewingSeller ? 'Edit Seller Profile' : 'Edit Profile'}
          successMessage={adminReviewingSeller ? 'Seller profile updated successfully!' : 'Profile updated successfully!'}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showBecomeSellerModal && (
        <BecomeSellerModal
          user={user}
          onClose={() => setShowBecomeSellerModal(false)}
        />
      )}
    </div>
  );
}

export default ProfileDropdown;
