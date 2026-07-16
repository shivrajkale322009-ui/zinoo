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
  selectedSeller
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBecomeSellerModal, setShowBecomeSellerModal] = useState(false);
  const [sellerRequestStatus, setSellerRequestStatus] = useState(null);
  const dropdownRef = useRef(null);

  const profileName = user.displayName || user.phoneNumber || user.email || 'User';
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

  const canSwitchToSeller = permissions?.seller;
  const hasPendingSellerRequest = sellerRequestStatus === 'pending';
  const canBecomeSeller = permissions?.buyer && !permissions?.seller && !hasPendingSellerRequest;
  const adminReviewingSeller = permissions?.admin && currentView === 'seller' && selectedSeller;
  const showAdminSwitcher = permissions?.admin;

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Profile menu"
      >
        <div className="profile-avatar">
          {user.photoURL ? (
            <img src={user.photoURL} alt={`${profileName} avatar`} />
          ) : (
            <span>{profileInitial}</span>
          )}
        </div>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <div className="dropdown-avatar">
              {user.photoURL ? (
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

          {/* View Switching */}
          {(permissions?.buyer || permissions?.seller || permissions?.admin) && (
            <>
              {adminReviewingSeller && onBackToAdmin && (
                <button
                  className="dropdown-item"
                  onClick={() => {
                    onBackToAdmin();
                    setIsOpen(false);
                  }}
                  style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)' }}
                >
                  <Store size={18} />
                  <span>Back to Admin Panel</span>
                </button>
              )}

              {showAdminSwitcher && currentView !== 'admin' && (
                <button
                  className="dropdown-item"
                  onClick={() => handleSwitchView('admin')}
                >
                  <User size={18} />
                  <span>Open Admin Panel</span>
                </button>
              )}

              {showAdminSwitcher && currentView !== 'buyer' && (
                <button
                  className="dropdown-item"
                  onClick={() => handleSwitchView('buyer')}
                >
                  <Home size={18} />
                  <span>Open Buyer Module</span>
                </button>
              )}

              {showAdminSwitcher && !adminReviewingSeller && (
                <button
                  className="dropdown-item"
                  onClick={() => handleSwitchView('seller')}
                >
                  <Store size={18} />
                  <span>Open Seller Module</span>
                </button>
              )}

              {!permissions?.admin && permissions?.buyer && currentView !== 'buyer' && (
                <button
                  className="dropdown-item"
                  onClick={() => handleSwitchView('buyer')}
                >
                  <Home size={18} />
                  <span>Switch to Buyer View</span>
                </button>
              )}
              {!permissions?.admin && permissions?.seller && currentView !== 'seller' && (
                <button
                  className="dropdown-item"
                  onClick={() => handleSwitchView('seller')}
                >
                  <Store size={18} />
                  <span>Switch to Seller Dashboard</span>
                </button>
              )}
              {(permissions?.buyer || permissions?.seller || permissions?.admin) && <div className="dropdown-divider"></div>}
            </>
          )}

          <button
            className="dropdown-item"
            onClick={() => {
              setShowEditModal(true);
              setIsOpen(false);
            }}
          >
            <User size={18} />
            <span>{adminReviewingSeller ? 'Edit Seller Profile' : 'Edit Profile'}</span>
          </button>

          {canBecomeSeller && (
            <button
              className="dropdown-item"
              onClick={() => {
                setShowBecomeSellerModal(true);
                setIsOpen(false);
              }}
            >
              <Store size={18} />
              <span>Become a Seller</span>
            </button>
          )}

          {hasPendingSellerRequest && (
            <button
              className="dropdown-item"
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            >
              <Store size={18} />
              <span>Seller Verification Pending</span>
            </button>
          )}

          <button
            className="dropdown-item"
            onClick={() => {
              onThemeToggle();
              setIsOpen(false);
            }}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            className="dropdown-item"
            onClick={handleCustomerSupport}
          >
            <MessageCircle size={18} />
            <span>Customer Support</span>
          </button>

          <div className="dropdown-divider"></div>

          <button className="dropdown-item logout" onClick={handleLogout}>
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
