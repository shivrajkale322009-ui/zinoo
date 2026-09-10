import React, { useState, useEffect } from 'react';
import { updateDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { ArrowLeft, Camera, LockKeyhole, Mail, Phone, Save, UserRound, X } from 'lucide-react';
import UserAvatar from './UserAvatar';

function EditProfileModal({
  user,
  onClose,
  allowAuthUpdate = true,
  title = 'Personal Information',
  successMessage = 'Profile updated successfully!',
  onSave,
  mobilePage = false,
  companyName = ''
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: user.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load existing profile data
    const loadProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const nameParts = (data.displayName || user.displayName || '').split(' ');
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            phoneNumber: data.phoneNumber || user.phoneNumber || '',
            email: data.email || user.email || ''
          });
        } else {
          // If no document exists, try to get from auth user
          const nameParts = (user.displayName || '').split(' ');
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            phoneNumber: user.phoneNumber || '',
            email: user.email || ''
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const displayName = `${formData.firstName} ${formData.lastName}`.trim();

      if (allowAuthUpdate) {
        const authUser = auth.currentUser;
        if (!authUser) throw new Error('No authenticated user is available to update.');
        await updateProfile(authUser, {
          displayName: displayName || user.displayName
        });
      }

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const profileChanges = {
        displayName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        updatedAt: serverTimestamp()
      };

      if (userDoc.exists()) {
        await updateDoc(userRef, profileChanges);
      } else {
        await setDoc(userRef, {
          uid: user.uid,
          permissions: { buyer: true, seller: false, admin: false },
          createdAt: serverTimestamp(),
          ...profileChanges
        });
      }

      onSave?.({
        displayName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        name: displayName
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={mobilePage ? 'seller-edit-profile-page' : 'modal-overlay'}>
      <div className={mobilePage ? 'seller-edit-profile-content' : 'modal-content edit-profile-modal'}>
        <div className={mobilePage ? 'seller-edit-profile-bar' : 'modal-header'}>
          {mobilePage && <button type="button" onClick={onClose} aria-label="Back to profile"><ArrowLeft size={23} /></button>}
          <h2>{title}</h2>
          {mobilePage ? <button type="submit" form="seller-edit-profile-form" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button> : <button className="close-button" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>}
        </div>

        <form id="seller-edit-profile-form" onSubmit={handleSubmit} className={mobilePage ? 'edit-profile-form seller-edit-profile-form' : 'edit-profile-form'}>
          {error && <div className="modal-error">{error}</div>}
          {success && <div className="modal-success">{successMessage}</div>}

          {mobilePage && <div className="seller-edit-profile-hero"><div><UserAvatar profile={user} fallbackLabel="Seller" useSellerDefault /><span className="seller-profile-camera-badge" aria-hidden="true"><Camera size={18} /></span></div><h1>{formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}`.trim() : user.displayName || 'Seller'}</h1><p>{companyName || user.businessName || 'Seller account'}</p></div>}

          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <div className="edit-profile-input-shell">{mobilePage && <UserRound size={19} />}<input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Enter your first name"
            /></div>
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <div className="edit-profile-input-shell">{mobilePage && <UserRound size={19} />}<input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
            /></div>
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Mobile Number</label>
            <div className="edit-profile-input-shell">{mobilePage && <Phone size={19} />}<input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your mobile number"
            /></div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="edit-profile-input-shell">{mobilePage && <Mail size={19} />}<input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              className="disabled-field"
            />{mobilePage && <LockKeyhole size={17} />}</div>
            <small className="field-note">Email is displayed for reference only.</small>
          </div>

          <div className={mobilePage ? 'modal-actions seller-edit-profile-actions' : 'modal-actions'}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
