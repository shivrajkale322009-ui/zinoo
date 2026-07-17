import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Building,
  Calendar,
  Check,
  ClipboardList,
  Edit,
  IndianRupee,
  Layers,
  LayoutDashboard,
  ListPlus,
  MapPin,
  MessageSquareMore,
  PhoneCall,
  Plus,
  ShieldCheck,
  ShieldX,
  Save,
  User,
  Users
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import EditProfileModal from './EditProfileModal';

const createProjectDraft = (developer) => ({
  name: '',
  developer: developer || 'Shivraj Land Developers',
  village: '',
  area: '',
  latitude: 18.7889,
  longitude: 73.8568,
  startingPrice: 1000000,
  pricePerSqFt: 1000,
  distance: 3.5,
  remainingPlots: 20,
  totalPlots: 40,
  sizeMin: 1200,
  sizeMax: 2400,
  facing: 'East, North',
  bankLoan: true,
  naPlot: true,
  verified: true,
  amenities: 'Water Supply Connection, Electricity Line, 9m Tar Road, Street Lights',
  nearbySchools: '',
  nearbyHospitals: '',
  nearbyMIDC: '',
  nearbyHighway: '',
  description: '',
  thumbnail: '',
  cashbackPercentage: '',
  cashbackAmount: '',
  whatsappNumber: '',
  siteVisitContact: '',
  googleMapsLink: '',
  website: '',
  reraNumber: '',
  heroImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  layoutPlanUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80'
});

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatLakhs = (value) => `₹${(toNumber(value) / 100000).toFixed(1)}L`;

const normalizeAmenities = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

const formatCashback = (project) => {
  if (project.cashbackPercentage) return `${project.cashbackPercentage}% Cashback`;
  if (project.cashbackAmount) return `₹${new Intl.NumberFormat('en-IN').format(project.cashbackAmount)} Cashback`;
  return '';
};

const stageClassName = (stage) => {
  if (stage === 'Purchased') return 'badge-success';
  if (stage === 'Visit Done') return 'badge-info';
  if (stage === 'Book Visit' || stage === 'Scheduled') return 'badge-warning';
  return 'badge-danger';
};

const getProjectBadgeClass = (status) => {
  if (status === 'approved' || status === 'Active') return 'badge-success';
  if (status === 'rejected' || status === 'Sold Out') return 'badge-danger';
  return 'badge-warning';
};

const formatProjectStatus = (status) => {
  if (status === 'approved') return 'Approved';
  if (status === 'pending_review') return 'Pending Review';
  if (status === 'rejected') return 'Rejected';
  return status || 'Active';
};

function SellerDashboard({
  projects,
  leads,
  visits,
  updateProject,
  addProject,
  isAdminView = false,
  selectedSeller = null,
  onBackToAdmin,
  onSelectedSellerChange
}) {
  const [activeTab, setActiveTab] = useState('listings');
  const [editingProject, setEditingProject] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSellerProfileEditor, setShowSellerProfileEditor] = useState(false);

  const developerName = projects[0]?.developer || 'Shivraj Land Developers';
  const [newProject, setNewProject] = useState(() => createProjectDraft(developerName));

  const myProjects = useMemo(() => projects, [projects]);
  const myLeads = useMemo(() => leads, [leads]);
  const myVisits = useMemo(() => visits, [visits]);

  const totalPlotsForSale = useMemo(
    () => myProjects.reduce((acc, project) => acc + toNumber(project.remainingPlots), 0),
    [myProjects]
  );
  const totalInventory = useMemo(
    () => myProjects.reduce((acc, project) => acc + toNumber(project.totalPlots), 0),
    [myProjects]
  );
  const totalLeads = myLeads.length;
  const pendingVisits = myVisits.filter((visit) => visit.status === 'Scheduled').length;
  const pendingReviewCount = myProjects.filter((project) => project.status === 'pending_review').length;
  const conversionRate = totalLeads ? Math.round((myLeads.filter((lead) => lead.stage === 'Purchased').length / totalLeads) * 100) : 0;
  const fillRate = totalInventory ? Math.round((totalPlotsForSale / totalInventory) * 100) : 0;

  const showToast = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  const handleEditClick = (project) => {
    setEditingProject({ ...project });
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    updateProject({
      ...editingProject,
      startingPrice: toNumber(editingProject.startingPrice),
      pricePerSqFt: toNumber(editingProject.pricePerSqFt),
      remainingPlots: toNumber(editingProject.remainingPlots),
      totalPlots: toNumber(editingProject.totalPlots),
      status: isAdminView ? editingProject.status : 'pending_review'
    });
    setEditingProject(null);
    showToast();
  };

  const handleApproveProject = async (projectId) => {
    await updateDoc(doc(db, 'projects', projectId), {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    showToast();
  };

  const handleRejectProject = async (projectId) => {
    await updateDoc(doc(db, 'projects', projectId), {
      status: 'rejected',
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    showToast();
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    const createdProject = {
      name: newProject.name.trim(),
      developer: newProject.developer,
      village: newProject.village.trim(),
      area: newProject.area.trim(),
      coords: [toNumber(newProject.latitude, 18.7889), toNumber(newProject.longitude, 73.8568)],
      startingPrice: toNumber(newProject.startingPrice),
      pricePerSqFt: toNumber(newProject.pricePerSqFt),
      distance: toNumber(newProject.distance),
      remainingPlots: toNumber(newProject.remainingPlots),
      totalPlots: toNumber(newProject.totalPlots),
      sizeMin: toNumber(newProject.sizeMin),
      sizeMax: toNumber(newProject.sizeMax),
      facing: newProject.facing.split(',').map((face) => face.trim()).filter(Boolean),
      bankLoan: newProject.bankLoan,
      naPlot: newProject.naPlot,
      verified: newProject.verified,
      amenities: newProject.amenities.split(',').map((item) => item.trim()).filter(Boolean),
      nearby: {
        schools: newProject.nearbySchools || 'ZP School (2.0 km)',
        hospitals: newProject.nearbyHospitals || 'Rural Hospital (3.0 km)',
        midc: newProject.nearbyMIDC || 'Chakan MIDC (1.5 km)',
        highway: newProject.nearbyHighway || 'Pune-Nashik Highway (2.0 km)'
      },
      updated: 'Just now',
      status: isAdminView ? 'approved' : 'pending_review',
      thumbnail: newProject.thumbnail || newProject.heroImage,
      heroImage: newProject.heroImage,
      description: newProject.description || 'Freshly listed residential plotting development near Chakan.',
      cashbackPercentage: toNumber(newProject.cashbackPercentage),
      cashbackAmount: toNumber(newProject.cashbackAmount),
      whatsappNumber: newProject.whatsappNumber,
      siteVisitContact: newProject.siteVisitContact,
      googleMapsLink: newProject.googleMapsLink,
      website: newProject.website,
      reraNumber: newProject.reraNumber,
      layoutPlanUrl: newProject.layoutPlanUrl,
      DruvioScore: 4.6
    };

    addProject(createdProject);
    setNewProject(createProjectDraft(developerName));
    setActiveTab('listings');
    showToast();
  };

  const metrics = isAdminView
    ? [
      {
        label: 'Seller Projects',
        value: myProjects.length,
        helper: developerName,
        icon: <Building size={20} color="var(--brand-primary)" />
      },
      {
        label: 'Remaining Inventory',
        value: totalPlotsForSale,
        helper: totalInventory ? `${fillRate}% of layout still sellable` : 'Unsold plots',
        icon: <Layers size={20} color="var(--accent-gold)" />
      },
      {
        label: 'Approved Listings',
        value: myProjects.filter((project) => project.status === 'approved' || project.status === 'Active').length,
        helper: 'Visible to buyers',
        icon: <ShieldCheck size={20} color="#10b981" />
      },
      {
        label: 'Pending Review',
        value: pendingReviewCount,
        helper: 'Awaiting admin action',
        icon: <ClipboardList size={20} color="#a855f7" />
      }
    ]
    : [
      {
        label: 'Active Projects',
        value: myProjects.length,
        helper: developerName,
        icon: <Building size={20} color="var(--brand-primary)" />
      },
      {
        label: 'Remaining Inventory',
        value: totalPlotsForSale,
        helper: totalInventory ? `${fillRate}% of layout still sellable` : 'Unsold plots',
        icon: <Layers size={20} color="var(--accent-gold)" />
      },
      {
        label: 'Total Platform Leads',
        value: totalLeads,
        helper: totalLeads ? `${conversionRate}% converted so far` : 'Buyer enquiries tracked in Druvio',
        icon: <Users size={20} color="#3b82f6" />
      },
      {
        label: 'Booked Site Visits',
        value: pendingVisits,
        helper: myVisits.length ? `${myVisits.length} total visits tracked` : 'Scheduled visits',
        icon: <Calendar size={20} color="#a855f7" />
      }
    ];

  const onboardingItems = [
    'Add your first project with location, price, and inventory.',
    'Upload clear layout plan and hero image for better trust.',
    'Keep pricing and approval status updated as soon as the listing goes live.'
  ];

  const selectTab = (tab) => {
    setActiveTab(tab);
    setEditingProject(null);
  };

  return (
    <div className="seller-dashboard seller-workspace">
      <aside className="seller-desktop-sidebar" aria-label="Seller workspace navigation">
        <div className="seller-sidebar-brand">
          <div className="seller-brand-mark"><Building size={19} /></div>
          <div>
            <span>Druvio</span>
            <strong>Seller studio</strong>
          </div>
        </div>

        <div className="seller-sidebar-account">
          <span className="seller-sidebar-avatar">{developerName.charAt(0)}</span>
          <div>
            <strong>{developerName}</strong>
            <span>Property partner</span>
          </div>
        </div>

        <nav className="seller-sidebar-nav">
          <span className="seller-sidebar-label">Workspace</span>
          <button type="button" className={`seller-sidebar-link ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => selectTab('listings')}>
            <LayoutDashboard size={17} /> Overview
          </button>
          <button type="button" className={`seller-sidebar-link ${activeTab === 'add' ? 'active' : ''}`} onClick={() => selectTab('add')}>
            <ListPlus size={17} /> Create listing
          </button>
          {!isAdminView && (
            <button type="button" className={`seller-sidebar-link ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => selectTab('leads')}>
              <MessageSquareMore size={17} /> Leads <span>{totalLeads}</span>
            </button>
          )}
          {!isAdminView && (
            <button type="button" className={`seller-sidebar-link ${activeTab === 'visits' ? 'active' : ''}`} onClick={() => selectTab('visits')}>
              <Calendar size={17} /> Site visits <span>{myVisits.length}</span>
            </button>
          )}
        </nav>

        <div className="seller-sidebar-tip">
          <BarChart3 size={18} />
          <strong>Keep listings fresh</strong>
          <p>Updated inventory helps buyers make faster decisions.</p>
        </div>
      </aside>

      <main className="seller-workspace-main">
        <header className="seller-desktop-topbar">
          <div>
            <span className="seller-topbar-kicker">{isAdminView ? 'Admin view' : 'Seller workspace'}</span>
            <h1>{activeTab === 'add' ? 'Create a listing' : activeTab === 'leads' ? 'Lead pipeline' : activeTab === 'visits' ? 'Visit calendar' : 'Portfolio overview'}</h1>
          </div>
          <button type="button" className="btn-primary" onClick={() => selectTab('add')}>
            <Plus size={16} /> New listing
          </button>
        </header>
      {isAdminView && selectedSeller && (
        <section className="seller-panel seller-content-panel" style={{ marginBottom: '16px' }}>
          <div className="seller-panel-heading">
            <div>
              <span className="seller-section-kicker">Admin seller context</span>
              <h3>{selectedSeller.displayName || selectedSeller.name || selectedSeller.businessName || 'Seller account'}</h3>
              <p style={{ marginTop: '6px', color: 'var(--text-secondary)' }}>
                Review the existing seller workspace with admin permissions still enabled.
              </p>
            </div>
            <div className="seller-form-actions">
              <button type="button" className="btn-secondary" onClick={onBackToAdmin}>
                <ArrowLeft size={16} /> Seller list
              </button>
              <button type="button" className="btn-primary" onClick={() => setShowSellerProfileEditor(true)}>
                <User size={16} /> Edit seller
              </button>
            </div>
          </div>

          <div className="seller-project-stats">
            <div>
              <span>Business</span>
              <strong>{selectedSeller.businessName || 'Not provided'}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{selectedSeller.email || 'Not provided'}</strong>
            </div>
            <div>
              <span>Phone</span>
              <strong>{selectedSeller.phoneNumber || selectedSeller.phone || 'Not provided'}</strong>
            </div>
            <div>
              <span>Pending approvals</span>
              <strong>{pendingReviewCount}</strong>
            </div>
          </div>
        </section>
      )}

      <section className="seller-hero">
        <div className="seller-hero-copy">
          <span className="seller-eyebrow">{isAdminView ? 'Seller workspace - admin mode' : 'Seller workspace'}</span>
          <h2>{isAdminView ? 'Manage seller projects from the existing dashboard.' : 'Manage projects, leads, and visits from one cleaner dashboard.'}</h2>
          <p>
            {isAdminView
              ? 'Review seller activity, approve listings, and update seller information using the existing seller flow.'
              : 'Keep inventory updated, monitor buyer interest, and make your listings feel active even before the first lead arrives.'}
          </p>
          <div className="seller-hero-actions">
            <button type="button" className="btn-primary" onClick={() => { setActiveTab('add'); setEditingProject(null); }}>
              <Plus size={16} /> Add project
            </button>
            {isAdminView ? (
              <button type="button" className="btn-secondary" onClick={() => { setActiveTab('listings'); setEditingProject(null); }}>
                Review listings <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" className="btn-secondary" onClick={() => { setActiveTab('leads'); setEditingProject(null); }}>
                Review leads <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="seller-hero-panel">
          <div className="seller-hero-stat">
            <span>Live listings</span>
            <strong>{myProjects.length}</strong>
          </div>
          <div className="seller-hero-stat">
            <span>{isAdminView ? 'Approved' : 'Buyer pipeline'}</span>
            <strong>{isAdminView ? myProjects.filter((project) => project.status === 'approved' || project.status === 'Active').length : totalLeads}</strong>
          </div>
          <div className="seller-hero-stat">
            <span>{isAdminView ? 'Pending review' : 'Visit requests'}</span>
            <strong>{isAdminView ? pendingReviewCount : pendingVisits}</strong>
          </div>
          <p className="seller-hero-note">
            {isAdminView
              ? (myProjects.length === 0
                ? 'This seller does not have any listings yet.'
                : 'Approve, reject, or update listings without leaving the existing seller workspace.')
              : (myProjects.length === 0
                ? 'Start with one polished listing to unlock the rest of the seller flow.'
                : 'Keep project details fresh so buyers trust the listing and book visits faster.')}
          </p>
        </div>
      </section>

      <div className="metric-grid seller-metric-grid">
        {metrics.map((metric) => (
          <div key={metric.label} className="metric-card">
            <div className="metric-title">{metric.label}</div>
            <div className="metric-value seller-metric-value">
              {metric.icon}
              {metric.value}
            </div>
            <span className="seller-metric-helper">{metric.helper}</span>
          </div>
        ))}
      </div>

      {saveSuccess && (
        <div className="seller-toast">
          <Check size={18} />
          <span>Seller dashboard updated successfully.</span>
        </div>
      )}

      {editingProject ? (
        <form onSubmit={handleEditSave} className="seller-panel seller-form">
          <div className="seller-panel-heading">
            <div>
              <span className="seller-section-kicker">Project editor</span>
              <h3>Edit {editingProject.name}</h3>
            </div>
            <button type="button" className="seller-link-button" onClick={() => setEditingProject(null)}>Cancel</button>
          </div>

          <div className="seller-form-grid">
            <label className="seller-field">
              <span>Starting price (INR)</span>
              <input
                type="number"
                className="form-input"
                value={editingProject.startingPrice}
                onChange={(e) => setEditingProject({ ...editingProject, startingPrice: e.target.value })}
              />
            </label>
            <label className="seller-field">
              <span>Price per sq.ft</span>
              <input
                type="number"
                className="form-input"
                value={editingProject.pricePerSqFt}
                onChange={(e) => setEditingProject({ ...editingProject, pricePerSqFt: e.target.value })}
              />
            </label>
            <label className="seller-field">
              <span>Remaining plots</span>
              <input
                type="number"
                className="form-input"
                value={editingProject.remainingPlots}
                onChange={(e) => setEditingProject({ ...editingProject, remainingPlots: e.target.value })}
              />
            </label>
            <label className="seller-field">
              <span>Availability status</span>
              <select
                className="form-input"
                value={editingProject.status}
                onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Sold Out">Sold Out</option>
              </select>
            </label>
          </div>

          <div className="seller-form-actions">
            <button type="submit" className="btn-primary"><Save size={16} /> Save changes</button>
            <button type="button" className="btn-secondary" onClick={() => setEditingProject(null)}>Cancel</button>
          </div>
        </form>
      ) : activeTab === 'listings' ? (
        <section className="seller-panel seller-content-panel">
          <div className="seller-panel-heading">
            <div>
              <span className="seller-section-kicker">Project overview</span>
              <h3>Your plotting projects</h3>
            </div>
            <button type="button" className="btn-secondary" onClick={() => setActiveTab('add')}>
              <Plus size={16} /> Add another
            </button>
          </div>

          {myProjects.length === 0 ? (
            <div className="seller-empty-state">
              <div className="seller-empty-icon"><ClipboardList size={24} /></div>
              <h4>No projects live yet</h4>
              <p>Create your first listing so buyers can view pricing, inventory, and layout details.</p>
              <div className="seller-empty-list">
                {onboardingItems.map((item) => <span key={item}>{item}</span>)}
              </div>
              <button type="button" className="btn-primary" onClick={() => setActiveTab('add')}>
                <Plus size={16} /> Create first project
              </button>
            </div>
          ) : (
            <div className="seller-project-grid">
              {myProjects.map((project) => (
                <article key={project.id} className="seller-project-card">
                  <div className="seller-project-head">
                    <div>
                      <h4>{project.name}</h4>
                      <p><MapPin size={14} /> {project.village} {project.area ? `• ${project.area}` : ''}</p>
                    </div>
                    <span className={`badge ${getProjectBadgeClass(project.status)}`}>
                      {formatProjectStatus(project.status)}
                    </span>
                  </div>

                  <div className="seller-project-stats">
                    <div>
                      <span>Starting at</span>
                      <strong>{formatLakhs(project.startingPrice)}</strong>
                    </div>
                    <div>
                      <span>Inventory left</span>
                      <strong>{toNumber(project.remainingPlots)} / {toNumber(project.totalPlots)}</strong>
                    </div>
                    <div>
                      <span>Druvio score</span>
                      <strong>{project.DruvioScore ?? project.plotItScore ?? 4.6}</strong>
                    </div>
                    <div>
                      <span>Distance</span>
                      <strong>{toNumber(project.distance).toFixed(1)} km</strong>
                    </div>
                  </div>

                  <div className="seller-project-tags">
                    {project.naPlot && <span>NA Certified</span>}
                    {project.bankLoan && <span>Bank Loan Ready</span>}
                    {formatCashback(project) && <span>{formatCashback(project)}</span>}
                    {normalizeAmenities(project.amenities).slice(0, 2).map((item) => <span key={item}>{item}</span>)}
                  </div>

                  <div className="seller-project-footer">
                    <span>Updated {project.updated || 'recently'}</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {isAdminView && project.status !== 'approved' && (
                        <button type="button" className="btn-primary seller-inline-button" onClick={() => handleApproveProject(project.id)}>
                          <ShieldCheck size={14} /> Approve
                        </button>
                      )}
                      {isAdminView && project.status !== 'rejected' && (
                        <button type="button" className="btn-secondary seller-inline-button" onClick={() => handleRejectProject(project.id)}>
                          <ShieldX size={14} /> Reject
                        </button>
                      )}
                      <button type="button" className="btn-secondary seller-inline-button" onClick={() => handleEditClick(project)}>
                        <Edit size={14} /> Edit details
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : activeTab === 'add' ? (
        <form onSubmit={handleAddProject} className="seller-panel seller-form">
          <div className="seller-panel-heading">
            <div>
              <span className="seller-section-kicker">New listing</span>
              <h3>Register a new plotting project</h3>
            </div>
            <span className="seller-muted-chip">Required fields marked by context</span>
          </div>

          <div className="seller-form-section">
            <h4>Basic details</h4>
            <div className="seller-form-grid">
              <label className="seller-field">
                <span>Project name</span>
                <input type="text" className="form-input" placeholder="Shrinath NA Meadows" required value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Village</span>
                <input type="text" className="form-input" value={newProject.village} onChange={(e) => setNewProject({ ...newProject, village: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Micro-area / landmark</span>
                <input type="text" className="form-input" placeholder="Near Mercedes Benz Junction" value={newProject.area} onChange={(e) => setNewProject({ ...newProject, area: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Developer identity</span>
                <input type="text" className="form-input" disabled value={newProject.developer} />
              </label>
            </div>
          </div>

          <div className="seller-form-section">
            <h4>Location and pricing</h4>
            <div className="seller-form-grid">
              <label className="seller-field">
                <span>Latitude</span>
                <input type="number" step="0.0001" className="form-input" value={newProject.latitude} onChange={(e) => setNewProject({ ...newProject, latitude: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Longitude</span>
                <input type="number" step="0.0001" className="form-input" value={newProject.longitude} onChange={(e) => setNewProject({ ...newProject, longitude: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Starting price (INR)</span>
                <input type="number" className="form-input" value={newProject.startingPrice} onChange={(e) => setNewProject({ ...newProject, startingPrice: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Price per sq.ft</span>
                <input type="number" className="form-input" value={newProject.pricePerSqFt} onChange={(e) => setNewProject({ ...newProject, pricePerSqFt: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Distance from Chakan circle</span>
                <input type="number" step="0.1" className="form-input" value={newProject.distance} onChange={(e) => setNewProject({ ...newProject, distance: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Facing options</span>
                <input type="text" className="form-input" value={newProject.facing} onChange={(e) => setNewProject({ ...newProject, facing: e.target.value })} />
              </label>
            </div>
          </div>

          <div className="seller-form-section">
            <h4>Inventory and media</h4>
            <div className="seller-form-grid">
              <label className="seller-field">
                <span>Total plots</span>
                <input type="number" className="form-input" value={newProject.totalPlots} onChange={(e) => setNewProject({ ...newProject, totalPlots: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Remaining plots</span>
                <input type="number" className="form-input" value={newProject.remainingPlots} onChange={(e) => setNewProject({ ...newProject, remainingPlots: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Hero image URL</span>
                <input type="url" className="form-input" value={newProject.heroImage} onChange={(e) => setNewProject({ ...newProject, heroImage: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Thumbnail URL</span>
                <input type="url" className="form-input" value={newProject.thumbnail} onChange={(e) => setNewProject({ ...newProject, thumbnail: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Layout plan URL</span>
                <input type="url" className="form-input" value={newProject.layoutPlanUrl} onChange={(e) => setNewProject({ ...newProject, layoutPlanUrl: e.target.value })} />
              </label>
              <label className="seller-field seller-field-full">
                <span>Amenities</span>
                <input type="text" className="form-input" value={newProject.amenities} onChange={(e) => setNewProject({ ...newProject, amenities: e.target.value })} />
              </label>
              <label className="seller-field seller-field-full">
                <span>Short description</span>
                <textarea className="form-input seller-textarea" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
              </label>
            </div>
          </div>

          <div className="seller-form-section">
            <h4>Business details</h4>
            <div className="seller-form-grid">
              <label className="seller-field">
                <span>Cashback percentage</span>
                <input type="number" className="form-input" value={newProject.cashbackPercentage} onChange={(e) => setNewProject({ ...newProject, cashbackPercentage: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Cashback amount</span>
                <input type="number" className="form-input" value={newProject.cashbackAmount} onChange={(e) => setNewProject({ ...newProject, cashbackAmount: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>WhatsApp number</span>
                <input type="text" className="form-input" value={newProject.whatsappNumber} onChange={(e) => setNewProject({ ...newProject, whatsappNumber: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Site visit contact</span>
                <input type="text" className="form-input" value={newProject.siteVisitContact} onChange={(e) => setNewProject({ ...newProject, siteVisitContact: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Google Maps link</span>
                <input type="url" className="form-input" value={newProject.googleMapsLink} onChange={(e) => setNewProject({ ...newProject, googleMapsLink: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Website</span>
                <input type="url" className="form-input" value={newProject.website} onChange={(e) => setNewProject({ ...newProject, website: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>RERA number</span>
                <input type="text" className="form-input" value={newProject.reraNumber} onChange={(e) => setNewProject({ ...newProject, reraNumber: e.target.value })} />
              </label>
            </div>
          </div>

          <div className="seller-toggle-row">
            <label><input type="checkbox" checked={newProject.naPlot} onChange={(e) => setNewProject({ ...newProject, naPlot: e.target.checked })} /> Collector NA certified</label>
            <label><input type="checkbox" checked={newProject.bankLoan} onChange={(e) => setNewProject({ ...newProject, bankLoan: e.target.checked })} /> Bank loan pre-approved</label>
            <label><input type="checkbox" checked={newProject.verified} onChange={(e) => setNewProject({ ...newProject, verified: e.target.checked })} /> Mark as verified</label>
          </div>

          <div className="seller-form-actions">
            <button type="submit" className="btn-primary"><Plus size={16} /> Create and publish</button>
            <button type="button" className="btn-secondary" onClick={() => setNewProject(createProjectDraft(developerName))}>Reset</button>
          </div>
        </form>
      ) : activeTab === 'leads' ? (
        <section className="seller-panel seller-content-panel">
          <div className="seller-panel-heading">
            <div>
              <span className="seller-section-kicker">Lead pipeline</span>
              <h3>Buyer leads</h3>
            </div>
            <span className="seller-muted-chip">{totalLeads} active records</span>
          </div>

          {myLeads.length === 0 ? (
            <div className="seller-empty-state compact">
              <div className="seller-empty-icon"><PhoneCall size={22} /></div>
              <h4>No leads yet</h4>
              <p>Once buyers enquire or book visits, their details will appear here for quick follow-up.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Lead name</th>
                    <th>Phone</th>
                    <th>Budget</th>
                    <th>Interested project</th>
                    <th>Stage</th>
                    <th>Last update</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td><strong>{lead.name}</strong></td>
                      <td>{lead.phone}</td>
                      <td>{lead.budget || 'Not shared'}</td>
                      <td>{lead.project}</td>
                      <td><span className={`badge ${stageClassName(lead.stage)}`}>{lead.stage}</span></td>
                      <td>{lead.date || 'Recently'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <section className="seller-panel seller-content-panel">
          <div className="seller-panel-heading">
            <div>
              <span className="seller-section-kicker">Visit schedule</span>
              <h3>Site visits</h3>
            </div>
            <span className="seller-muted-chip">{pendingVisits} upcoming</span>
          </div>

          {myVisits.length === 0 ? (
            <div className="seller-empty-state compact">
              <div className="seller-empty-icon"><Calendar size={22} /></div>
              <h4>No site visits scheduled</h4>
              <p>Booked visits will land here with date, time, and buyer contact details.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Visitor name</th>
                    <th>Phone</th>
                    <th>Project target</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myVisits.map((visit) => (
                    <tr key={visit.id}>
                      <td><strong>{visit.buyerName}</strong></td>
                      <td>{visit.buyerPhone}</td>
                      <td>{visit.project}</td>
                      <td>{visit.date}</td>
                      <td>{visit.time}</td>
                      <td><span className={`badge ${stageClassName(visit.status)}`}>{visit.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {showSellerProfileEditor && selectedSeller && (
        <EditProfileModal
          user={selectedSeller}
          allowAuthUpdate={false}
          title="Edit Seller Profile"
          successMessage="Seller profile updated successfully!"
          onSave={onSelectedSellerChange}
          onClose={() => setShowSellerProfileEditor(false)}
        />
      )}
      </main>
    </div>
  );
}

export default SellerDashboard;
