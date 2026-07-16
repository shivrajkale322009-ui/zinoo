import React, { useState } from 'react';
import { addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { X, Store, Building2, Phone, Mail, FileText, CheckCircle } from 'lucide-react';

function BecomeSellerModal({ user, onClose }) {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    businessAddress: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      // Create seller request document
      await setDoc(doc(db, 'sellerRequests', user.uid), {
        userId: user.uid,
        userName: user.displayName || user.email || user.phoneNumber,
        userEmail: user.email,
        userPhone: user.phoneNumber,
        businessName: formData.businessName,
        businessType: formData.businessType,
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        businessAddress: formData.businessAddress,
        description: formData.description,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Reload to update UI
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error submitting seller request:', err);
      setError('Failed to submit seller request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay">
        <div className="modal-content become-seller-modal">
          <div className="modal-header">
            <h2>Seller Request Submitted</h2>
            <button className="close-button" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
          <div className="success-message">
            <CheckCircle size={64} className="success-icon" />
            <h3>Your application has been submitted!</h3>
            <p>We will review your seller application and get back to you within 24-48 hours.</p>
            <p className="status-note">Status: <strong>Pending Review</strong></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content become-seller-modal">
        <div className="modal-header">
          <h2>Become a Seller</h2>
          <button className="close-button" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="become-seller-form">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-intro">
            <Store size={32} />
            <p>Register as a seller to list and manage your property projects on Druvio.</p>
          </div>

          <div className="form-section">
            <h4>Business Information</h4>

            <div className="form-group">
              <label htmlFor="businessName">Business Name *</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
                placeholder="Enter your business name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="businessType">Business Type *</label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                required
              >
                <option value="">Select business type</option>
                <option value="developer">Real Estate Developer</option>
                <option value="builder">Construction Company</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="businessAddress">Business Address *</label>
              <input
                type="text"
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                required
                placeholder="Enter complete business address"
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Contact Information</h4>

            <div className="form-group">
              <label htmlFor="contactPerson">Contact Person *</label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
                placeholder="Primary contact person name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactPhone">Contact Phone *</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                required
                placeholder="10-digit mobile number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email *</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
                placeholder="business@email.com"
              />
            </div>
          </div>



          <div className="form-section">
            <h4>Additional Details</h4>

            <div className="form-group">
              <label htmlFor="description">Business Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Tell us about your business, experience in real estate, and types of properties you deal with..."
                rows={4}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BecomeSellerModal;
