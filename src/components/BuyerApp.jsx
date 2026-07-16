import React, { useState } from 'react';
import BuyerMap from './BuyerMap';
import {
  Search, Filter, Map, List, Compass, Star, ChevronLeft, Calendar,
  MapPin, Gift, Phone, Check, RefreshCw, X, Download, ZoomIn, MessageSquare
} from 'lucide-react';

function BuyerApp({ projects, leads, visits, cashbacks, addLead, updateLead, addVisit, addCashback }) {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'map', 'cashback'
  const [selectedProject, setSelectedProject] = useState(null);

  // Filter Drawer & Search State
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    budgetMax: 3000000,
    distanceMax: 10,
    minSize: 0,
    facing: 'Any',
    bankLoan: false,
    naPlot: false,
    minScore: 0
  });

  // Modals
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', date: '', time: '11:00 AM' });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [cashbackForm, setCashbackForm] = useState({ buyerName: '', buyerPhone: '', purchasePrice: '', documentName: '', projectId: '' });
  const [cashbackSuccess, setCashbackSuccess] = useState(false);

  // Detail View State
  const [layoutZoomed, setLayoutZoomed] = useState(false);

  // Filter Logic
  const filteredProjects = projects.filter(p => {
    // Only show approved properties
    const isApproved = p.status === 'approved';
    if (!isApproved) return false;

    // Search query matches project name, village, area, developer
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(q) ||
      p.village.toLowerCase().includes(q) ||
      p.area.toLowerCase().includes(q) ||
      p.developer.toLowerCase().includes(q);

    // Budget
    const matchesBudget = p.startingPrice <= filters.budgetMax;

    // Distance
    const matchesDistance = p.distance <= filters.distanceMax;

    // Size
    const matchesSize = p.sizeMin >= filters.minSize;

    // Status filters
    const matchesBankLoan = !filters.bankLoan || p.bankLoan;
    const matchesNaPlot = !filters.naPlot || p.naPlot;
    const matchesScore = p.DruvioScore >= filters.minScore;

    return matchesSearch && matchesBudget && matchesDistance && matchesSize && matchesFacing && matchesBankLoan && matchesNaPlot && matchesScore;
  });

  // Handle booking form submission
  const handleBookVisit = (e) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone || !bookingForm.date) {
      alert("Please fill all details!");
      return;
    }

    const newVisit = {
      buyerName: bookingForm.name,
      buyerPhone: bookingForm.phone,
      date: bookingForm.date,
      time: bookingForm.time,
      project: selectedProject.name,
      projectId: selectedProject.id,
      projectOwnerId: selectedProject.ownerId || '',
      status: "Scheduled"
    };

    addVisit(newVisit);

    // Also register or update Lead pipeline
    const existingLead = leads.find(l => l.phone === bookingForm.phone);
    if (!existingLead) {
      const newLead = {
        name: bookingForm.name,
        phone: bookingForm.phone,
        budget: `₹${(selectedProject.startingPrice / 100000).toFixed(0)}L+`,
        stage: "Book Visit",
        date: new Date().toISOString().split('T')[0],
        project: selectedProject.name,
        projectId: selectedProject.id,
        projectOwnerId: selectedProject.ownerId || ''
      };
      addLead(newLead);
    } else {
      // Update existing lead stage
      updateLead({ ...existingLead, stage: "Book Visit", project: selectedProject.name, projectId: selectedProject.id, projectOwnerId: selectedProject.ownerId || '' });
    }

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setShowBookingModal(false);
      setBookingForm({ name: '', phone: '', date: '', time: '11:00 AM' });
    }, 2000);
  };

  // Handle cashback submission
  const handleCashbackSubmit = (e) => {
    e.preventDefault();
    if (!cashbackForm.buyerName || !cashbackForm.buyerPhone || !cashbackForm.purchasePrice || !cashbackForm.projectId || !cashbackForm.documentName) {
      alert("Please fill all fields and select your agreement document!");
      return;
    }

    const proj = projects.find(p => p.id === cashbackForm.projectId);
    const purchaseVal = parseFloat(cashbackForm.purchasePrice);
    const cbVal = Math.round(purchaseVal * 0.01);

    const newClaim = {
      buyerName: cashbackForm.buyerName,
      buyerPhone: cashbackForm.buyerPhone,
      project: proj ? proj.name : "Custom Project",
      projectId: proj?.id || '',
      projectOwnerId: proj?.ownerId || '',
      purchasePrice: purchaseVal,
      cashbackAmount: cbVal,
      commissionAmount: cbVal, // Druvio keeps 1%
      documentName: cashbackForm.documentName,
      submittedAt: new Date().toISOString().split('T')[0],
      status: "Pending Verification"
    };

    addCashback(newClaim);

    // Update lead stage to Purchased / Cashback Claimed
    const existingLead = leads.find(l => l.phone === cashbackForm.buyerPhone);
    if (!existingLead) {
      addLead({
        name: cashbackForm.buyerName,
        phone: cashbackForm.buyerPhone,
        budget: `₹${(purchaseVal / 100000).toFixed(0)}L`,
        stage: "Negotiation",
        date: new Date().toISOString().split('T')[0],
        project: proj ? proj.name : "Druvio Verified",
        projectId: proj?.id || '',
        projectOwnerId: proj?.ownerId || ''
      });
    }

    setCashbackSuccess(true);
    setTimeout(() => {
      setCashbackSuccess(false);
      setCashbackForm({ buyerName: '', buyerPhone: '', purchasePrice: '', documentName: '', projectId: '' });
      setActiveTab('feed');
    }, 2500);
  };

  // Format currency in Indian Style (Lakh / Crore)
  const formatINR = (num) => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(num / 100000).toFixed(1)} Lakh`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}>

      {/* PHONE STATUS BAR SPACE */}
      <div style={{ height: '24px', background: '#0b0f19', flexShrink: 0 }} />

      {/* HEADER */}
      {selectedProject ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
          <button onClick={() => setSelectedProject(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={20} />
            <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: '4px' }}>Back</span>
          </button>
          <div style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'var(--font-title)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Druvio
          </div>
          <a href={`https://wa.me/919999999999?text=Hi, I am interested in ${encodeURIComponent(selectedProject.name)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', padding: '6px', background: '#128C7E', borderRadius: '50%', color: 'white' }}>
            <MessageSquare size={16} />
          </a>
        </div>
      ) : (
        <div style={{ padding: '14px 16px 8px', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={22} style={{ color: 'var(--brand-primary)' }} />
              <div>
                <h2 style={{ fontSize: '16px', fontFamily: 'var(--font-title)', fontWeight: '800', letterSpacing: '0.5px', color: 'var(--text-primary)' }}>
                  Dru<span style={{ color: 'var(--brand-primary)' }}>vio</span>
                </h2>
                <p style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Hyperlocal Land Hub</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab(activeTab === 'map' ? 'feed' : 'map')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                color: 'var(--text-primary)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {activeTab === 'map' ? <List size={12} /> : <Map size={12} />}
              {activeTab === 'map' ? 'Feed' : 'Map View'}
            </button>
          </div>

          {activeTab !== 'cashback' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search village, project, builder..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '6px 10px 6px 30px',
                    color: 'white',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
                {searchQuery && (
                  <X
                    size={12}
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '10px', color: 'var(--text-muted)', cursor: 'pointer' }}
                  />
                )}
              </div>
              <button
                onClick={() => setShowFilters(true)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  padding: '6px 10px',
                  borderRadius: '50%',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Filter size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* CORE VIEW AREA */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>

        {/* DETAIL SCREEN OVERLAY */}
        {selectedProject ? (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-dark)' }}>

            {/* HERO HERO IMAGE */}
            <div style={{ position: 'relative', width: '100%', height: '180px', flexShrink: 0 }}>
              <img
                src={selectedProject.heroImage}
                alt={selectedProject.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, rgba(11,15,25,1) 0%, rgba(11,15,25,0) 100%)' }} />

              {/* Floating Verified Tag */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: selectedProject.verified ? 'var(--color-active)' : 'var(--color-sold)',
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {selectedProject.verified ? '✓ GPS Verified' : 'Unverified'}
              </div>

              {/* Status Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: selectedProject.status === 'Active' ? 'rgba(34,197,94,0.95)' : 'rgba(100,116,139,0.95)',
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  textTransform: 'uppercase'
                }}
              >
                {selectedProject.status}
              </div>
            </div>

            {/* DETAIL DATA CONTENT */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Title & Price Header */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', lineHeight: '1.2' }}>{selectedProject.name}</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <MapPin size={12} color="var(--brand-primary)" />
                  {selectedProject.area}, {selectedProject.village} (Chakan)
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', background: 'var(--bg-card)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Starting Price</span>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--brand-primary)' }}>{formatINR(selectedProject.startingPrice)}</span>
                  </div>
                  <div style={{ textAlign: 'right', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Price per Sq.Ft</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>₹{selectedProject.pricePerSqFt} / sqft</span>
                  </div>
                </div>
              </div>

              {/* USP SIGNATURE FEATURE: Druvio Score Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(21, 31, 50, 0.7) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '16px',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Star size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Druvio Score
                    </h4>
                  </div>
                  <div style={{ background: 'var(--accent-gold)', color: 'black', fontWeight: '800', fontSize: '15px', padding: '2px 10px', borderRadius: '20px', fontFamily: 'var(--font-title)' }}>
                    {selectedProject.DruvioScore} / 100
                  </div>
                </div>

                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '12px' }}>
                  Objective benchmark analyzing safety, facilities, connectivity, and local market price value.
                </p>

                {/* Score Breakdown Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', marginBottom: '2px' }}>
                      <span>Legal Compliance (NA Sanction, RERA, Clear Title)</span>
                      <strong>{selectedProject.naPlot && selectedProject.bankLoan ? '30/30' : selectedProject.naPlot ? '20/30' : '5/30'}</strong>
                    </div>
                    <div style={{ height: '4px', background: 'var(--bg-input)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', background: 'var(--brand-primary)', width: selectedProject.naPlot && selectedProject.bankLoan ? '100%' : selectedProject.naPlot ? '66%' : '16%', borderRadius: '2px' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', marginBottom: '2px' }}>
                      <span>Infrastructure (Tar Roads, Drainage, Power, Water)</span>
                      <strong>{Math.min(selectedProject.amenities.length * 5, 30)}/30</strong>
                    </div>
                    <div style={{ height: '4px', background: 'var(--bg-input)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', background: 'var(--brand-primary)', width: `${Math.min((selectedProject.amenities.length * 5 / 30) * 100, 100)}%`, borderRadius: '2px' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', marginBottom: '2px' }}>
                      <span>Location Connectivity (Highway, MIDC, Schools)</span>
                      <strong>{selectedProject.distance <= 3 ? '20/20' : selectedProject.distance <= 6 ? '15/20' : '10/20'}</strong>
                    </div>
                    <div style={{ height: '4px', background: 'var(--bg-input)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', background: 'var(--brand-primary)', width: selectedProject.distance <= 3 ? '100%' : selectedProject.distance <= 6 ? '75%' : '50%', borderRadius: '2px' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', marginBottom: '2px' }}>
                      <span>Price Competitiveness (vs Chakan Average)</span>
                      <strong>{selectedProject.pricePerSqFt <= 1000 ? '20/20' : selectedProject.pricePerSqFt <= 1500 ? '15/20' : '10/20'}</strong>
                    </div>
                    <div style={{ height: '4px', background: 'var(--bg-input)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', background: 'var(--brand-primary)', width: selectedProject.pricePerSqFt <= 1000 ? '100%' : selectedProject.pricePerSqFt <= 1500 ? '75%' : '50%', borderRadius: '2px' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Attributes Panel */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>Remaining Inventory</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: selectedProject.remainingPlots > 0 ? 'var(--color-active)' : 'var(--text-muted)' }}>
                    {selectedProject.remainingPlots > 0 ? `🟢 ${selectedProject.remainingPlots} / ${selectedProject.totalPlots} Plots` : '🔴 Sold Out'}
                  </span>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>Plot Sizes</span>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>{selectedProject.sizeMin} - {selectedProject.sizeMax} sqft</span>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>Facing Directions</span>
                  <span style={{ fontSize: '12px', fontWeight: '700' }}>{selectedProject.facing.join(', ')}</span>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>NA / Gunthewari Status</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-primary)' }}>
                    {selectedProject.naPlot ? '✅ Non-Agricultural' : 'Collector NA Pending'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>Project Overview</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {selectedProject.description}
                </p>
              </div>

              {/* Layout plan viewer */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700' }}>Layout Plan</h4>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tap image to simulate zoom</span>
                </div>
                <div className="layout-image-container">
                  <img
                    src={selectedProject.layoutPlanUrl}
                    alt="Layout Plan"
                    className={`layout-image ${layoutZoomed ? 'zoomed' : ''}`}
                    onClick={() => setLayoutZoomed(!layoutZoomed)}
                  />
                  <div className="layout-overlay-btn" onClick={() => setLayoutZoomed(!layoutZoomed)}>
                    <ZoomIn size={12} />
                    {layoutZoomed ? 'Zoom Out' : 'Zoom Layout'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={() => alert("Downloading PDF Layout copy to mobile storage...")}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'white',
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={12} />
                    Download PDF Map
                  </button>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Project Infrastructure</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {selectedProject.amenities.map((amenity, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                      <div style={{ display: 'flex', background: 'var(--brand-glow)', border: '1px solid var(--brand-primary)', padding: '2px', borderRadius: '50%' }}>
                        <Check size={10} color="var(--brand-primary)" strokeWidth={3} />
                      </div>
                      <span style={{ color: 'var(--text-primary)' }}>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Hubs */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Nearby Hubs (Hyperlocal Connectivity)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>🏭 Chakan MIDC Zone</span>
                    <strong style={{ color: 'white' }}>{selectedProject.nearby.midc}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>🛣️ Pune-Nashik Highway</span>
                    <strong style={{ color: 'white' }}>{selectedProject.nearby.highway}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>🏥 Hospital Support</span>
                    <strong style={{ color: 'white' }}>{selectedProject.nearby.hospitals}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>🏫 Educational Institute</span>
                    <strong style={{ color: 'white' }}>{selectedProject.nearby.schools}</strong>
                  </div>
                </div>
              </div>

              {/* CTA Booking bar */}
              {selectedProject.status === 'Active' ? (
                <div style={{ display: 'flex', gap: '10px', position: 'sticky', bottom: 0, background: 'var(--bg-dark)', padding: '10px 0 0 0', borderTop: '1px solid var(--border-color)' }}>
                  <a
                    href={`https://wa.me/919999999999?text=Hello,%20I%20want%20to%20know%20more%20about%20your%20plotting%20project%20"${encodeURIComponent(selectedProject.name)}"%20listed%20on%20Druvio.`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: '#128C7E',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 10px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <MessageSquare size={16} />
                    WhatsApp Dev
                  </a>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="btn-primary"
                    style={{ flex: 1.5, padding: '12px 10px', fontSize: '12px' }}
                  >
                    <Calendar size={16} />
                    Book Free Site Visit
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '12px', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                  This project is completely sold out.
                </div>
              )}

              {/* Spacer */}
              <div style={{ height: '30px' }} />
            </div>
          </div>
        ) : activeTab === 'map' ? (
          // INTERACTIVE MAP SCREEN
          <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
            <BuyerMap
              projects={filteredProjects}
              onSelectProject={setSelectedProject}
              selectedProject={null}
            />
          </div>
        ) : activeTab === 'cashback' ? (
          // CASHBACK CLAIM SCREEN
          <div className="fade-in" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--brand-light)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
              <Gift size={32} color="var(--brand-primary)" style={{ margin: '0 auto 8px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '800' }}>1% Plot Purchase Cashback</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '6px' }}>
                Bought a plot via Druvio? Submit your agreement document or token receipt to claim your **1% direct cash cashback** verified by our admin.
              </p>
            </div>

            <form onSubmit={handleCashbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Select Druvio Project</label>
                <select
                  className="form-input"
                  value={cashbackForm.projectId}
                  onChange={(e) => setCashbackForm({ ...cashbackForm, projectId: e.target.value })}
                >
                  <option value="">-- Choose Project --</option>
                  {projects.filter(p => p.status === 'Active').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Purchaser Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter name matching agreement"
                  value={cashbackForm.buyerName}
                  onChange={(e) => setCashbackForm({ ...cashbackForm, buyerName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Purchaser Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Enter registered mobile"
                  value={cashbackForm.buyerPhone}
                  onChange={(e) => setCashbackForm({ ...cashbackForm, buyerPhone: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Plot Purchase Price (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Example: 1200000"
                  value={cashbackForm.purchasePrice}
                  onChange={(e) => setCashbackForm({ ...cashbackForm, purchasePrice: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Upload Purchase Receipt / Agreement</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const name = prompt("Enter simulated file name:", "plot_agreement_stamp.pdf");
                      if (name) setCashbackForm({ ...cashbackForm, documentName: name });
                    }}
                    style={{
                      flex: 1,
                      background: 'var(--bg-input)',
                      border: '1px dashed var(--border-color)',
                      color: 'var(--text-secondary)',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    {cashbackForm.documentName ? `📁 ${cashbackForm.documentName}` : "📎 Select Document (PDF/JPG)"}
                  </button>
                </div>
              </div>

              {cashbackSuccess ? (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid var(--color-active)', color: 'var(--color-active)', padding: '10px', borderRadius: '8px', fontSize: '11px', textAlign: 'center', fontWeight: 'bold' }}>
                  🎉 Cashback Claim Submitted! Redirecting...
                </div>
              ) : (
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                  Claim 1% Cashback
                </button>
              )}
            </form>
            <div style={{ height: '30px' }} />
          </div>
        ) : (
          // FEED VIEW (DEFAULT HOME)
          <div className="fade-in" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                Showing {filteredProjects.length} Verified Plot Projects
              </span>
              {searchQuery && (
                <span onClick={() => setSearchQuery('')} style={{ fontSize: '10px', color: 'var(--brand-primary)', cursor: 'pointer' }}>
                  Clear Search
                </span>
              )}
            </div>

            {filteredProjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                <Compass size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No plotting projects match your current filters.</p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'transform 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  {/* Card Image banner */}
                  <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                    <img
                      src={project.heroImage}
                      alt={project.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Druvio Score floating badge */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(15,23,42,0.9)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(245,158,11,0.4)',
                        color: 'var(--accent-gold)',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Star size={10} fill="var(--accent-gold)" color="var(--accent-gold)" />
                      {project.DruvioScore}
                    </div>

                    {/* Verified stamp */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(16, 185, 129, 0.9)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '9px',
                        fontWeight: '700'
                      }}
                    >
                      ✓ Verified Plots
                    </div>
                  </div>

                  {/* Card Info details */}
                  <div style={{ padding: '14px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800' }}>{project.name}</h3>
                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                      <MapPin size={10} />
                      {project.village} • {project.distance} km from Chakan Circle
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                      <div>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>Starting From</span>
                        <strong style={{ fontSize: '14px', color: 'var(--brand-primary)' }}>{formatINR(project.startingPrice)}</strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>Available Plots</span>
                        <strong style={{ fontSize: '11px', color: project.remainingPlots > 0 ? 'var(--color-active)' : 'var(--text-muted)' }}>
                          {project.remainingPlots > 0 ? `${project.remainingPlots} Remaining` : 'Sold Out'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {/* spacer */}
            <div style={{ height: '30px' }} />
          </div>
        )}
      </div>

      {/* FOOTER TAB NAV BAR */}
      {!selectedProject && (
        <div className="buyer-nav">
          <div
            className={`buyer-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <Compass size={18} />
            <span>Explore Plots</span>
          </div>
          <div
            className={`buyer-nav-item ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <Map size={18} />
            <span>Map Center</span>
          </div>
          <div
            className={`buyer-nav-item ${activeTab === 'cashback' ? 'active' : ''}`}
            onClick={() => setActiveTab('cashback')}
          >
            <Gift size={18} />
            <span>1% Cashback</span>
          </div>
        </div>
      )}

      {/* FILTER DRAWER SLIDE-UP */}
      {showFilters && (
        <div
          className="fade-in"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2000,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'flex-end'
          }}
        >
          <div
            className="slide-up"
            style={{
              width: '100%',
              background: 'var(--bg-sidebar)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              borderTop: '1px solid var(--border-color)',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 -10px 25px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Filter Plot Listings</h3>
              <button
                onClick={() => setShowFilters(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>

              {/* Budget Range */}
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Max Budget: <strong style={{ color: 'var(--brand-primary)' }}>{formatINR(filters.budgetMax)}</strong>
                </label>
                <input
                  type="range"
                  min="800000"
                  max="3000000"
                  step="100000"
                  value={filters.budgetMax}
                  onChange={(e) => setFilters({ ...filters, budgetMax: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              {/* Distance Range */}
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Max Distance: <strong style={{ color: 'var(--brand-primary)' }}>{filters.distanceMax} km</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={filters.distanceMax}
                  onChange={(e) => setFilters({ ...filters, distanceMax: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              {/* Facing */}
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Plot Facing</label>
                <select
                  className="form-input"
                  value={filters.facing}
                  onChange={(e) => setFilters({ ...filters, facing: e.target.value })}
                >
                  <option value="Any">Any Direction</option>
                  <option value="East">East Facing</option>
                  <option value="North">North Facing</option>
                  <option value="West">West Facing</option>
                </select>
              </div>

              {/* Score benchmark */}
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Min Druvio Score: <strong style={{ color: 'var(--accent-gold)' }}>{filters.minScore}+</strong>
                </label>
                <select
                  className="form-input"
                  value={filters.minScore}
                  onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                >
                  <option value="0">Show All Listings</option>
                  <option value="60">Good Score (60+)</option>
                  <option value="75">Great Score (75+)</option>
                  <option value="90">Elite Score (90+)</option>
                </select>
              </div>

              {/* Legal/Verified Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filters.naPlot}
                    onChange={(e) => setFilters({ ...filters, naPlot: e.target.checked })}
                    style={{ accentColor: 'var(--brand-primary)' }}
                  />
                  <span>Sanctioned NA Plots (Non-Agricultural)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filters.bankLoan}
                    onChange={(e) => setFilters({ ...filters, bankLoan: e.target.checked })}
                    style={{ accentColor: 'var(--brand-primary)' }}
                  />
                  <span>Bank Loan Pre-Approved</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => {
                  setFilters({
                    budgetMax: 3000000,
                    distanceMax: 10,
                    minSize: 0,
                    facing: 'Any',
                    bankLoan: false,
                    naPlot: false,
                    minScore: 0
                  });
                  setShowFilters(false);
                }}
                className="btn-secondary"
                style={{ flex: 1, padding: '10px' }}
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="btn-primary"
                style={{ flex: 1, padding: '10px' }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOK SITE VISIT MODAL */}
      {showBookingModal && (
        <div
          className="fade-in"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 3000,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              background: 'var(--bg-sidebar)',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800' }}>Schedule Site Visit</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {bookingSuccess ? (
              <div style={{ padding: '20px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: 'var(--brand-glow)', border: '1px solid var(--brand-primary)', padding: '8px', borderRadius: '50%' }}>
                  <Check size={24} color="var(--brand-primary)" strokeWidth={3} />
                </div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-active)' }}>Visit Confirmed!</h4>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>We've shared details on your phone.</p>
              </div>
            ) : (
              <form onSubmit={handleBookVisit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  A Druvio field executive will meet you at the site location of **{selectedProject.name}** and show you the exact physical plot boundaries.
                </p>

                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="form-input"
                    required
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    className="form-input"
                    required
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <select
                    className="form-input"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                  >
                    <option value="09:00 AM">09:00 AM (Morning)</option>
                    <option value="11:00 AM">11:00 AM (Morning)</option>
                    <option value="02:00 PM">02:00 PM (Afternoon)</option>
                    <option value="04:30 PM">04:30 PM (Evening)</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '6px' }}>
                  Confirm Booking
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerApp;
