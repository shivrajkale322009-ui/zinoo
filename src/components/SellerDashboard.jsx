import React, { useMemo, useState } from 'react';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  ArrowLeft,
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
import { httpsCallable } from 'firebase/functions';
import { auth, functions, storage } from '../firebaseConfig';
import { CHAKAN_LOCATION } from '../utils/chakanLocation';
import EditProfileModal from './EditProfileModal';
import ProjectLocationPicker from './ProjectLocationPicker';
import { PROJECT_DOCUMENT_OPTIONS, getProjectDocumentLabel } from '../utils/projectDocuments';
import { getCashbackPerGuntha, withCanonicalPlotArea } from '../utils/projectArea';
import { getProjectApprovalStatus, isProjectPublishable } from '../utils/projectVisibility';
import {
  LAND_ZONE_OPTIONS,
  NA_STATUS_OPTIONS,
  getLandZoneLabel,
  getNaStatusLabel,
  withCanonicalLandFields
} from '../utils/projectLand';

const createProjectDraft = (developer) => ({
  name: '',
  developer: developer || 'Shivraj Land Developers',
  village: '',
  area: '',
  latitude: CHAKAN_LOCATION.latitude,
  longitude: CHAKAN_LOCATION.longitude,
  layoutPolygon: null,
  layoutCenter: null,
  layoutBounds: null,
  layoutAreaSqFt: null,
  startingPrice: 1000000,
  distance: 3.5,
  remainingPlots: 20,
  totalPlots: 40,
  sizeMin: 1200,
  sizeMax: 2400,
  facing: 'East, North',
  bankLoan: true,
  landZone: 'residential',
  naStatus: 'na_approved',
  verified: true,
  amenities: 'Water Supply Connection, Electricity Line, 9m Tar Road, Street Lights',
  nearbySchools: '',
  nearbyHospitals: '',
  nearbyMIDC: '',
  nearbyHighway: '',
  description: '',
  thumbnail: '',
  cashbackAmount: '',
  whatsappNumber: '',
  siteVisitContact: '',
  googleMapsLink: '',
  website: '',
  reraNumber: '',
  heroImage: '',
  heroImagePath: '',
  heroImageMetadata: null,
  thumbnailPath: '',
  thumbnailMetadata: null,
  documents: []
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

const getDocumentContentType = (file) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const inferred = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' }[extension];
  return inferred || file.type;
};

const formatCashback = (project) => {
  const amount = getCashbackPerGuntha(project);
  if (amount > 0) return `₹${new Intl.NumberFormat('en-IN').format(amount)} per Guntha`;
  return '';
};

const stageClassName = (stage) => {
  if (stage === 'Purchased') return 'badge-success';
  if (stage === 'Visit Done') return 'badge-info';
  if (stage === 'Book Visit' || stage === 'Scheduled') return 'badge-warning';
  return 'badge-danger';
};

const getProjectBadgeClass = (project) => {
  const status = getProjectApprovalStatus(project);
  if (status === 'approved') return 'badge-success';
  if (status === 'rejected') return 'badge-danger';
  return 'badge-warning';
};

const formatProjectStatus = (project) => {
  const status = getProjectApprovalStatus(project);
  if (status === 'approved') return 'Approved';
  if (status === 'pending' || status === 'pending_review') return 'Pending Review';
  if (status === 'rejected') return 'Rejected';
  return status || 'Active';
};

function SellerDashboard({
  projects,
  leads,
  visits,
  user,
  updateProject,
  addProject,
  isAdminView = false,
  selectedSeller = null,
  initialTab = selectedSeller?.initialSellerTab || 'listings',
  onBackToAdmin,
  onSelectedSellerChange
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editingProject, setEditingProject] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSellerProfileEditor, setShowSellerProfileEditor] = useState(false);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentError, setDocumentError] = useState('');
  const [mediaUploading, setMediaUploading] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [projectSubmitError, setProjectSubmitError] = useState('');

  const developerName = projects[0]?.developer || 'Shivraj Land Developers';
  const [newProject, setNewProject] = useState(() => createProjectDraft(developerName));
  const [documentDraft, setDocumentDraft] = useState({ type: PROJECT_DOCUMENT_OPTIONS[0].value, file: null, previewUrl: '' });

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
  const pendingReviewCount = myProjects.filter((project) => project.status === 'pending' || project.status === 'pending_review').length;
  const conversionRate = totalLeads ? Math.round((myLeads.filter((lead) => lead.stage === 'Purchased').length / totalLeads) * 100) : 0;
  const fillRate = totalInventory ? Math.round((totalPlotsForSale / totalInventory) * 100) : 0;

  const showToast = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  const handleEditClick = (project) => {
    setEditingProject(withCanonicalPlotArea(withCanonicalLandFields(project)));
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    updateProject(withCanonicalPlotArea(withCanonicalLandFields({
      ...editingProject,
      startingPrice: toNumber(editingProject.startingPrice),
      latitude: toNumber(editingProject.latitude ?? editingProject.coords?.[0], CHAKAN_LOCATION.latitude),
      longitude: toNumber(editingProject.longitude ?? editingProject.coords?.[1], CHAKAN_LOCATION.longitude),
      coords: [toNumber(editingProject.latitude ?? editingProject.coords?.[0], CHAKAN_LOCATION.latitude), toNumber(editingProject.longitude ?? editingProject.coords?.[1], CHAKAN_LOCATION.longitude)],
      location: { lat: toNumber(editingProject.latitude ?? editingProject.coords?.[0], CHAKAN_LOCATION.latitude), lng: toNumber(editingProject.longitude ?? editingProject.coords?.[1], CHAKAN_LOCATION.longitude) },
      remainingPlots: toNumber(editingProject.remainingPlots),
      totalPlots: toNumber(editingProject.totalPlots),
      plotAreaMinSqFt: toNumber(editingProject.plotAreaMinSqFt ?? editingProject.sizeMin),
      plotAreaMaxSqFt: toNumber(editingProject.plotAreaMaxSqFt ?? editingProject.sizeMax),
      cashbackPerGuntha: Math.max(0, toNumber(editingProject.cashbackPerGuntha ?? editingProject.cashbackAmount)),
      status: isAdminView ? editingProject.status : 'pending'
    })));
    setEditingProject(null);
    showToast();
  };

  const handleApproveProject = async (projectId) => {
    await httpsCallable(functions, 'reviewProject')({
      projectId,
      decision: 'approved'
    });
    showToast();
  };

  const handleRejectProject = async (projectId) => {
    await httpsCallable(functions, 'reviewProject')({
      projectId,
      decision: 'rejected'
    });
    showToast();
  };

  const handleDocumentUpload = async (fileOverride, typeOverride) => {
    const file = fileOverride || documentDraft.file;
    const documentType = typeOverride || documentDraft.type;
    const ownerId = selectedSeller?.id || user?.uid;
    const uploaderId = auth.currentUser?.uid || user?.uid;
    const contentType = file ? getDocumentContentType(file) : '';
    setDocumentError('');
    if (!file || !ownerId || !uploaderId) {
      setDocumentError('Your sign-in session is unavailable. Please sign in again before uploading a document.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setDocumentError('Document must be 15 MB or smaller.');
      return;
    }
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(contentType)) {
      setDocumentError('Upload a PDF, JPG, or PNG document.');
      return;
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const documentId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const storageRef = ref(storage, `project-documents/${uploaderId}/drafts/${documentId}-${safeName}`);
    setDocumentUploading(true);
    try {
      const snapshot = await uploadBytes(storageRef, file, {
        contentType,
        customMetadata: {
          ownerId,
          sellerUid: ownerId,
          documentType,
          uploadedBy: uploaderId,
          uploadedByRole: isAdminView ? 'admin' : 'seller'
        }
      });
      const url = await getDownloadURL(snapshot.ref);
      setNewProject((current) => ({
        ...current,
        documents: [...current.documents, {
          id: documentId,
          type: documentType,
          url,
          path: snapshot.ref.fullPath,
          fileName: file.name,
          contentType,
          size: file.size,
          status: 'pending',
          uploadedAt: new Date().toISOString(),
          uploadedBy: uploaderId,
          previewUrl: contentType.startsWith('image/') ? URL.createObjectURL(file) : ''
        }]
      }));
      setDocumentDraft({ type: PROJECT_DOCUMENT_OPTIONS[0].value, file: null, previewUrl: '' });
    } catch (error) {
      console.error('Project document upload failed:', error);
      setDocumentError(error?.code === 'storage/unauthorized'
        ? 'Upload permission was denied. Refresh your sign-in session and try again.'
        : 'Unable to upload this document. Check your connection and try again.');
    } finally {
      setDocumentUploading(false);
    }
  };

  const handleMediaUpload = async (file, field) => {
    const ownerId = selectedSeller?.id || user?.uid;
    setMediaError('');
    if (!file || !ownerId || !user?.uid) return;
    if (file.size > 10 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMediaError('Project images must be JPG, PNG, or WebP and 10 MB or smaller.');
      return;
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const assetId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const assetRef = ref(storage, `project-media/${user.uid}/drafts/${assetId}-${safeName}`);
    setMediaUploading(field);
    try {
      const snapshot = await uploadBytes(assetRef, file, {
        contentType: file.type,
        customMetadata: {
          ownerId,
          sellerUid: ownerId,
          mediaRole: field,
          uploadedBy: user.uid,
          uploadedByRole: isAdminView ? 'admin' : 'seller'
        }
      });
      const url = await getDownloadURL(snapshot.ref);
      setNewProject((current) => ({
        ...current,
        [field]: url,
        [`${field}Path`]: snapshot.ref.fullPath,
        [`${field}Metadata`]: {
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user.uid
        }
      }));
    } catch (error) {
      console.error('Project image upload failed:', error);
      setMediaError('Unable to upload this project image. Please try again.');
    } finally {
      setMediaUploading('');
    }
  };

  const removeDraftDocument = async (document, index) => {
    setNewProject((current) => ({ ...current, documents: current.documents.filter((_, itemIndex) => itemIndex !== index) }));
    if (document.path) await deleteObject(ref(storage, document.path)).catch(() => undefined);
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    setProjectSubmitError('');

    const createdProject = {
      name: newProject.name.trim(),
      developer: newProject.developer,
      village: newProject.village.trim(),
      area: newProject.area.trim(),
      latitude: toNumber(newProject.latitude, CHAKAN_LOCATION.latitude),
      longitude: toNumber(newProject.longitude, CHAKAN_LOCATION.longitude),
      coords: [toNumber(newProject.latitude, CHAKAN_LOCATION.latitude), toNumber(newProject.longitude, CHAKAN_LOCATION.longitude)],
      location: { lat: toNumber(newProject.latitude, CHAKAN_LOCATION.latitude), lng: toNumber(newProject.longitude, CHAKAN_LOCATION.longitude) },
      layoutPolygon: newProject.layoutPolygon || null,
      layoutCenter: newProject.layoutCenter || null,
      layoutBounds: newProject.layoutBounds || null,
      layoutAreaSqFt: newProject.layoutAreaSqFt || null,
      startingPrice: toNumber(newProject.startingPrice),
      distance: toNumber(newProject.distance),
      remainingPlots: toNumber(newProject.remainingPlots),
      totalPlots: toNumber(newProject.totalPlots),
      sizeMin: toNumber(newProject.sizeMin),
      sizeMax: toNumber(newProject.sizeMax),
      plotAreaMinSqFt: toNumber(newProject.sizeMin),
      plotAreaMaxSqFt: toNumber(newProject.sizeMax),
      facing: newProject.facing.split(',').map((face) => face.trim()).filter(Boolean),
      bankLoan: newProject.bankLoan,
      landZone: newProject.landZone,
      naStatus: newProject.naStatus,
      naPlot: newProject.naStatus === 'na_approved',
      verified: newProject.verified,
      amenities: newProject.amenities.split(',').map((item) => item.trim()).filter(Boolean),
      nearby: {
        schools: newProject.nearbySchools || 'ZP School (2.0 km)',
        hospitals: newProject.nearbyHospitals || 'Rural Hospital (3.0 km)',
        midc: newProject.nearbyMIDC || 'Chakan MIDC (1.5 km)',
        highway: newProject.nearbyHighway || 'Pune-Nashik Highway (2.0 km)'
      },
      updated: 'Just now',
      status: isAdminView ? 'approved' : 'pending',
      thumbnail: newProject.thumbnail || newProject.heroImage,
      heroImage: newProject.heroImage,
      description: newProject.description || 'Freshly listed residential plotting development near Chakan.',
      cashbackPerGuntha: Math.max(0, toNumber(newProject.cashbackAmount)),
      cashbackAmount: Math.max(0, toNumber(newProject.cashbackAmount)),
      whatsappNumber: newProject.whatsappNumber,
      siteVisitContact: newProject.siteVisitContact,
      googleMapsLink: newProject.googleMapsLink,
      website: newProject.website,
      reraNumber: newProject.reraNumber,
      heroImagePath: newProject.heroImagePath,
      heroImageMetadata: newProject.heroImageMetadata,
      thumbnailPath: newProject.thumbnailPath,
      thumbnailMetadata: newProject.thumbnailMetadata,
      documents: newProject.documents,
      DruvioScore: 4.6
    };

    try {
      await addProject(createdProject);
      setNewProject(createProjectDraft(developerName));
      setDocumentDraft({ type: PROJECT_DOCUMENT_OPTIONS[0].value, file: null, previewUrl: '' });
      setActiveTab('listings');
      showToast();
    } catch (error) {
      console.error('Project creation failed:', error);
      setProjectSubmitError(error?.message || 'Unable to create this project.');
    }
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
        value: myProjects.filter(isProjectPublishable).length,
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
        <nav className="seller-sidebar-nav">
          <button type="button" className={`seller-sidebar-link ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => selectTab('listings')}>
            <LayoutDashboard size={17} /> Dashboard
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

      </aside>

      <main className="seller-workspace-main">
        <header className="seller-desktop-topbar">
          <div>
            <span className="seller-topbar-kicker">{isAdminView ? 'Admin view' : 'Seller workspace'}</span>
            <h1>{activeTab === 'add' ? 'Create a listing' : activeTab === 'leads' ? 'Lead pipeline' : activeTab === 'visits' ? 'Visit calendar' : 'Portfolio overview'}</h1>
          </div>
        </header>
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
      {isAdminView && selectedSeller && (
        <section className="seller-panel seller-content-panel" style={{ marginBottom: '16px' }}>
          <div className="seller-panel-heading">
            <div>
              <span className="seller-section-kicker">Admin seller context</span>
              <h3>{selectedSeller.displayName || selectedSeller.name || selectedSeller.businessName || 'Seller account'}</h3>
              <p style={{ marginTop: '6px', color: 'var(--text-secondary)' }}>
                You are creating and managing projects on behalf of this approved Seller. Your Admin session remains active.
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

          <ProjectLocationPicker
            latitude={editingProject.latitude ?? editingProject.coords?.[0]}
            longitude={editingProject.longitude ?? editingProject.coords?.[1]}
            onChange={({ latitude, longitude }) => setEditingProject((current) => ({ ...current, latitude, longitude }))}
            layoutPolygon={editingProject.layoutPolygon}
            onLayoutChange={(geometry) => setEditingProject((current) => ({ ...current, ...geometry }))}
          />
          <div className="seller-form-grid">
            <label className="seller-field">
              <span>Latitude</span>
              <input type="number" step="0.000001" className="form-input" value={editingProject.latitude ?? editingProject.coords?.[0] ?? ''} onChange={(e) => setEditingProject({ ...editingProject, latitude: e.target.value })} />
            </label>
            <label className="seller-field">
              <span>Longitude</span>
              <input type="number" step="0.000001" className="form-input" value={editingProject.longitude ?? editingProject.coords?.[1] ?? ''} onChange={(e) => setEditingProject({ ...editingProject, longitude: e.target.value })} />
            </label>
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
              <span>Minimum plot area (sq.ft.)</span>
              <input type="number" min="0" className="form-input" value={editingProject.plotAreaMinSqFt ?? editingProject.sizeMin ?? ''} onChange={(e) => setEditingProject({ ...editingProject, plotAreaMinSqFt: e.target.value })} />
              <small>1 Guntha equals 900 sq.ft.</small>
            </label>
            <label className="seller-field">
              <span>Maximum plot area (sq.ft.)</span>
              <input type="number" min="0" className="form-input" value={editingProject.plotAreaMaxSqFt ?? editingProject.sizeMax ?? ''} onChange={(e) => setEditingProject({ ...editingProject, plotAreaMaxSqFt: e.target.value })} />
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
              <span>Cashback per Guntha</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                className="form-input"
                placeholder="₹ 25,000"
                value={editingProject.cashbackPerGuntha ?? editingProject.cashbackAmount ?? ''}
                onChange={(e) => setEditingProject({ ...editingProject, cashbackPerGuntha: e.target.value })}
              />
              <small>Fixed cashback rate for every 900 sq.ft. purchased.</small>
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
            <label className="seller-field">
              <span>Land zone</span>
              <select className="form-input" required value={editingProject.landZone || ''} onChange={(e) => setEditingProject({ ...editingProject, landZone: e.target.value })}>
                <option value="">Select land zone</option>
                {LAND_ZONE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="seller-field">
              <span>NA status</span>
              <select className="form-input" required value={editingProject.naStatus || ''} onChange={(e) => setEditingProject({ ...editingProject, naStatus: e.target.value })}>
                <option value="">Select NA status</option>
                {NA_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
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
          </div>

          {isAdminView && selectedSeller && (
            <div className="seller-managed-owner-summary">
              <span>Project owner</span>
              <strong>{selectedSeller.businessName || selectedSeller.displayName || selectedSeller.name}</strong>
              <small>Created on behalf of this Seller by Admin. Ownership cannot be changed here.</small>
            </div>
          )}

          {myProjects.length === 0 ? (
            <div className="seller-empty-state">
              <div className="seller-empty-icon"><ClipboardList size={24} /></div>
              <h4>No projects live yet</h4>
              <p>Create your first listing so buyers can view pricing, inventory, and layout details.</p>
              <div className="seller-empty-list">
                {onboardingItems.map((item) => <span key={item}>{item}</span>)}
              </div>
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
                    <span className={`badge ${getProjectBadgeClass(project)}`}>
                      {formatProjectStatus(project)}
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
                    {project.developer && <span>Projected by {project.developer}</span>}
                    <span>{getLandZoneLabel(project)}</span>
                    <span>{getNaStatusLabel(project)}</span>
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

          {isAdminView && selectedSeller && (
            <div className="seller-managed-owner-summary">
              <span>Project owner</span>
              <strong>{selectedSeller.businessName || selectedSeller.displayName || selectedSeller.name}</strong>
              <small>Created on behalf of this Seller by Admin. Ownership cannot be changed here.</small>
            </div>
          )}

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
                <span>Projected by</span>
                <input type="text" className="form-input" disabled value={newProject.developer} />
              </label>
              <label className="seller-field">
                <span>Land zone</span>
                <select className="form-input" required value={newProject.landZone} onChange={(e) => setNewProject({ ...newProject, landZone: e.target.value })}>
                  {LAND_ZONE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <small>Choose the statutory zoning classification for the land.</small>
              </label>
              <label className="seller-field">
                <span>NA status</span>
                <select className="form-input" required value={newProject.naStatus} onChange={(e) => setNewProject({ ...newProject, naStatus: e.target.value })}>
                  {NA_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <small>NA approval is tracked separately from the land zone.</small>
              </label>
            </div>
          </div>

          <div className="seller-form-section">
            <h4>Location and pricing</h4>
            <ProjectLocationPicker
              latitude={newProject.latitude}
              longitude={newProject.longitude}
              onChange={({ latitude, longitude }) => setNewProject((current) => ({ ...current, latitude, longitude }))}
              layoutPolygon={newProject.layoutPolygon}
              onLayoutChange={(geometry) => setNewProject((current) => ({ ...current, ...geometry }))}
            />
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
                <span>Minimum plot area (sq.ft.)</span>
                <input type="number" min="0" className="form-input" value={newProject.sizeMin} onChange={(e) => setNewProject({ ...newProject, sizeMin: e.target.value })} />
                <small>1 Guntha equals 900 sq.ft.</small>
              </label>
              <label className="seller-field">
                <span>Maximum plot area (sq.ft.)</span>
                <input type="number" min="0" className="form-input" value={newProject.sizeMax} onChange={(e) => setNewProject({ ...newProject, sizeMax: e.target.value })} />
              </label>
              <label className="seller-field">
                <span>Hero image</span>
                <input type="file" className="form-input seller-document-file" accept="image/jpeg,image/png,image/webp" disabled={mediaUploading === 'heroImage'} onChange={(event) => handleMediaUpload(event.target.files?.[0], 'heroImage')} />
                <small>{mediaUploading === 'heroImage' ? 'Uploading…' : newProject.heroImageMetadata?.fileName || 'JPG, PNG, or WebP · maximum 10 MB.'}</small>
              </label>
              <label className="seller-field">
                <span>Card thumbnail</span>
                <input type="file" className="form-input seller-document-file" accept="image/jpeg,image/png,image/webp" disabled={mediaUploading === 'thumbnail'} onChange={(event) => handleMediaUpload(event.target.files?.[0], 'thumbnail')} />
                <small>{mediaUploading === 'thumbnail' ? 'Uploading…' : newProject.thumbnailMetadata?.fileName || 'Optional card image · maximum 10 MB.'}</small>
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
                <span>Cashback per Guntha</span>
                <input type="number" min="0" step="1" inputMode="numeric" className="form-input" placeholder="₹ 25,000" value={newProject.cashbackAmount} onChange={(e) => setNewProject({ ...newProject, cashbackAmount: e.target.value })} />
                <small>Enter the fixed cashback rate offered per 900 sq.ft. (1 Guntha).</small>
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
            {mediaError && <p className="seller-document-error" role="alert">{mediaError}</p>}
          </div>

          <div className="seller-form-section">
            <h4>Project documents</h4>
            <p className="seller-section-copy">Upload legal and project files securely. Every document remains pending until Druvio verifies it.</p>
            <div className="seller-form-grid">
              <label className="seller-field seller-field-full">
                <span>Approved Layout document</span>
                <input type="file" className="form-input seller-document-file" accept="application/pdf,image/jpeg,image/png" disabled={documentUploading} onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleDocumentUpload(file, 'approved_layout');
                  event.target.value = '';
                }} />
                <small>Upload the project layout as PDF, JPG, or PNG. Druvio verification is required before Buyer visibility.</small>
              </label>
              <label className="seller-field">
                <span>Document type</span>
                <select className="form-input" value={documentDraft.type} onChange={(event) => setDocumentDraft({ ...documentDraft, type: event.target.value })}>
                  {PROJECT_DOCUMENT_OPTIONS.map((document) => <option key={document.value} value={document.value}>{document.label}</option>)}
                </select>
              </label>
              <label className="seller-field">
                <span>Document file</span>
                <input type="file" className="form-input seller-document-file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setDocumentDraft((current) => ({
                    ...current,
                    file,
                    previewUrl: file && getDocumentContentType(file).startsWith('image/') ? URL.createObjectURL(file) : ''
                  }));
                }} />
                <small>PDF, JPG, or PNG · maximum 15 MB.</small>
              </label>
            </div>
            {documentDraft.file && (
              <div className="seller-document-draft-preview">
                <span className="seller-document-preview" aria-hidden="true">
                  {documentDraft.previewUrl ? <img src={documentDraft.previewUrl} alt="" /> : <b>PDF</b>}
                </span>
                <span><strong>{documentDraft.file.name}</strong><small>Ready to upload as {getProjectDocumentLabel(documentDraft.type)}.</small></span>
              </div>
            )}
            {documentError && <p className="seller-document-error" role="alert">{documentError}</p>}
            <div className="seller-form-actions">
              <button
                type="button"
                className="btn-secondary"
                disabled={!documentDraft.file || documentUploading}
                onClick={() => handleDocumentUpload()}
              >
                {documentUploading ? 'Uploading…' : 'Upload document'}
              </button>
            </div>
            {newProject.documents.length > 0 && (
              <div className="seller-document-list">
                {newProject.documents.map((document, index) => (
                  <div key={`${document.type}-${index}`}>
                    <span className="seller-document-preview" aria-hidden="true">
                      {document.previewUrl ? <img src={document.previewUrl} alt="" /> : <b>PDF</b>}
                    </span>
                    <span><strong>{getProjectDocumentLabel(document.type)}</strong><small>{document.fileName || 'Uploaded document'} · Pending review</small></span>
                    <button type="button" onClick={() => removeDraftDocument(document, index)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="seller-toggle-row">
            <label><input type="checkbox" checked={newProject.bankLoan} onChange={(e) => setNewProject({ ...newProject, bankLoan: e.target.checked })} /> Bank loan pre-approved</label>
            <label><input type="checkbox" checked={newProject.verified} onChange={(e) => setNewProject({ ...newProject, verified: e.target.checked })} /> Mark as verified</label>
          </div>

          <div className="seller-form-actions">
            {projectSubmitError && <p className="seller-document-error" role="alert">{projectSubmitError}</p>}
            <button type="submit" className="btn-primary" disabled={Boolean(mediaUploading || documentUploading)}><Plus size={16} /> Submit for approval</button>
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
