import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, TrendingUp, IndianRupee, Percent, 
  Check, X, FileText, Smartphone, AlertCircle 
} from 'lucide-react';

function AdminPanel({ projects, leads, cashbacks, updateCashbackStatus, addProject }) {
  const [activeTab, setActiveTab] = useState('cashbacks'); // 'cashbacks', 'listings', 'pipeline'

  // Calculate platform statistics
  const activeListingsCount = projects.filter(p => p.status === 'Active').length;
  const verifiedListingsCount = projects.filter(p => p.verified).length;
  
  // Total sales and revenue (based on approved cashback purchases)
  const approvedCashbacks = cashbacks.filter(c => c.status === 'Approved');
  const totalPurchaseValue = approvedCashbacks.reduce((acc, c) => acc + c.purchasePrice, 0);
  
  // PlotIt keeps 1% commission, buyer gets 1% cashback (total dev commission is 2%)
  const plotItRevenue = approvedCashbacks.reduce((acc, c) => acc + c.commissionAmount, 0);
  const disbursedCashbacks = approvedCashbacks.reduce((acc, c) => acc + c.cashbackAmount, 0);

  const totalBookedVisits = leads.filter(l => l.stage === "Book Visit" || l.stage === "Visit Done" || l.stage === "Negotiation" || l.stage === "Purchased").length;

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleApproveCashback = (id) => {
    updateCashbackStatus(id, 'Approved');
  };

  const handleRejectCashback = (id) => {
    updateCashbackStatus(id, 'Rejected');
  };

  return (
    <div>
      {/* Admin metrics row */}
      <div className="metric-grid">
        <div className="metric-card" style={{ borderLeft: '4px solid var(--brand-primary)' }}>
          <div className="metric-title">PlotIt Net Revenue (1% Commission)</div>
          <div className="metric-value" style={{ color: 'var(--brand-primary)' }}>
            {formatCurrency(plotItRevenue)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>From {approvedCashbacks.length} sales</span>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="metric-title">Cashbacks Disbursed (1%)</div>
          <div className="metric-value" style={{ color: '#3b82f6' }}>
            {formatCurrency(disbursedCashbacks)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Paid out to buyers</span>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
          <div className="metric-title">Active Projects</div>
          <div className="metric-value">
            {activeListingsCount} / {projects.length}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{verifiedListingsCount} GPS-Verified</span>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid #a855f7' }}>
          <div className="metric-title">Total Bookings</div>
          <div className="metric-value">
            {totalBookedVisits}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Qualified Buyers</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveTab('cashbacks')}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'cashbacks' ? 'var(--brand-primary)' : 'var(--text-secondary)', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Cashback Queue ({cashbacks.filter(c => c.status === 'Pending Verification').length} pending)
        </button>
        <button 
          onClick={() => setActiveTab('listings')}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'listings' ? 'var(--brand-primary)' : 'var(--text-secondary)', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Listing Moderation
        </button>
        <button 
          onClick={() => setActiveTab('pipeline')}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'pipeline' ? 'var(--brand-primary)' : 'var(--text-secondary)', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Lead Pipeline (Funnel Tracker)
        </button>
      </div>

      {/* Content */}
      {activeTab === 'cashbacks' ? (
        // CASHBACK QUEUE
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <AlertCircle size={16} color="var(--brand-primary)" />
            <span>Admins verify the uploaded purchase agreement with the developer before approving the 1% cashback payout.</span>
          </div>

          <div className="table-container">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Purchaser Name</th>
                  <th>Mobile</th>
                  <th>Plot Name</th>
                  <th>Plot Price</th>
                  <th>1% Cashback Amt</th>
                  <th>Agreement Doc</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cashbacks.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No cashback requests submitted yet.</td>
                  </tr>
                ) : (
                  cashbacks.map(claim => (
                    <tr key={claim.id}>
                      <td><strong>{claim.buyerName}</strong></td>
                      <td>{claim.buyerPhone}</td>
                      <td>{claim.project}</td>
                      <td>{formatCurrency(claim.purchasePrice)}</td>
                      <td><strong style={{ color: 'var(--brand-primary)' }}>{formatCurrency(claim.cashbackAmount)}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', fontSize: '11px', cursor: 'pointer' }} onClick={() => alert(`Simulating PDF Viewer: Opening ${claim.documentName}...`)}>
                          <FileText size={12} />
                          {claim.documentName}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          claim.status === "Approved" ? "badge-success" : 
                          claim.status === "Rejected" ? "badge-danger" : "badge-warning"
                        }`}>
                          {claim.status}
                        </span>
                      </td>
                      <td>
                        {claim.status === "Pending Verification" ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => handleApproveCashback(claim.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid var(--color-active)',
                                color: 'var(--color-active)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button 
                              onClick={() => handleRejectCashback(claim.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              <X size={12} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No actions</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'listings' ? (
        // LISTINGS MODERATION
        <div className="table-container">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Developer</th>
                <th>Village</th>
                <th>Starting Price</th>
                <th>Verified?</th>
                <th>PlotIt Score</th>
                <th>Listing Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(proj => (
                <tr key={proj.id}>
                  <td><strong>{proj.name}</strong></td>
                  <td>{proj.developer}</td>
                  <td>{proj.village}</td>
                  <td>{formatCurrency(proj.startingPrice)}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: proj.verified ? 'var(--color-active)' : 'var(--text-muted)' }}>
                      {proj.verified ? <ShieldCheck size={16} color="var(--brand-primary)" /> : <ShieldAlert size={16} />}
                      {proj.verified ? 'GPS-Verified' : 'Pending Verification'}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--accent-gold)' }}>★ {proj.plotItScore}</strong>
                  </td>
                  <td>
                    <span className={`badge ${proj.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                      {proj.status === 'Active' ? 'Live' : 'Sold Out'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // PIPELINE FUNNEL TRACKING
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '-8px' }}>User Acquisition Funnel Metrics</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '20px' }}>📱</span>
              <strong style={{ display: 'block', fontSize: '16px', margin: '4px 0' }}>14,200</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Meta Ads Clicks</span>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', borderLeft: '2px solid var(--brand-primary)' }}>
              <span style={{ fontSize: '20px' }}>📥</span>
              <strong style={{ display: 'block', fontSize: '16px', margin: '4px 0' }}>2,450</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>App Installs</span>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '20px' }}>👤</span>
              <strong style={{ display: 'block', fontSize: '16px', margin: '4px 0' }}>850</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Signups (OTP)</span>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '20px' }}>🗓️</span>
              <strong style={{ display: 'block', fontSize: '16px', margin: '4px 0' }}>{totalBookedVisits}</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Site Visits Booked</span>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '20px' }}>🤝</span>
              <strong style={{ display: 'block', fontSize: '16px', margin: '4px 0' }}>{approvedCashbacks.length + cashbacks.filter(c => c.status === 'Pending Verification').length}</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Purchase Deeds</span>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '20px' }}>🎁</span>
              <strong style={{ display: 'block', fontSize: '16px', margin: '4px 0' }}>{approvedCashbacks.length}</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cashbacks Payout</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '13px', marginBottom: '10px' }}>Platform Conversions & CAC</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Visitor-to-Lead Rate</span>
                <strong style={{ display: 'block', fontSize: '16px', marginTop: '4px', color: 'var(--brand-primary)' }}>17.4%</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Meta Ad CAC (Est)</span>
                <strong style={{ display: 'block', fontSize: '16px', marginTop: '4px', color: 'var(--brand-primary)' }}>₹350 / lead</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Platform Net Commission</span>
                <strong style={{ display: 'block', fontSize: '16px', marginTop: '4px', color: 'var(--brand-primary)' }}>1.0% per Transaction</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
