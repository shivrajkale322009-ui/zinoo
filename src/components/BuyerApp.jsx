import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MapScreen from '../maps/MapScreen';
import {
  Home,
  Gift,
  Heart,
  MapPin,
  Settings,
  Search,
  SlidersHorizontal,
  Star,
  ChevronLeft,
  MessageSquare,
  Check,
  X,
  Plus,
  Trash2,
  Copy,
  LayoutGrid,
  Image as ImageIcon,
  Globe,
  ExternalLink,
  Building2,
  Compass
} from 'lucide-react';
import {
  loadProjectLayouts,
  deleteProjectLayout,
  duplicateProjectLayout,
  deleteProject,
  updateProjectDetails
} from '../maps/projectMapService';

const MANAGEMENT_TABS = [
  { id: 'general', label: 'General Information' },
  { id: 'layouts', label: 'Layouts' },
  { id: 'media', label: 'Media' },
  { id: 'settings', label: 'Settings' }
];

const createEmptyProjectForm = () => ({
  name: '',
  developer: '',
  priceFrom: '',
  remainingPlots: '',
  village: '',
  taluka: '',
  area: '',
  description: '',
  thumbnail: '',
  amenities: '',
  status: 'approved',
  cashbackPercentage: '',
  cashbackAmount: '',
  whatsappNumber: '',
  siteVisitContact: '',
  googleMapsLink: '',
  website: '',
  reraNumber: ''
});

const DEFAULT_FILTERS = {
  budgetMax: 3000000,
  distanceMax: 10,
  naPlot: false,
  bankLoan: false,
  minScore: 0
};

const SIDEBAR_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'cashback', label: 'Cashback', icon: Gift },
  { id: 'saved', label: 'Saved', icon: Heart, disabled: true },
  { id: 'nearby', label: 'Nearby', icon: MapPin, disabled: true },
  { id: 'settings', label: 'Settings', icon: Settings, disabled: true }
];

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== '';

const normalizeAmenities = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const getProjectFormFromRecord = (project) => ({
  name: project?.name || '',
  developer: project?.developer || '',
  priceFrom: project?.priceFrom ?? project?.startingPrice ?? '',
  remainingPlots: project?.remainingPlots ?? '',
  village: project?.village || '',
  taluka: project?.taluka || '',
  area: project?.area || '',
  description: project?.description || '',
  thumbnail: project?.thumbnail || project?.heroImage || '',
  amenities: normalizeAmenities(project?.amenities).join(', '),
  status: project?.status || 'approved',
  cashbackPercentage: project?.cashbackPercentage ?? '',
  cashbackAmount: project?.cashbackAmount ?? '',
  whatsappNumber: project?.whatsappNumber || '',
  siteVisitContact: project?.siteVisitContact || '',
  googleMapsLink: project?.googleMapsLink || '',
  website: project?.website || '',
  reraNumber: project?.reraNumber || ''
});

const getDisplayLocation = (project) =>
  [project?.village, project?.taluka, project?.area].filter((item) => hasValue(item)).join(' • ');

const buildWhatsAppUrl = (project) => {
  if (!hasValue(project?.whatsappNumber)) return '';
  const phone = String(project.whatsappNumber).replace(/[^\d]/g, '');
  if (!phone) return '';
  const message = `Hi, I am interested in ${project.name || 'your project'} on Druvio.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

const formatINR = (num) => {
  if (!hasValue(num)) return 'Price on request';
  const parsed = Number(num);
  if (!Number.isFinite(parsed) || parsed <= 0) return 'Price on request';
  if (parsed >= 10000000) return `₹${(parsed / 10000000).toFixed(2)} Cr`;
  return `₹${(parsed / 100000).toFixed(1)} Lakh`;
};

const formatCashbackLabel = (project) => {
  if (hasValue(project?.cashbackPercentage)) return `${project.cashbackPercentage}% Cashback`;
  if (hasValue(project?.cashbackAmount)) {
    const amount = Number(project.cashbackAmount);
    if (Number.isFinite(amount) && amount > 0) {
      return `₹${new Intl.NumberFormat('en-IN').format(amount)} Cashback`;
    }
  }
  return '';
};

const getNavigateUrl = (project) => {
  if (hasValue(project?.googleMapsLink)) return project.googleMapsLink;
  if (hasValue(project?.latitude) && hasValue(project?.longitude)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${project.latitude},${project.longitude}`;
  }
  return '';
};

function BuyerApp({ projects, leads, visits, cashbacks, addLead, updateLead, addVisit, addCashback, isAdmin = false }) {
  const [panelMode, setPanelMode] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectLayouts, setProjectLayouts] = useState([]);
  const [activeLayout, setActiveLayout] = useState(null);
  const [loadingLayouts, setLoadingLayouts] = useState(false);
  const [projectManagerOpen, setProjectManagerOpen] = useState(false);
  const [projectManagerTab, setProjectManagerTab] = useState('general');
  const [layoutDraftName, setLayoutDraftName] = useState('');
  const [editForm, setEditForm] = useState(() => createEmptyProjectForm());
  const [visibleProjects, setVisibleProjects] = useState([]);
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapFilters, setMapFilters] = useState(DEFAULT_FILTERS);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', date: '', time: '11:00 AM' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [cashbackForm, setCashbackForm] = useState({ buyerName: '', buyerPhone: '', purchasePrice: '', documentName: '', projectId: '' });
  const [cashbackSuccess, setCashbackSuccess] = useState(false);

  const approvedProjects = useMemo(
    () => projects.filter((project) => project.status === 'approved' || project.status === 'Active'),
    [projects]
  );

  const refreshLayouts = useCallback(async (projectId, preservedLayoutId = activeLayout?.id) => {
    if (!projectId) {
      setProjectLayouts([]);
      setActiveLayout(null);
      return;
    }

    const data = await loadProjectLayouts(projectId);
    setProjectLayouts(data);
    const nextActive = data.find((layout) => layout.id === preservedLayoutId)
      || data.find((layout) => layout.name.toLowerCase().includes('master'))
      || data[0]
      || null;
    setActiveLayout(nextActive);
  }, [activeLayout?.id]);

  useEffect(() => {
    if (!selectedProject) {
      setProjectLayouts([]);
      setActiveLayout(null);
      setProjectManagerOpen(false);
      setProjectManagerTab('general');
      setEditForm(createEmptyProjectForm());
      if (panelMode === 'project') setPanelMode(null);
      return;
    }

    setLoadingLayouts(true);
    setProjectManagerOpen(false);
    setProjectManagerTab('general');
    setEditForm(getProjectFormFromRecord(selectedProject));
    refreshLayouts(selectedProject.id)
      .then(() => setLoadingLayouts(false))
      .catch((err) => {
        console.error('[Druvio] Error loading layouts:', err);
        setLoadingLayouts(false);
      });
  }, [panelMode, refreshLayouts, selectedProject]);

  useEffect(() => {
    const handleLayoutSaved = (event) => {
      if (!selectedProject?.id || event.detail?.projectId !== selectedProject.id) return;
      refreshLayouts(selectedProject.id, event.detail?.layoutId)
        .catch((err) => console.error('[Druvio] Error refreshing layouts:', err));
    };

    window.addEventListener('druvio-layout-saved', handleLayoutSaved);
    return () => window.removeEventListener('druvio-layout-saved', handleLayoutSaved);
  }, [refreshLayouts, selectedProject]);

  const handleProjectSelect = useCallback((project) => {
    setSelectedProject(project);
    setPanelMode('project');
    setProjectManagerOpen(false);
  }, []);

  const closePanel = useCallback(() => {
    setProjectManagerOpen(false);
    if (panelMode === 'project') setSelectedProject(null);
    setPanelMode(null);
  }, [panelMode]);

  const openNavigationPanel = useCallback((mode) => {
    setProjectManagerOpen(false);
    setPanelMode(mode);
  }, []);

  const handleBookVisit = (e) => {
    e.preventDefault();
    if (!selectedProject || !bookingForm.name || !bookingForm.phone || !bookingForm.date) {
      alert('Please fill all details!');
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
      status: 'Scheduled'
    };

    addVisit(newVisit);

    const existingLead = leads.find((lead) => lead.phone === bookingForm.phone);
    if (!existingLead) {
      addLead({
        name: bookingForm.name,
        phone: bookingForm.phone,
        budget: `₹${((selectedProject.priceFrom || selectedProject.startingPrice || 1000000) / 100000).toFixed(0)}L+`,
        stage: 'Book Visit',
        date: new Date().toISOString().split('T')[0],
        project: selectedProject.name,
        projectId: selectedProject.id,
        projectOwnerId: selectedProject.ownerId || ''
      });
    } else {
      updateLead({
        ...existingLead,
        stage: 'Book Visit',
        project: selectedProject.name,
        projectId: selectedProject.id,
        projectOwnerId: selectedProject.ownerId || ''
      });
    }

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setShowBookingModal(false);
      setBookingForm({ name: '', phone: '', date: '', time: '11:00 AM' });
    }, 2000);
  };

  const handleCashbackSubmit = (e) => {
    e.preventDefault();
    if (!cashbackForm.buyerName || !cashbackForm.buyerPhone || !cashbackForm.purchasePrice || !cashbackForm.projectId || !cashbackForm.documentName) {
      alert('Please fill all fields and select your agreement document!');
      return;
    }

    const project = projects.find((item) => item.id === cashbackForm.projectId);
    const purchaseVal = parseFloat(cashbackForm.purchasePrice);
    const cbVal = Math.round(purchaseVal * 0.01);

    addCashback({
      buyerName: cashbackForm.buyerName,
      buyerPhone: cashbackForm.buyerPhone,
      project: project ? project.name : 'Custom Project',
      projectId: project?.id || '',
      projectOwnerId: project?.ownerId || '',
      purchasePrice: purchaseVal,
      cashbackAmount: cbVal,
      commissionAmount: cbVal,
      documentName: cashbackForm.documentName,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'Pending Verification'
    });

    const existingLead = leads.find((lead) => lead.phone === cashbackForm.buyerPhone);
    if (!existingLead) {
      addLead({
        name: cashbackForm.buyerName,
        phone: cashbackForm.buyerPhone,
        budget: `₹${(purchaseVal / 100000).toFixed(0)}L`,
        stage: 'Negotiation',
        date: new Date().toISOString().split('T')[0],
        project: project ? project.name : 'Druvio Verified',
        projectId: project?.id || '',
        projectOwnerId: project?.ownerId || ''
      });
    }

    setCashbackSuccess(true);
    setTimeout(() => {
      setCashbackSuccess(false);
      setCashbackForm({ buyerName: '', buyerPhone: '', purchasePrice: '', documentName: '', projectId: '' });
      setPanelMode(null);
    }, 2500);
  };

  const openProjectManager = (tab = 'general') => {
    if (!selectedProject) return;
    setEditForm(getProjectFormFromRecord(selectedProject));
    setProjectManagerTab(tab);
    setProjectManagerOpen(true);
    setPanelMode('project');
  };

  const handleSaveProjectDetails = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      await updateProjectDetails(selectedProject.id, editForm);
      setSelectedProject((prev) => ({
        ...prev,
        ...editForm,
        startingPrice: editForm.priceFrom,
        heroImage: editForm.thumbnail || prev?.heroImage,
        amenities: normalizeAmenities(editForm.amenities)
      }));
      alert('Project updated successfully.');
    } catch (error) {
      alert(`Failed to update project: ${error.message}`);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    if (!window.confirm('Are you sure you want to delete this project? This cannot be undone.')) return;

    try {
      await deleteProject(selectedProject.id);
      setSelectedProject(null);
      setProjectManagerOpen(false);
      setPanelMode(null);
      alert('Project deleted successfully.');
    } catch (error) {
      alert(`Failed to delete project: ${error.message}`);
    }
  };

  const handleDeleteLayout = async (layoutId) => {
    if (!window.confirm('Delete this layout polygon?')) return;
    try {
      await deleteProjectLayout(layoutId);
      const remaining = projectLayouts.filter((layout) => layout.id !== layoutId);
      setProjectLayouts(remaining);
      if (activeLayout?.id === layoutId) setActiveLayout(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDuplicateLayout = async (layoutId) => {
    try {
      const duplicatedLayoutId = await duplicateProjectLayout(layoutId);
      await refreshLayouts(selectedProject.id, duplicatedLayoutId);
      alert('Layout duplicated.');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleStartAddLayout = () => {
    if (!selectedProject) return;
    if (!layoutDraftName.trim()) {
      alert('Enter a layout name first.');
      return;
    }

    setActiveLayout(null);
    window.dispatchEvent(new CustomEvent('druvio-start-add-layout', {
      detail: { projectId: selectedProject.id, layoutName: layoutDraftName.trim() }
    }));
    alert(`Drawing started for "${layoutDraftName.trim()}". Click points on the map, then Finish, Edit, and Save.`);
    setLayoutDraftName('');
  };

  const handleEditLayout = (layout) => {
    setActiveLayout(layout);
    window.dispatchEvent(new CustomEvent('druvio-edit-layout', {
      detail: { projectId: selectedProject?.id, layoutId: layout.id }
    }));
  };

  const searchableProjects = useMemo(() => {
    const query = homeSearchQuery.trim().toLowerCase();
    if (!query) return [];
    return approvedProjects
      .filter((project) => {
        const haystack = [project.name, project.village, project.taluka, project.developer]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 8);
  }, [approvedProjects, homeSearchQuery]);

  const cashbackProjects = useMemo(
    () => approvedProjects.filter((project) => formatCashbackLabel(project)),
    [approvedProjects]
  );

  const activeSidebarItem = panelMode === 'cashback' ? 'cashback' : 'home';
  const selectedAmenities = normalizeAmenities(selectedProject?.amenities);
  const selectedLocation = getDisplayLocation(selectedProject);
  const selectedCashback = formatCashbackLabel(selectedProject);
  const selectedWhatsAppUrl = buildWhatsAppUrl(selectedProject);
  const selectedNavigateUrl = getNavigateUrl(selectedProject);
  const panelOpen = Boolean(panelMode);
  const panelTitle = panelMode === 'cashback'
    ? 'Cashback'
    : panelMode === 'project'
      ? selectedProject?.name || 'Project'
      : 'Home';

  const renderProjectManagerContent = () => {
    if (!selectedProject) return null;

    if (projectManagerTab === 'layouts') {
      return (
        <div className="project-manager-panel">
          <div className="project-manager-card">
            <div className="project-manager-card-head">
              <div>
                <span className="project-manager-kicker">Project layouts</span>
                <h4>Manage layout polygons</h4>
              </div>
              <span className="project-manager-note">Unlimited layouts per project</span>
            </div>
            <p className="project-manager-copy">Workflow: Add Layout, enter a layout name, draw polygon on the map, finish, edit, and save.</p>
            <div className="layout-add-row">
              <input
                type="text"
                className="project-manager-input"
                placeholder="Layout name"
                value={layoutDraftName}
                onChange={(event) => setLayoutDraftName(event.target.value)}
              />
              <button type="button" className="btn-primary compact-action-btn" onClick={handleStartAddLayout}>
                <Plus size={14} /> Add Layout
              </button>
            </div>
          </div>

          <div className="project-manager-card">
            <div className="project-manager-card-head">
              <div>
                <span className="project-manager-kicker">Saved layers</span>
                <h4>{projectLayouts.length === 0 ? 'No layouts yet' : `${projectLayouts.length} layouts available`}</h4>
              </div>
            </div>

            {loadingLayouts ? (
              <p className="no-layouts-tag">Loading layouts...</p>
            ) : projectLayouts.length === 0 ? (
              <p className="no-layouts-tag">No layouts yet</p>
            ) : (
              <div className="project-layout-list">
                {projectLayouts.map((layout) => {
                  const isSelected = activeLayout?.id === layout.id;
                  return (
                    <div key={layout.id} className={`project-layout-card ${isSelected ? 'selected' : ''}`}>
                      <div className="project-layout-info">
                        <div className="layout-row-info">
                          <span className="color-dot" style={{ backgroundColor: layout.color }} />
                          <strong>{layout.name}</strong>
                        </div>
                        <span className="project-layout-subtitle">{isSelected ? 'Visible on map' : 'Tap edit to update polygon'}</span>
                      </div>
                      <div className="project-layout-actions">
                        <button type="button" className="icon-btn" title="Edit Layout" onClick={() => handleEditLayout(layout)}>
                          <LayoutGrid size={13} />
                        </button>
                        <button type="button" className="icon-btn" title="Duplicate Layout" onClick={() => handleDuplicateLayout(layout.id)}>
                          <Copy size={13} />
                        </button>
                        <button type="button" className="icon-btn danger-hover" title="Delete Layout" onClick={() => handleDeleteLayout(layout.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    const field = (key, label, type = 'text', required = false, placeholder = '') => (
      <label className="project-manager-field">
        <span>{label}{required ? ' *' : ''}</span>
        <input
          required={required}
          type={type}
          className="project-manager-input"
          placeholder={placeholder}
          value={editForm[key]}
          onChange={(event) => setEditForm({ ...editForm, [key]: event.target.value })}
        />
      </label>
    );

    return (
      <form onSubmit={handleSaveProjectDetails} className="project-manager-form">
        {projectManagerTab === 'general' && (
          <div className="project-manager-panel">
            <div className="project-manager-card">
              <div className="project-manager-card-head">
                <div>
                  <span className="project-manager-kicker">Required fields</span>
                  <h4>Core project information</h4>
                </div>
              </div>
              <div className="project-manager-grid">
                {field('name', 'Project Name', 'text', true, 'Project name')}
                {field('developer', 'Developer Name', 'text', true, 'Developer name')}
              </div>
            </div>

            <div className="project-manager-card">
              <div className="project-manager-card-head">
                <div>
                  <span className="project-manager-kicker">Optional fields</span>
                  <h4>Location, inventory, and business details</h4>
                </div>
              </div>
              <div className="project-manager-grid">
                {field('priceFrom', 'Price From', 'number')}
                {field('remainingPlots', 'Remaining Plots', 'number')}
                {field('village', 'Village')}
                {field('taluka', 'Taluka')}
                {field('area', 'Area')}
                {field('cashbackPercentage', 'Cashback Percentage', 'number')}
                {field('cashbackAmount', 'Cashback Amount', 'number')}
                {field('whatsappNumber', 'WhatsApp Number')}
                {field('siteVisitContact', 'Site Visit Contact')}
                {field('googleMapsLink', 'Google Maps Link', 'url')}
                {field('website', 'Website', 'url')}
                {field('reraNumber', 'RERA Number')}
                <label className="project-manager-field project-manager-field-wide">
                  <span>Amenities</span>
                  <input
                    type="text"
                    className="project-manager-input"
                    placeholder="Roads, Electricity, Water"
                    value={editForm.amenities}
                    onChange={(event) => setEditForm({ ...editForm, amenities: event.target.value })}
                  />
                </label>
                <label className="project-manager-field project-manager-field-wide">
                  <span>Description</span>
                  <textarea
                    className="project-manager-textarea"
                    placeholder="Short project summary"
                    value={editForm.description}
                    onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {projectManagerTab === 'media' && (
          <div className="project-manager-panel">
            <div className="project-manager-card">
              <div className="project-manager-card-head">
                <div>
                  <span className="project-manager-kicker">Project image</span>
                  <h4>Thumbnail and preview</h4>
                </div>
              </div>
              <div className="project-manager-grid">
                {field('thumbnail', 'Thumbnail URL', 'url')}
              </div>
              <div className="project-media-preview">
                {hasValue(editForm.thumbnail) ? (
                  <img src={editForm.thumbnail} alt={`${editForm.name || 'Project'} preview`} />
                ) : (
                  <div className="project-media-placeholder">
                    <ImageIcon size={22} />
                    <span>No image selected yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {projectManagerTab === 'settings' && (
          <div className="project-manager-panel">
            <div className="project-manager-card">
              <div className="project-manager-card-head">
                <div>
                  <span className="project-manager-kicker">Publishing</span>
                  <h4>Project status and actions</h4>
                </div>
              </div>
              <div className="project-manager-grid">
                <label className="project-manager-field">
                  <span>Status</span>
                  <select
                    className="project-manager-input"
                    value={editForm.status}
                    onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}
                  >
                    <option value="approved">Active</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="rejected">Rejected</option>
                    <option value="Sold Out">Sold Out</option>
                    <option value="Active">Legacy Active</option>
                  </select>
                </label>
              </div>
              <div className="project-manager-danger">
                <div>
                  <strong>Delete project</strong>
                  <span>This removes the project record permanently.</span>
                </div>
                <button type="button" className="btn-admin-action danger" onClick={handleDeleteProject}>Delete Project</button>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions-row project-manager-actions">
          <button type="submit" className="btn-save">Save Changes</button>
          <button type="button" className="btn-cancel" onClick={() => setProjectManagerOpen(false)}>Close</button>
        </div>
      </form>
    );
  };

  const renderHomePanel = () => (
    <div className="buyer-side-panel-content">
      <div className="buyer-panel-search-row">
        <label className="buyer-panel-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search land, village, builder..."
            value={homeSearchQuery}
            onChange={(event) => setHomeSearchQuery(event.target.value)}
          />
          {homeSearchQuery && (
            <button type="button" className="buyer-search-clear" onClick={() => setHomeSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </label>
        <button type="button" className={`buyer-filter-toggle ${filtersOpen ? 'active' : ''}`} onClick={() => setFiltersOpen((prev) => !prev)}>
          <SlidersHorizontal size={16} />
          <span>Filters</span>
        </button>
      </div>

      {filtersOpen && (
        <div className="buyer-filter-card">
          <label>
            Max Budget
            <strong>{formatINR(mapFilters.budgetMax)}</strong>
            <input
              type="range"
              min="800000"
              max="5000000"
              step="100000"
              value={mapFilters.budgetMax}
              onChange={(event) => setMapFilters({ ...mapFilters, budgetMax: Number(event.target.value) })}
            />
          </label>
          <label>
            Max Distance
            <strong>{mapFilters.distanceMax} km</strong>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={mapFilters.distanceMax}
              onChange={(event) => setMapFilters({ ...mapFilters, distanceMax: Number(event.target.value) })}
            />
          </label>
          <div className="buyer-filter-checks">
            <label><input type="checkbox" checked={mapFilters.naPlot} onChange={(event) => setMapFilters({ ...mapFilters, naPlot: event.target.checked })} /> NA Certified</label>
            <label><input type="checkbox" checked={mapFilters.bankLoan} onChange={(event) => setMapFilters({ ...mapFilters, bankLoan: event.target.checked })} /> Bank Approved</label>
          </div>
        </div>
      )}

      {homeSearchQuery && (
        <div className="buyer-panel-section">
          <div className="buyer-panel-section-head">
            <h4>Search Results</h4>
            <span>{searchableProjects.length}</span>
          </div>
          {searchableProjects.length === 0 ? (
            <p className="buyer-empty-copy">No matching projects found.</p>
          ) : (
            <div className="buyer-search-results">
              {searchableProjects.map((project) => (
                <button key={project.id} type="button" className="buyer-search-result" onClick={() => handleProjectSelect(project)}>
                  <div>
                    <strong>{project.name}</strong>
                    <span>{getDisplayLocation(project) || project.village || 'Druvio project'}</span>
                  </div>
                  <span>{formatINR(project.priceFrom || project.startingPrice)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="buyer-panel-section">
        <div className="buyer-panel-section-head">
          <h4>Visible Projects</h4>
          <span>{visibleProjects.length}</span>
        </div>
        {visibleProjects.length === 0 ? (
          <div className="feed-empty-state slim">
            <Compass size={24} color="var(--text-muted)" />
            <p>Pan or zoom the map to load visible projects in this area.</p>
          </div>
        ) : (
          <div className="feed-listings-grid buyer-panel-list">
            {visibleProjects.map((project) => (
              <article key={project.id} className="feed-project-card" onClick={() => handleProjectSelect(project)}>
                <div className="card-banner">
                  <img src={project.thumbnail || project.heroImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'} alt={project.name} />
                  {formatCashbackLabel(project) && <div className="cashback-tag">💰 {formatCashbackLabel(project)}</div>}
                  <div className="score-tag">
                    <Star size={10} fill="var(--accent-gold)" color="var(--accent-gold)" />
                    <span>{project.DruvioScore || '4.6'}</span>
                  </div>
                </div>
                <div className="card-info">
                  <h3>{project.name}</h3>
                  {getDisplayLocation(project) && <p className="card-loc"><MapPin size={10} /> {getDisplayLocation(project)}</p>}
                  {hasValue(project.developer) && <p className="card-dev"><Building2 size={10} /> {project.developer}</p>}
                  <div className="card-meta">
                    <div className="price-tag">{formatINR(project.priceFrom || project.startingPrice)}</div>
                    <div className="inv-tag">
                      {hasValue(project.remainingPlots)
                        ? (Number(project.remainingPlots) > 0 ? `${project.remainingPlots} plots left` : 'Sold out')
                        : 'Availability on request'}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCashbackPanel = () => (
    <div className="buyer-side-panel-content">
      <div className="cashback-intro-card">
        <Gift size={28} color="var(--brand-primary)" />
        <h3>1% Plot Purchase Cashback</h3>
        <p>Claim Druvio cashback after purchase verification. The map stays visible while you browse offers and eligible projects.</p>
      </div>

      <div className="buyer-panel-section">
        <div className="buyer-panel-section-head">
          <h4>Eligible Projects</h4>
          <span>{cashbackProjects.length}</span>
        </div>
        {cashbackProjects.length === 0 ? (
          <p className="buyer-empty-copy">No cashback offers are active right now.</p>
        ) : (
          <div className="buyer-search-results">
            {cashbackProjects.map((project) => (
              <button key={project.id} type="button" className="buyer-search-result" onClick={() => handleProjectSelect(project)}>
                <div>
                  <strong>{project.name}</strong>
                  <span>{getDisplayLocation(project) || 'Druvio verified project'}</span>
                </div>
                <span>{formatCashbackLabel(project)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="buyer-offer-grid">
        <div className="buyer-offer-card">
          <strong>Offers</strong>
          <span>Buyer cashback can be percentage based or fixed amount based on the listing.</span>
        </div>
        <div className="buyer-offer-card">
          <strong>Terms</strong>
          <span>Valid purchase proof, phone number, and project selection are required for review.</span>
        </div>
      </div>

      <form onSubmit={handleCashbackSubmit} className="cashback-claim-form">
        <label>Select Druvio Project
          <select
            required
            value={cashbackForm.projectId}
            onChange={(event) => setCashbackForm({ ...cashbackForm, projectId: event.target.value })}
          >
            <option value="">-- Choose Project --</option>
            {approvedProjects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </label>
        <label>Purchaser Full Name
          <input
            required
            type="text"
            placeholder="Shivraj Kale"
            value={cashbackForm.buyerName}
            onChange={(event) => setCashbackForm({ ...cashbackForm, buyerName: event.target.value })}
          />
        </label>
        <label>Phone Number
          <input
            required
            type="tel"
            placeholder="9999999999"
            value={cashbackForm.buyerPhone}
            onChange={(event) => setCashbackForm({ ...cashbackForm, buyerPhone: event.target.value })}
          />
        </label>
        <label>Plot Purchase Price (₹)
          <input
            required
            type="number"
            placeholder="1200000"
            value={cashbackForm.purchasePrice}
            onChange={(event) => setCashbackForm({ ...cashbackForm, purchasePrice: event.target.value })}
          />
        </label>
        <label>Upload Stamp Agreement / Receipt
          <button
            type="button"
            className="file-sim-btn"
            onClick={() => {
              const name = prompt('Enter simulated agreement filename:', 'stamp_duty_agreement.pdf');
              if (name) setCashbackForm({ ...cashbackForm, documentName: name });
            }}
          >
            {cashbackForm.documentName ? `📁 ${cashbackForm.documentName}` : '📎 Select Document (PDF/JPG)'}
          </button>
        </label>

        {cashbackSuccess ? (
          <div className="cashback-success-alert">✓ Cashback Claim Submitted Successfully! Redirecting...</div>
        ) : (
          <button type="submit" className="btn-primary claim-submit-btn">Claim 1% Cashback</button>
        )}
      </form>
    </div>
  );

  const renderProjectPanel = () => {
    if (!selectedProject) return null;

    return (
      <div className="buyer-side-panel-content project-panel-content">
        {projectManagerOpen && isAdmin ? (
          <div className="project-manager-screen">
            <div className="project-manager-header">
              <div>
                <span className="project-manager-kicker">Project management</span>
                <h3>{selectedProject.name}</h3>
              </div>
              <button type="button" className="btn-secondary compact-btn" onClick={() => setProjectManagerOpen(false)}>
                Close
              </button>
            </div>

            <div className="project-manager-tabs">
              {MANAGEMENT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`project-manager-tab ${projectManagerTab === tab.id ? 'active' : ''}`}
                  onClick={() => setProjectManagerTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {renderProjectManagerContent()}
          </div>
        ) : (
          <>
            <div className="details-hero">
              <img src={selectedProject.thumbnail || selectedProject.heroImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'} alt={selectedProject.name} />
              <div className="details-verified-stamp">✓ GPS Verified</div>
              {selectedCashback && <div className="premium-cashback-badge">💰 {selectedCashback}</div>}
            </div>

            <div className="details-info-section">
              <h2>{selectedProject.name}</h2>
              {selectedLocation && (
                <p className="details-location">
                  <MapPin size={12} color="var(--brand-primary)" />
                  {selectedLocation}
                </p>
              )}

              <div className="details-pricing-block">
                <div>
                  <span>Price</span>
                  <strong>{formatINR(selectedProject.priceFrom || selectedProject.startingPrice)}</strong>
                </div>
                {hasValue(selectedProject.remainingPlots) && (
                  <div className="pricing-right">
                    <span>Remaining plots</span>
                    <strong>{Number(selectedProject.remainingPlots) > 0 ? selectedProject.remainingPlots : 'Sold Out'}</strong>
                  </div>
                )}
              </div>

              <div className="details-key-grid">
                {hasValue(selectedProject.developer) && (
                  <div className="spec-card">
                    <span>Developer</span>
                    <strong>{selectedProject.developer}</strong>
                  </div>
                )}
                {selectedCashback && (
                  <div className="spec-card">
                    <span>Cashback</span>
                    <strong>{selectedCashback}</strong>
                  </div>
                )}
                {hasValue(selectedProject.siteVisitContact) && (
                  <div className="spec-card">
                    <span>Site Visit Contact</span>
                    <strong>{selectedProject.siteVisitContact}</strong>
                  </div>
                )}
                {hasValue(selectedProject.reraNumber) && (
                  <div className="spec-card">
                    <span>RERA Number</span>
                    <strong>{selectedProject.reraNumber}</strong>
                  </div>
                )}
              </div>

              <div className="details-score-card">
                <div className="score-header">
                  <div className="score-title">
                    <Star size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
                    <span>Druvio Score</span>
                  </div>
                  <div className="score-badge">{selectedProject.DruvioScore || '4.6'} / 100</div>
                </div>
                <p className="score-desc">Benchmark safety, location value, infrastructure, and title checks.</p>
              </div>

              {selectedAmenities.length > 0 && (
                <div className="details-amenities">
                  <h4>Amenities</h4>
                  <ul>
                    {selectedAmenities.map((item, idx) => <li key={`${item}-${idx}`}>✓ {item}</li>)}
                  </ul>
                </div>
              )}

              {hasValue(selectedProject.description) && (
                <div className="details-desc">
                  <h4>About this project</h4>
                  <p className="desc-text">{selectedProject.description}</p>
                </div>
              )}

              <div className="available-layouts-section">
                <h4>Layouts</h4>
                {loadingLayouts ? (
                  <p className="loading-tag">Loading layouts...</p>
                ) : projectLayouts.length === 0 ? (
                  <p className="no-layouts-tag">No layouts published yet.</p>
                ) : (
                  <div className="layouts-selector-grid">
                    {projectLayouts.map((layout) => {
                      const isSelected = activeLayout?.id === layout.id;
                      return (
                        <button
                          key={layout.id}
                          className={`layout-selector-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => setActiveLayout(isSelected ? null : layout)}
                        >
                          <span className="color-dot" style={{ backgroundColor: layout.color }} />
                          <span>{layout.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {(hasValue(selectedProject.website) || hasValue(selectedProject.googleMapsLink)) && (
                <div className="details-links-row">
                  {hasValue(selectedProject.website) && (
                    <a className="details-link-pill" href={selectedProject.website} target="_blank" rel="noreferrer">
                      <Globe size={13} /> Website <ExternalLink size={12} />
                    </a>
                  )}
                  {hasValue(selectedProject.googleMapsLink) && (
                    <a className="details-link-pill" href={selectedProject.googleMapsLink} target="_blank" rel="noreferrer">
                      <MapPin size={13} /> Maps <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}

              <div className="details-cta-sticky">
                <div className="cta-buttons-row">
                  {selectedWhatsAppUrl && (
                    <a href={selectedWhatsAppUrl} target="_blank" rel="noreferrer" className="btn-whatsapp">
                      WhatsApp Seller
                    </a>
                  )}
                  <button onClick={() => setShowBookingModal(true)} className="btn-primary site-visit-btn">
                    Book Site Visit
                  </button>
                </div>

                <div className="cta-secondary-row">
                  {selectedNavigateUrl && (
                    <button className="btn-secondary icon-btn-text" onClick={() => window.open(selectedNavigateUrl, '_blank')}>
                      Navigate Map
                    </button>
                  )}
                  <button
                    className="btn-secondary icon-btn-text"
                    onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => alert('Link copied!'))}
                  >
                    Share Listing
                  </button>
                </div>

                {isAdmin && (
                  <div className="details-admin-controls-block">
                    <span className="admin-block-title"><Settings size={12} /> Admin Toolbar</span>
                    <div className="admin-actions-row">
                      <button onClick={() => openProjectManager('layouts')} className="btn-admin-action">Manage Layouts</button>
                      <button onClick={() => openProjectManager('general')} className="btn-admin-action">Edit Project</button>
                      <button onClick={handleDeleteProject} className="btn-admin-action danger">Delete Project</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="buyer-map-first-root">
      <div className="buyer-map-canvas">
        <MapScreen
          projects={projects}
          isAdmin={isAdmin}
          selectedProject={selectedProject}
          onSelectProject={handleProjectSelect}
          activeLayout={activeLayout}
          onActiveLayoutChange={setActiveLayout}
          onVisibleProjectsChange={setVisibleProjects}
          filters={mapFilters}
        />
      </div>

      <aside className="buyer-map-nav" aria-label="Buyer navigation">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = !item.disabled && activeSidebarItem === item.id && panelMode !== 'project';
          return (
            <button
              key={item.id}
              type="button"
              className={`buyer-map-nav-btn ${active ? 'active' : ''}`}
              disabled={item.disabled}
              title={item.disabled ? `${item.label} coming soon` : item.label}
              onClick={() => !item.disabled && openNavigationPanel(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>

      <section className={`buyer-slide-panel ${panelOpen ? 'open' : ''}`}>
        <div className="buyer-slide-panel-shell">
          <div className="buyer-slide-panel-head">
            <div>
              <span className="buyer-panel-kicker">{panelMode === 'project' ? 'Selected project' : 'Map workspace'}</span>
              <h3>{panelTitle}</h3>
            </div>
            <button type="button" className="buyer-panel-close" onClick={closePanel} aria-label="Close panel">
              <X size={18} />
            </button>
          </div>

          {panelMode === 'home' && renderHomePanel()}
          {panelMode === 'cashback' && renderCashbackPanel()}
          {panelMode === 'project' && renderProjectPanel()}
        </div>
      </section>

      <nav className="buyer-mobile-nav" aria-label="Buyer mobile navigation">
        <button type="button" className={`buyer-mobile-nav-btn ${panelMode === 'home' ? 'active' : ''}`} onClick={() => openNavigationPanel('home')}>
          <Home size={18} />
          <span>Home</span>
        </button>
        <button type="button" className={`buyer-mobile-nav-btn ${panelMode === 'cashback' ? 'active' : ''}`} onClick={() => openNavigationPanel('cashback')}>
          <Gift size={18} />
          <span>Cashback</span>
        </button>
        <button type="button" className={`buyer-mobile-nav-btn ${panelMode === null ? 'active' : ''}`} onClick={closePanel}>
          <Compass size={18} />
          <span>Map</span>
        </button>
      </nav>

      {showBookingModal && selectedProject && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-head">
              <h3>Schedule Site Visit</h3>
              <button onClick={() => setShowBookingModal(false)} className="close-modal-btn"><X size={18} /></button>
            </div>

            {bookingSuccess ? (
              <div className="booking-success-anim">
                <Check size={32} color="var(--color-active)" />
                <h4>Site Visit Booked!</h4>
                <p>We will contact you shortly to coordinate details.</p>
              </div>
            ) : (
              <form onSubmit={handleBookVisit} className="modal-form-fields">
                <p>
                  A field executive will meet you at {selectedProject.name}
                  {hasValue(selectedProject.siteVisitContact) ? ` with ${selectedProject.siteVisitContact}` : ''} and show you the layout limits.
                </p>
                <input
                  required
                  type="text"
                  placeholder="Your Name"
                  value={bookingForm.name}
                  onChange={(event) => setBookingForm({ ...bookingForm, name: event.target.value })}
                />
                <input
                  required
                  type="tel"
                  placeholder="Mobile Number"
                  value={bookingForm.phone}
                  onChange={(event) => setBookingForm({ ...bookingForm, phone: event.target.value })}
                />
                <input
                  required
                  type="date"
                  value={bookingForm.date}
                  onChange={(event) => setBookingForm({ ...bookingForm, date: event.target.value })}
                />
                <select
                  value={bookingForm.time}
                  onChange={(event) => setBookingForm({ ...bookingForm, time: event.target.value })}
                >
                  <option value="09:00 AM">09:00 AM (Morning)</option>
                  <option value="11:00 AM">11:00 AM (Morning)</option>
                  <option value="02:00 PM">02:00 PM (Afternoon)</option>
                  <option value="04:30 PM">04:30 PM (Evening)</option>
                </select>
                <button type="submit" className="btn-primary">Confirm Site Visit</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerApp;
