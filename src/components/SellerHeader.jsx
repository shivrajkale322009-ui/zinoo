import React from 'react';
import { Home, ShieldCheck } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

export default function SellerHeader({ notifications, user, showAdminControl = false, onBackToAdmin, onOpenBuyer }) {
  return <header className="m3-mobile-top-app-bar seller-mobile-top-app-bar" aria-label="Seller navigation header">
    {showAdminControl && (
      <div className="seller-header-view-controls">
        <button type="button" className="seller-header-admin-control" onClick={onBackToAdmin} aria-label="Exit seller mode and return to admin" title="Return to admin">
          <ShieldCheck size={21} />
        </button>
        <button type="button" className="seller-header-buyer-control" onClick={onOpenBuyer} aria-label="Go to buyer section" title="Buyer section">
          <Home size={21} />
        </button>
      </div>
    )}
    <div className="seller-mobile-top-actions">
      <NotificationCenter notifications={notifications} userId={user?.uid} />
    </div>
  </header>;
}
