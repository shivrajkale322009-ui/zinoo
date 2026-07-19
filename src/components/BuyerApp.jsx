import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import MapScreen from '../maps/MapScreen';
import ProfileDropdown from './ProfileDropdown';
import {
  formatDocumentDate,
  getProjectDocumentLabel,
  getVerifiedDocumentCount,
  normalizeProjectDocuments,
  PROJECT_DOCUMENT_OPTIONS
} from '../utils/projectDocuments';
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
  Compass,
  MessageCircle,
  Navigation,
  Share2,
  FileCheck,
  FileText,
  Camera,
  CalendarDays,
  Loader2,
  IndianRupee,
  UserRound,
  Phone,
  Mic,
  ChevronRight
} from 'lucide-react';
import { storage } from '../firebaseConfig';
import { isProjectPublishable } from '../utils/projectVisibility';
import { calculateCashbackForArea, getCashbackPerGuntha, squareFeetToGuntha } from '../utils/projectArea';
import { CHAKAN_MAP_POSITION } from '../utils/chakanLocation';
import { getProjectCompleteness } from '../utils/projectCompleteness';
import { deriveNearbyUpdates } from '../utils/nearbyUpdates';
import {
  LAND_ZONE_OPTIONS,
  NA_STATUS_OPTIONS,
  getLandZoneLabel,
  getNaStatusLabel,
  matchesProjectFilters
} from '../utils/projectLand';
import { loadGoogleMaps } from '../maps/googleMaps';
import {
  loadProjectLayouts,
  deleteProjectLayout,
  duplicateProjectLayout,
  deleteProject,
  updateProjectDetails
} from '../maps/projectMapService';

const MANAGEMENT_TABS = [
  { id: 'general', label: 'Project Details' },
  { id: 'layouts', label: 'Layouts' },
  { id: 'media', label: 'Media' },
  { id: 'documents', label: 'Documents' }
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
  thumbnailPath: '',
  thumbnailMetadata: null,
  amenities: '',
  status: 'approved',
  cashbackAmount: '',
  whatsappNumber: '',
  siteVisitContact: '',
  salesContact: '',
  googleMapsLink: '',
  website: '',
  reraNumber: '',
  documents: []
});

const DEFAULT_FILTERS = {
  budgetMax: 3000000,
  landZones: [],
  naStatuses: [],
  bankLoan: false,
  minScore: 0
};

const SIDEBAR_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'map', label: 'Map', icon: Compass },
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
  thumbnailPath: project?.thumbnailPath || '',
  thumbnailMetadata: project?.thumbnailMetadata || null,
  amenities: normalizeAmenities(project?.amenities).join(', '),
  status: project?.status || 'approved',
  cashbackAmount: project?.cashbackAmount ?? '',
  whatsappNumber: project?.whatsappNumber || '',
  siteVisitContact: project?.siteVisitContact || '',
  salesContact: project?.salesContact || '',
  googleMapsLink: project?.googleMapsLink || '',
  website: project?.website || '',
  reraNumber: project?.reraNumber || '',
  latitude: project?.latitude ?? project?.location?.latitude ?? '',
  longitude: project?.longitude ?? project?.location?.longitude ?? '',
  totalPlots: project?.totalPlots ?? '',
  minimumPlotArea: project?.minimumPlotArea ?? project?.minimumArea ?? '',
  landZone: project?.landZone || project?.zoneType || '',
  naStatus: project?.naStatus || '',
  documents: Array.isArray(project?.documents) ? project.documents : []
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
  const amount = getCashbackPerGuntha(project);
  if (amount > 0) return `₹${new Intl.NumberFormat('en-IN').format(amount)} per Guntha`;
  return '';
};

const getNavigateUrl = (project) => {
  if (hasValue(project?.googleMapsLink)) return project.googleMapsLink;
  if (hasValue(project?.latitude) && hasValue(project?.longitude)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${project.latitude},${project.longitude}`;
  }
  return '';
};

function BuyerApp({
  projects,
  leads,
  visits,
  cashbacks,
  user,
  buyerProfile,
  addLead,
  updateLead,
  addVisit,
  addCashback,
  isAdmin = false,
  onThemeToggle,
  isDarkMode,
  permissions,
  currentView,
  onViewChange,
  onBackToAdmin,
  selectedSeller
}) {
  const [activeScreen, setActiveScreen] = useState('home');
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
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [placeSearchError, setPlaceSearchError] = useState('');
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const placesSessionTokenRef = useRef(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapFilters, setMapFilters] = useState(DEFAULT_FILTERS);
  const [savedProjectIds, setSavedProjectIds] = useState(() => new Set());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', date: '', time: '11:00 AM' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [cashbackForm, setCashbackForm] = useState({ purchasedAreaSqFt: '', projectId: '', proofFile: null });
  const [cashbackSuccess, setCashbackSuccess] = useState(false);
  const [cashbackSubmitting, setCashbackSubmitting] = useState(false);
  const [cashbackError, setCashbackError] = useState('');
  const [documentViewer, setDocumentViewer] = useState(null);
  const [projectUploadType, setProjectUploadType] = useState(PROJECT_DOCUMENT_OPTIONS[0].value);
  const [projectUploadBusy, setProjectUploadBusy] = useState('');
  const [projectUploadError, setProjectUploadError] = useState('');
  const [projectManagerError, setProjectManagerError] = useState('');
  const [projectValidationAttempted, setProjectValidationAttempted] = useState(false);

  const approvedProjects = useMemo(
    () => projects.filter(isProjectPublishable),
    [projects]
  );
  const filteredProjects = useMemo(
    () => approvedProjects.filter((project) => matchesProjectFilters(project, mapFilters)),
    [approvedProjects, mapFilters]
  );
  const nearbyUpdates = useMemo(() => deriveNearbyUpdates(filteredProjects), [filteredProjects]);

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
    if (!project) {
      setSelectedProject(null);
      setPanelMode(null);
      return;
    }
    setSelectedProject(project);
    setActiveScreen('map');
    setPanelMode(null);
    setProjectManagerOpen(false);
    window.dispatchEvent(new CustomEvent('druvio-focus-project', { detail: { project } }));
  }, []);

  const openFullProjectDetails = useCallback(() => {
    if (selectedProject) setPanelMode('project');
  }, [selectedProject]);

  const closePanel = useCallback(() => {
    setProjectManagerOpen(false);
    if (panelMode === 'project') setSelectedProject(null);
    setPanelMode(null);
  }, [panelMode]);

  const navigateToScreen = useCallback((screen) => {
    setProjectManagerOpen(false);
    setSelectedProject(null);
    setPanelMode(null);
    setActiveScreen(screen);
  }, []);

  const toggleSavedProject = (projectId) => {
    setSavedProjectIds((current) => {
      const next = new Set(current);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

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

  const handleCashbackSubmit = async (e) => {
    e.preventDefault();
    setCashbackError('');

    const buyerName = buyerProfile?.displayName || buyerProfile?.name || user?.displayName || '';
    const buyerPhone = buyerProfile?.phoneNumber || buyerProfile?.phone || user?.phoneNumber || '';
    const project = cashbackProjects.find((item) => item.id === cashbackForm.projectId);
    const purchasedAreaSqFt = Number(cashbackForm.purchasedAreaSqFt);
    const proofFile = cashbackForm.proofFile;

    if (!buyerName || !buyerPhone) {
      setCashbackError('Add your name and phone number in Account Settings before submitting a claim.');
      return;
    }
    if (!project || !Number.isFinite(purchasedAreaSqFt) || purchasedAreaSqFt <= 0 || !proofFile) {
      setCashbackError('Select a project, enter the purchased area, and capture purchase proof.');
      return;
    }

    const cashbackPerGuntha = getCashbackPerGuntha(project);
    const cbVal = calculateCashbackForArea(cashbackPerGuntha, purchasedAreaSqFt);
    const safeFileName = proofFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const proofRef = ref(storage, `cashback-claims/${user.uid}/${Date.now()}-${safeFileName}`);

    setCashbackSubmitting(true);
    try {
      const snapshot = await uploadBytes(proofRef, proofFile, {
        contentType: proofFile.type,
        customMetadata: { projectId: project.id, uploadedBy: user.uid }
      });
      const proofUrl = await getDownloadURL(snapshot.ref);

      try {
        await addCashback({
          createdBy: user.uid,
          buyerName,
          buyerPhone,
          project: project.name,
          projectId: project.id,
          projectOwnerId: project.ownerId || '',
          purchasedAreaSqFt,
          purchasedAreaGuntha: squareFeetToGuntha(purchasedAreaSqFt),
          cashbackPerGuntha,
          cashbackAmount: cbVal,
          commissionAmount: cbVal,
          proofUrl,
          proofPath: snapshot.ref.fullPath,
          documentName: proofFile.name,
          documentType: proofFile.type,
          submittedAt: new Date().toISOString().split('T')[0],
          status: 'Pending Verification'
        });
      } catch (claimError) {
        await deleteObject(snapshot.ref).catch(() => undefined);
        throw claimError;
      }

      const existingLead = leads.find((lead) => lead.phone === buyerPhone);
      if (!existingLead) {
        await addLead({
          createdBy: user.uid,
          name: buyerName,
          phone: buyerPhone,
          budget: `₹${(purchaseVal / 100000).toFixed(0)}L`,
          stage: 'Negotiation',
          date: new Date().toISOString().split('T')[0],
          project: project.name,
          projectId: project.id,
          projectOwnerId: project.ownerId || ''
        });
      }

      setCashbackSuccess(true);
      setCashbackForm({ purchasedAreaSqFt: '', projectId: '', proofFile: null });
    } catch (submitError) {
      console.error('Failed to submit cashback claim', submitError);
      setCashbackError('We could not upload and submit your claim. Please check your connection and try again.');
    } finally {
      setCashbackSubmitting(false);
    }
  };

  const openProjectManager = (tab = 'general') => {
    if (!selectedProject) return;
    setProjectManagerError('');
    setProjectValidationAttempted(false);
    setEditForm(getProjectFormFromRecord(selectedProject));
    setProjectManagerTab(tab);
    setProjectManagerOpen(true);
    setPanelMode('project');
  };

  const openProjectManagerSection = (tab = 'general', sectionId = '') => {
    openProjectManager(tab);
    if (!sectionId) return;
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleSaveProjectDetails = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    const completeness = getProjectCompleteness({ ...selectedProject, ...editForm });
    const publishing = ['approved', 'Active'].includes(editForm.status);
    if (publishing && !completeness.isComplete) {
      setProjectValidationAttempted(true);
      setProjectManagerError('Complete the required fields highlighted in red before publishing. Once saved by an Admin, this project stays approved without another review.');
      return;
    }

    try {
      setProjectManagerError('');
      setProjectValidationAttempted(false);
      await updateProjectDetails(selectedProject.id, {
        ...editForm,
        lastEditedBy: user?.uid || '',
        lastEditedByRole: 'admin'
      });
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
      setActiveScreen('map');
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
    return filteredProjects
      .filter((project) => {
        const haystack = [project.name, project.village, project.taluka, project.developer]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 8);
  }, [filteredProjects, homeSearchQuery]);

  useEffect(() => {
    const queryText = homeSearchQuery.trim();
    if (queryText.length < 2) {
      setPlaceSuggestions([]);
      setPlaceSearchError('');
      return undefined;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      try {
        await loadGoogleMaps();
        const { AutocompleteSessionToken, AutocompleteSuggestion } = await window.google.maps.importLibrary('places');
        if (!placesSessionTokenRef.current) placesSessionTokenRef.current = new AutocompleteSessionToken();
        const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: queryText,
          includedRegionCodes: ['in'],
          locationBias: { center: CHAKAN_MAP_POSITION, radius: 60000 },
          sessionToken: placesSessionTokenRef.current
        });
        if (!cancelled) {
          setPlaceSuggestions(response.suggestions.filter((suggestion) => suggestion.placePrediction).slice(0, 5));
          setPlaceSearchError('');
        }
      } catch (error) {
        const apiBlocked = String(error?.message || error).includes('blocked');
        if (!apiBlocked) console.error('[Druvio Places] Autocomplete failed:', error);
        if (!cancelled) {
          setPlaceSuggestions([]);
          setPlaceSearchError(apiBlocked
            ? 'Location autocomplete needs Places API (New) enabled for Druvio.'
            : 'Location suggestions are temporarily unavailable.');
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [homeSearchQuery]);

  const selectPlaceSuggestion = async (suggestion) => {
    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'viewport'] });
      if (!place.location) return;
      setHomeSearchQuery(place.displayName || place.formattedAddress || 'Selected location');
      setPlaceSuggestions([]);
      placesSessionTokenRef.current = null;
      window.dispatchEvent(new CustomEvent('druvio-focus-location', {
        detail: {
          location: place.location.toJSON(),
          viewport: place.viewport?.toJSON?.() || null
        }
      }));
      setActiveScreen('map');
      setPanelMode(null);
    } catch (error) {
      console.error('[Druvio Places] Place selection failed:', error);
      setPlaceSearchError('Unable to open that location. Please try again.');
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setPlaceSearchError('Voice search is not supported by this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setVoiceSearchActive(true);
    recognition.onend = () => setVoiceSearchActive(false);
    recognition.onerror = () => {
      setVoiceSearchActive(false);
      setPlaceSearchError('Voice search could not hear you. Please try again.');
    };
    recognition.onresult = (event) => {
      setHomeSearchQuery(event.results[0][0].transcript);
      setActiveScreen('home');
      setPanelMode(null);
    };
    recognition.start();
  };

  const searchEnteredLocation = async (event) => {
    if (event.key !== 'Enter' || !homeSearchQuery.trim()) return;
    event.preventDefault();
    if (searchableProjects.length > 0) {
      handleProjectSelect(searchableProjects[0]);
      setPlaceSuggestions([]);
      return;
    }
    try {
      await loadGoogleMaps();
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ address: homeSearchQuery.trim(), region: 'IN' });
      const result = response.results?.[0];
      if (!result?.geometry?.location) throw new Error('No matching location found.');
      window.dispatchEvent(new CustomEvent('druvio-focus-location', {
        detail: {
          location: result.geometry.location.toJSON(),
          viewport: result.geometry.viewport?.toJSON?.() || null
        }
      }));
      setActiveScreen('map');
      setPanelMode(null);
      setPlaceSuggestions([]);
      setPlaceSearchError('');
    } catch {
      setPlaceSearchError('No matching project or location was found.');
    }
  };

  const cashbackProjects = useMemo(
    () => approvedProjects.filter((project) => formatCashbackLabel(project)),
    [approvedProjects]
  );
  const cashbackProject = useMemo(
    () => cashbackProjects.find((project) => project.id === cashbackForm.projectId) || null,
    [cashbackForm.projectId, cashbackProjects]
  );
  const estimatedCashback = cashbackProject
    ? calculateCashbackForArea(getCashbackPerGuntha(cashbackProject), cashbackForm.purchasedAreaSqFt)
    : 0;
  const cashbackBuyerName = buyerProfile?.displayName || buyerProfile?.name || user?.displayName || 'Not added';
  const cashbackBuyerPhone = buyerProfile?.phoneNumber || buyerProfile?.phone || user?.phoneNumber || 'Not added';

  const activeSidebarItem = activeScreen;
  const selectedAmenities = normalizeAmenities(selectedProject?.amenities);
  const selectedLocation = getDisplayLocation(selectedProject);
  const selectedCashback = formatCashbackLabel(selectedProject);
  const selectedDocuments = selectedProject
    ? normalizeProjectDocuments(selectedProject).filter((document) => document.status === 'verified')
    : [];
  const allSelectedDocuments = selectedProject ? normalizeProjectDocuments(selectedProject) : [];
  const documentsLoading = Boolean(selectedProject && loadingLayouts && selectedDocuments.length === 0);
  const selectedWhatsAppUrl = buildWhatsAppUrl(selectedProject);
  const selectedNavigateUrl = getNavigateUrl(selectedProject);
  const panelOpen = panelMode === 'project';
  const panelTitle = selectedProject?.name || 'Project';
  const panelKicker = 'Selected project';
  const activeFilterCount = mapFilters.landZones.length
    + mapFilters.naStatuses.length
    + Number(mapFilters.bankLoan)
    + Number(mapFilters.budgetMax !== DEFAULT_FILTERS.budgetMax);

  const toggleFilterOption = (key, value) => {
    setMapFilters((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value]
    }));
  };

  const uploadProjectManagerFile = async (file, kind) => {
    if (!file || !selectedProject?.id || !user?.uid) return;
    const isDocument = kind === 'document';
    const allowedTypes = isDocument
      ? ['application/pdf', 'image/jpeg', 'image/png']
      : ['image/jpeg', 'image/png', 'image/webp'];
    const maximumSize = isDocument ? 15 * 1024 * 1024 : 10 * 1024 * 1024;
    setProjectUploadError('');
    if (!allowedTypes.includes(file.type) || file.size > maximumSize) {
      setProjectUploadError(isDocument ? 'Upload a PDF, JPG, or PNG up to 15 MB.' : 'Upload a JPG, PNG, or WebP image up to 10 MB.');
      return;
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const assetId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const root = isDocument ? 'project-documents' : 'project-media';
    const assetRef = ref(storage, `${root}/${user.uid}/${selectedProject.id}/${assetId}-${safeName}`);
    setProjectUploadBusy(kind);
    try {
      const snapshot = await uploadBytes(assetRef, file, {
        contentType: file.type,
        customMetadata: { ownerId: selectedProject.ownerId || '', projectId: selectedProject.id, uploadedBy: user.uid }
      });
      const url = await getDownloadURL(snapshot.ref);
      if (isDocument) {
        setEditForm((current) => ({
          ...current,
          documents: [...current.documents, {
            id: assetId,
            type: projectUploadType,
            url,
            path: snapshot.ref.fullPath,
            fileName: file.name,
            contentType: file.type,
            size: file.size,
            status: 'pending',
            uploadedAt: new Date().toISOString(),
            uploadedBy: user.uid
          }]
        }));
      } else {
        setEditForm((current) => ({
          ...current,
          thumbnail: url,
          thumbnailPath: snapshot.ref.fullPath,
          thumbnailMetadata: { fileName: file.name, contentType: file.type, size: file.size, uploadedAt: new Date().toISOString(), uploadedBy: user.uid }
        }));
      }
    } catch (error) {
      console.error('Project manager upload failed:', error);
      setProjectUploadError('Unable to upload this file. Please try again.');
    } finally {
      setProjectUploadBusy('');
    }
  };

  const renderProjectManagerContent = () => {
    if (!selectedProject) return null;
    const completeness = getProjectCompleteness({ ...selectedProject, ...editForm });
    const missingRequiredKeys = new Set([
      ...completeness.missingRequired.map((item) => item.key),
      ...completeness.invalidFields.map((item) => item.key)
    ]);

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

    if (projectManagerTab === 'documents') {
      return (
        <div className="project-manager-panel">
          <div className="project-manager-card">
            <div className="project-manager-card-head">
              <div>
                <span className="project-manager-kicker">Due diligence</span>
                <h4>Project documents</h4>
              </div>
            </div>
            <p className="project-manager-copy">Upload files for review. Verification decisions remain in the Admin Property Review workspace.</p>
            <div className="project-manager-upload-row">
              <select className="project-manager-input" value={projectUploadType} onChange={(event) => setProjectUploadType(event.target.value)}>
                {PROJECT_DOCUMENT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <input type="file" className="project-manager-input" accept="application/pdf,image/jpeg,image/png" disabled={projectUploadBusy === 'document'} onChange={(event) => uploadProjectManagerFile(event.target.files?.[0], 'document')} />
            </div>
            {projectUploadBusy === 'document' && <p className="project-manager-copy">Uploading document…</p>}
            {projectUploadError && <p className="seller-document-error" role="alert">{projectUploadError}</p>}
            {editForm.documents.length === 0 ? (
              <p className="no-layouts-tag">No documents have been uploaded yet.</p>
            ) : (
              <div className="project-document-editor-list">
                {editForm.documents.map((document, index) => (
                  <div key={`${document.type}-${index}`} className="project-document-editor">
                    <span><strong>{getProjectDocumentLabel(document.type)}</strong><small>{document.fileName || 'Uploaded document'}</small></span>
                    <span className={`document-review-status ${document.status || 'pending'}`}>{document.status || 'pending'}</span>
                    <a href={document.url} target="_blank" rel="noreferrer" className="project-document-link">Open</a>
                    <button type="button" className="icon-btn danger-hover" title={`Remove ${getProjectDocumentLabel(document.type)}`} onClick={() => setEditForm({ ...editForm, documents: editForm.documents.filter((_, itemIndex) => itemIndex !== index) })}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    const field = (key, label, type = 'text', required = false, placeholder = '', completenessKey = key) => {
      const invalid = projectValidationAttempted && (missingRequiredKeys.has(completenessKey) || (required && !hasValue(editForm[key])));
      return (
      <label className={`project-manager-field${invalid ? ' is-invalid' : ''}`}>
        <span>{label}{required && <em aria-hidden="true"> *</em>}</span>
        <input
          type={type}
          className={`project-manager-input${invalid ? ' is-invalid' : ''}`}
          placeholder={placeholder}
          value={editForm[key]}
          min={key === 'cashbackAmount' ? '0' : undefined}
          step={key === 'cashbackAmount' ? '1' : undefined}
          aria-invalid={invalid}
          onChange={(event) => setEditForm({ ...editForm, [key]: event.target.value })}
        />
      </label>
      );
    };
    const selectField = (key, label, options) => {
      const invalid = projectValidationAttempted && missingRequiredKeys.has(key);
      return (
        <label className={`project-manager-field${invalid ? ' is-invalid' : ''}`}>
          <span>{label}<em aria-hidden="true"> *</em></span>
          <select className={`project-manager-input${invalid ? ' is-invalid' : ''}`} value={editForm[key]} aria-invalid={invalid} onChange={(event) => setEditForm({ ...editForm, [key]: event.target.value })}>
            <option value="">Select {label.toLowerCase()}</option>
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      );
    };

    return (
      <form onSubmit={handleSaveProjectDetails} className="project-manager-form">
        <section className={`project-completeness-panel ${completeness.isComplete ? 'complete' : ''}`} onClick={() => document.getElementById('project-basic-information')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
          <div><span><i aria-hidden="true">i</i> Project completeness</span><strong>{completeness.score}%</strong></div>
          <div className="project-completeness-summary"><b>✓ {Math.max(0, 7 - completeness.missingRequired.length - completeness.invalidFields.length)} Completed</b><b>⚠ {completeness.missingRequired.length + completeness.invalidFields.length} Remaining</b></div>
          {!completeness.isComplete && (
            <details>
              <summary>Review missing information</summary>
              {completeness.missingRequired.concat(completeness.invalidFields, completeness.missingRecommended).map((item) => <span key={`${item.key}-${item.label}`}>{item.section}: {item.label}</span>)}
            </details>
          )}
        </section>
        {projectManagerError && <p className="seller-document-error" role="alert">{projectManagerError}</p>}
        {projectManagerTab === 'general' && (
          <div className="project-manager-panel">
            <div className="project-manager-card" id="project-basic-information">
              <div className="project-manager-card-head">
                <div>
                  <span className="project-manager-kicker">01</span>
                  <h4>Basic Information</h4>
                </div>
              </div>
              <div className="project-manager-grid">
                {field('name', 'Project Name', 'text', true, 'Project name')}
                {field('developer', 'Developer', 'text', true, 'Company or project owner')}
                {field('village', 'Location', 'text', true, 'Village or locality')}
                {field('priceFrom', 'Price From', 'number', true, 'Starting price in ₹', 'startingPrice')}
                {field('totalPlots', 'Total Plots', 'number', true, 'Total plots')}
                {field('remainingPlots', 'Remaining Plots', 'number')}
              </div>
            </div>

            <div className="project-manager-card">
              <div className="project-manager-card-head">
                <div>
                  <span className="project-manager-kicker">02</span>
                  <h4>Project Information</h4>
                </div>
              </div>
              <div className="project-manager-grid">
                {selectField('landZone', 'Land Zone', LAND_ZONE_OPTIONS)}
                {selectField('naStatus', 'NA Status', NA_STATUS_OPTIONS)}
                <div className="project-manager-field"><span>Verification Status</span><div className="project-manager-readonly">{getVerifiedDocumentCount(selectedProject)} verified document{getVerifiedDocumentCount(selectedProject) === 1 ? '' : 's'}</div></div>
                <label className="project-manager-field"><span>Project Status</span><select className="project-manager-input" value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}><option value="draft">Draft</option><option value="approved">Active</option><option value="pending_review">Pending Review</option><option value="rejected">Rejected</option><option value="Sold Out">Sold Out</option></select></label>
                {field('cashbackAmount', 'Cashback Available', 'number', true, 'Fixed amount in ₹', 'cashbackPerGuntha')}
              </div>
            </div>

            <div className="project-manager-card">
              <div className="project-manager-card-head"><div><span className="project-manager-kicker">03</span><h4>Contact Information</h4></div></div>
              <div className="project-manager-grid">
                {field('salesContact', 'Sales Contact')}
                {field('whatsappNumber', 'WhatsApp Number', 'text', true, 'Buyer contact number', 'contact')}
                {field('siteVisitContact', 'Site Visit Number (Optional)')}
              </div>
            </div>

            <div className="project-manager-card">
              <div className="project-manager-card-head"><div><span className="project-manager-kicker">Additional</span><h4>Listing Notes</h4></div></div>
              <div className="project-manager-grid">
                {field('taluka', 'Taluka')}
                {field('area', 'Nearby Landmark')}
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
              <label className={`project-manager-field${projectValidationAttempted && missingRequiredKeys.has('mainImage') ? ' is-invalid' : ''}`}>
                <span>Project thumbnail<em aria-hidden="true"> *</em></span>
                <input type="file" className={`project-manager-input${projectValidationAttempted && missingRequiredKeys.has('mainImage') ? ' is-invalid' : ''}`} accept="image/jpeg,image/png,image/webp" aria-invalid={projectValidationAttempted && missingRequiredKeys.has('mainImage')} disabled={projectUploadBusy === 'thumbnail'} onChange={(event) => uploadProjectManagerFile(event.target.files?.[0], 'thumbnail')} />
                <small>{projectUploadBusy === 'thumbnail' ? 'Uploading…' : editForm.thumbnailMetadata?.fileName || 'JPG, PNG, or WebP · maximum 10 MB.'}</small>
              </label>
              {projectUploadError && <p className="seller-document-error" role="alert">{projectUploadError}</p>}
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
                    <option value="draft">Draft</option>
                    <option value="approved">Active</option>
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
      {nearbyUpdates.length > 0 && <section className="buyer-panel-section"><div className="buyer-panel-section-head"><h4>What’s Happening Nearby</h4></div><div className="nearby-updates-rail">{nearbyUpdates.slice(0, 4).map((update) => <button type="button" key={update.id} className="nearby-update-card" onClick={() => handleProjectSelect(update.project)}>{update.image && <img loading="lazy" src={update.image} alt="" />}<span>{update.type}</span><strong>{update.headline}</strong><small>{update.area} · {update.timestamp}</small></button>)}</div></section>}
      <div className="buyer-panel-search-row">
        <div className="buyer-filter-chips" aria-label="Property filters">
          <button type="button" className={`buyer-filter-chip buyer-filter-trigger ${filtersOpen ? 'active' : ''}`} onClick={() => setFiltersOpen((prev) => !prev)} aria-haspopup="dialog" aria-expanded={filtersOpen}>
            <SlidersHorizontal size={18} />
            <span>Filters</span>
            {activeFilterCount > 0 && <span className="buyer-filter-count">{activeFilterCount}</span>}
          </button>
          <span className="buyer-filter-summary">{filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'} match</span>
        </div>
      </div>

      {filtersOpen && (
        <div className="buyer-filter-layer">
          <button type="button" className="buyer-filter-backdrop" onClick={() => setFiltersOpen(false)} aria-label="Close filters" />
          <div className="buyer-filter-card" role="dialog" aria-modal="true" aria-labelledby="buyer-filter-title">
            <div className="buyer-filter-header">
              <div><span>Project discovery</span><h3 id="buyer-filter-title">Filters</h3></div>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={18} /></button>
            </div>
            <div className="buyer-filter-scroll">
              <label className="buyer-filter-range">
                <span>Maximum budget</span><strong>{formatINR(mapFilters.budgetMax)}</strong>
                <input type="range" min="800000" max="5000000" step="100000" value={mapFilters.budgetMax} onChange={(event) => setMapFilters({ ...mapFilters, budgetMax: Number(event.target.value) })} />
              </label>
              <fieldset className="buyer-filter-group">
                <legend>Land Zone</legend>
                <p>Choose one or more statutory land classifications.</p>
                <div className="buyer-filter-option-grid">
                  {LAND_ZONE_OPTIONS.map((option) => <label key={option.value}><input type="checkbox" checked={mapFilters.landZones.includes(option.value)} onChange={() => toggleFilterOption('landZones', option.value)} /><span>{option.label}</span></label>)}
                </div>
              </fieldset>
              <fieldset className="buyer-filter-group">
                <legend>NA Status</legend>
                <p>NA approval is independent from the land-zone classification.</p>
                <div className="buyer-filter-option-grid">
                  {NA_STATUS_OPTIONS.map((option) => <label key={option.value}><input type="checkbox" checked={mapFilters.naStatuses.includes(option.value)} onChange={() => toggleFilterOption('naStatuses', option.value)} /><span>{option.label}</span></label>)}
                </div>
              </fieldset>
              <label className="buyer-filter-boolean"><input type="checkbox" checked={mapFilters.bankLoan} onChange={(event) => setMapFilters({ ...mapFilters, bankLoan: event.target.checked })} /><span><strong>Bank loan available</strong><small>Show projects marked as bank-loan ready.</small></span></label>
            </div>
            <div className="buyer-filter-actions">
              <button type="button" className="btn-secondary" onClick={() => setMapFilters(DEFAULT_FILTERS)}>Reset</button>
              <button type="button" className="btn-primary" onClick={() => setFiltersOpen(false)}>Show {filteredProjects.length} projects</button>
            </div>
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
          <h4>Featured Projects</h4>
          <span>{filteredProjects.length}</span>
        </div>
        {filteredProjects.length === 0 ? (
          <div className="feed-empty-state slim">
            <Compass size={24} color="var(--text-muted)" />
            <p>No approved projects match these filters.</p>
          </div>
        ) : (
          <div className="feed-listings-grid buyer-panel-list">
            {filteredProjects.slice(0, 6).map((project) => {
              const projectDocuments = normalizeProjectDocuments(project);
              const verifiedDocumentCount = getVerifiedDocumentCount(project);

              return (
              <article
                key={project.id}
                className="feed-project-card"
                role="button"
                tabIndex={0}
                aria-label={`View ${project.name}`}
                onClick={() => handleProjectSelect(project)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleProjectSelect(project);
                  }
                }}
              >
                <div className="card-banner">
                  <img src={project.thumbnail || project.heroImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'} alt={project.name} />
                  <div className="verified-card-badge"><Check size={12} /> Verified</div>
                  {formatCashbackLabel(project) && <div className="cashback-tag">💰 {formatCashbackLabel(project)}</div>}
                  <div className="score-tag">
                    <Star size={10} fill="var(--accent-gold)" color="var(--accent-gold)" />
                    <span>{project.DruvioScore || '4.6'}</span>
                  </div>
                </div>
                <div className="card-info">
                  <h3>{project.name}</h3>
                  {getDisplayLocation(project) && <p className="card-loc"><MapPin size={10} /> {getDisplayLocation(project)}</p>}
                  {hasValue(project.developer) && <p className="card-dev"><Building2 size={10} /> Projected by {project.developer}</p>}
                  <div className="project-land-tags"><span>{getLandZoneLabel(project)}</span><span>{getNaStatusLabel(project)}</span></div>
                  <div className="card-meta">
                    <div className="price-tag">{formatINR(project.priceFrom || project.startingPrice)}</div>
                    <div className="inv-tag">
                      {hasValue(project.remainingPlots)
                        ? (Number(project.remainingPlots) > 0 ? `${project.remainingPlots} plots left` : 'Sold out')
                        : 'Availability on request'}
                    </div>
                  </div>
                  {verifiedDocumentCount > 0 && (
                    <button
                      type="button"
                      className="project-document-summary"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleProjectSelect(project);
                      }}
                    >
                      <FileCheck size={16} />
                      <span>{verifiedDocumentCount > 0 ? `${verifiedDocumentCount} verified document${verifiedDocumentCount === 1 ? '' : 's'}` : 'Documents available'}</span>
                    </button>
                  )}
                  <div className="property-card-actions" aria-label={`${project.name} actions`}>
                    <button
                      type="button"
                      className={`property-card-icon ${savedProjectIds.has(project.id) ? 'saved' : ''}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSavedProject(project.id);
                      }}
                      aria-label={savedProjectIds.has(project.id) ? `Remove ${project.name} from saved projects` : `Save ${project.name}`}
                      aria-pressed={savedProjectIds.has(project.id)}
                      title={savedProjectIds.has(project.id) ? 'Remove from saved' : 'Save project'}
                    >
                      <Heart size={18} fill={savedProjectIds.has(project.id) ? 'currentColor' : 'none'} />
                    </button>
                    {getNavigateUrl(project) && (
                      <button type="button" className="property-card-icon" onClick={(event) => { event.stopPropagation(); window.open(getNavigateUrl(project), '_blank'); }} aria-label={`Navigate to ${project.name}`} title="Navigate">
                        <Navigation size={18} />
                      </button>
                    )}
                    <button type="button" className="property-card-icon" onClick={(event) => { event.stopPropagation(); navigator.clipboard?.writeText(window.location.href); }} aria-label={`Share ${project.name}`} title="Share">
                      <Share2 size={18} />
                    </button>
                    {buildWhatsAppUrl(project) && (
                      <a href={buildWhatsAppUrl(project)} target="_blank" rel="noreferrer" className="property-card-icon property-card-whatsapp" onClick={(event) => event.stopPropagation()} aria-label={`Contact ${project.name} on WhatsApp`} title="WhatsApp">
                        <MessageCircle size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderCashbackPanel = () => (
    <div className="buyer-side-panel-content cashback-panel-content">
      <div className="cashback-panel-header">
        <div className="cashback-panel-icon"><Gift size={20} /></div>
        <div><h3>Claim Cashback</h3><p>Submit your plot purchase details for verification</p></div>
        <button type="button" className="cashback-screen-close" onClick={() => navigateToScreen('map')} aria-label="Close Cashback and return to map">
          <X size={18} />
        </button>
      </div>
      <form onSubmit={handleCashbackSubmit} className="cashback-claim-form">
        <section className="cashback-form-section">
          <div className="cashback-section-heading"><span>1</span><div><h4>Purchase details</h4><p>Select the project and enter the purchased plot area.</p></div></div>
        <label>Purchased project
          <select
            required
            value={cashbackForm.projectId}
            onChange={(event) => setCashbackForm((current) => ({ ...current, projectId: event.target.value }))}
          >
            <option value="">Select a project</option>
            {cashbackProjects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </label>
        <label>Purchased area (sq.ft.)
          <input
            required
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="450"
            value={cashbackForm.purchasedAreaSqFt}
            onChange={(event) => setCashbackForm((current) => ({ ...current, purchasedAreaSqFt: event.target.value }))}
          />
          <small>1 Guntha = 900 sq.ft. Cashback is calculated proportionally.</small>
        </label>
        {cashbackProject && <div className="cashback-auto-value"><span>Estimated cashback</span><strong>₹{new Intl.NumberFormat('en-IN').format(estimatedCashback)}</strong><small>{formatCashbackLabel(cashbackProject)} × purchased area ÷ 900.</small></div>}
        </section>

        <section className="cashback-form-section">
          <div className="cashback-section-heading"><span>2</span><div><h4>Purchase proof</h4><p>Capture the stamp agreement or receipt with your device camera.</p></div></div>
          <label htmlFor="cashback-proof" className="cashback-proof-picker">
            <Camera size={22} />
            <strong>{cashbackForm.proofFile ? cashbackForm.proofFile.name : 'Capture or upload proof'}</strong>
            <span>JPG, PNG or PDF · maximum 10 MB</span>
          </label>
          <input id="cashback-proof" className="cashback-file-input" type="file" accept="image/jpeg,image/png,application/pdf" capture="environment" onChange={(event) => {
            const file = event.target.files?.[0] || null;
            setCashbackError('');
            if (file && file.size > 10 * 1024 * 1024) {
              setCashbackError('Purchase proof must be 10 MB or smaller.');
              event.target.value = '';
              setCashbackForm((current) => ({ ...current, proofFile: null }));
              return;
            }
            setCashbackForm((current) => ({ ...current, proofFile: file }));
          }} />
        </section>

        <section className="cashback-form-section cashback-review-section">
          <div className="cashback-section-heading"><span>3</span><div><h4>Review claim</h4><p>These details come from your Druvio account and project.</p></div></div>
          <div className="cashback-review-row"><UserRound size={18} /><span>Purchaser</span><strong>{cashbackBuyerName}</strong></div>
          <div className="cashback-review-row"><Phone size={18} /><span>Phone</span><strong>{cashbackBuyerPhone}</strong></div>
          <div className="cashback-review-row"><IndianRupee size={18} /><span>Cashback</span><strong>{cashbackProject && Number(cashbackForm.purchasedAreaSqFt) > 0 ? `₹${new Intl.NumberFormat('en-IN').format(estimatedCashback)}` : 'Enter purchased area'}</strong></div>
        </section>

        {cashbackError && <div className="cashback-error-alert" role="alert">{cashbackError}</div>}
        {cashbackSuccess ? (
          <div className="cashback-success-alert">Claim submitted successfully. Druvio will verify your purchase proof.</div>
        ) : (
          <button type="submit" className="btn-primary claim-submit-btn" disabled={cashbackSubmitting || cashbackProjects.length === 0}>
            {cashbackSubmitting ? <><Loader2 size={18} className="spin" /> Uploading proof…</> : 'Submit cashback claim'}
          </button>
        )}
      </form>
    </div>
  );

  const renderProjectPanel = () => {
    if (!selectedProject) {
      return (
        <div className="buyer-side-panel-content project-panel-empty-state">
          <FileText size={24} aria-hidden="true" />
          <h4>No project selected</h4>
          <p>Select a project on the map or from the results to review its details and documents.</p>
        </div>
      );
    }

    const plotArea = selectedProject.minimumPlotArea || selectedProject.maximumPlotArea || selectedProject.plotAreaSqFt;
    const score = selectedProject.DruvioScore || selectedProject.druvioScore || null;
    const heroPrice = formatINR(selectedProject.priceFrom || selectedProject.startingPrice);
    const plotsLeftLabel = hasValue(selectedProject.remainingPlots)
      ? (Number(selectedProject.remainingPlots) > 0 ? selectedProject.remainingPlots : 'Sold out')
      : '—';
    const landZoneLabel = getLandZoneLabel(selectedProject);
    const mapPreviewQuery = hasValue(selectedProject.latitude) && hasValue(selectedProject.longitude)
      ? `${selectedProject.latitude},${selectedProject.longitude}`
      : [selectedProject.name, selectedLocation].filter(Boolean).join(', ');
    const mapPreviewUrl = hasValue(mapPreviewQuery)
      ? `https://www.google.com/maps?q=${encodeURIComponent(mapPreviewQuery)}&z=15&output=embed`
      : '';
    const scoreSignals = [
      hasValue(selectedProject.reraNumber) && 'RERA details provided',
      hasValue(selectedProject.website) && 'Project website provided',
      hasValue(selectedProject.googleMapsLink) && 'Map reference provided',
    ].filter(Boolean);
    const shareProject = () => {
      navigator.clipboard?.writeText(window.location.href).then(() => alert('Project link copied.'));
    };
    const openWhatsApp = () => {
      if (selectedWhatsAppUrl) {
        window.open(selectedWhatsAppUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      alert('WhatsApp contact is not available for this project yet.');
    };
    const openDirections = () => {
      if (selectedNavigateUrl) {
        window.open(selectedNavigateUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      alert('Directions are not available for this project yet.');
    };
    const openFullscreenLocation = () => {
      if (selectedProject.layoutPolygon) {
        window.dispatchEvent(new CustomEvent('druvio-view-project-layout', { detail: { projectId: selectedProject.id } }));
        return;
      }
      if (selectedNavigateUrl) {
        window.open(selectedNavigateUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      if (mapPreviewUrl) {
        window.open(mapPreviewUrl.replace('&output=embed', ''), '_blank', 'noopener,noreferrer');
      }
    };
    const adminActions = [
      { label: 'Edit Project', icon: FileText, onClick: () => openProjectManagerSection('general', 'project-basic-information') },
      { label: 'Manage Layouts', icon: LayoutGrid, onClick: () => openProjectManager('layouts') },
      { label: 'Delete Project', icon: Trash2, onClick: handleDeleteProject, danger: true }
    ];

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
          <div className="premium-project-details">
            <section className="premium-project-hero">
              <img src={selectedProject.thumbnail || selectedProject.heroImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85'} alt={selectedProject.name} />
              <div className="premium-project-hero-scrim" />
              <div className="premium-project-hero-actions" aria-label="Project actions">
                <button type="button" onClick={() => toggleSavedProject(selectedProject.id)} aria-label={savedProjectIds.has(selectedProject.id) ? 'Remove from saved projects' : 'Save project'}>
                  <Heart size={18} fill={savedProjectIds.has(selectedProject.id) ? 'currentColor' : 'none'} />
                </button>
                <button type="button" onClick={shareProject} aria-label="Share project"><Share2 size={18} /></button>
                <button type="button" onClick={closePanel} aria-label="Close project details"><X size={18} /></button>
              </div>
              <div className="premium-project-hero-copy">
                <h1>{selectedProject.name}</h1>
                {selectedLocation && <p><MapPin size={15} /> {selectedLocation}</p>}
                <strong>From {heroPrice}</strong>
              </div>
            </section>

            <div className="premium-project-body">
              <section className="premium-project-section premium-project-stats-shell">
                <div className="premium-section-heading">
                  <div>
                    <span>QUICK STATS</span>
                    <h3>Quick Stats</h3>
                  </div>
                </div>
                <div className="premium-project-stats" aria-label="Project highlights">
                  <div><span>Plot Size</span><strong>{plotArea ? `${new Intl.NumberFormat('en-IN').format(plotArea)} sq.ft.` : '—'}</strong></div>
                  <div><span>Plots Left</span><strong>{plotsLeftLabel}</strong></div>
                  <div><span>Land Zone</span><strong>{landZoneLabel || '—'}</strong></div>
                  <div><span>NA Status</span><strong>{getNaStatusLabel(selectedProject) || '—'}</strong></div>
                </div>
              </section>

              <section className="premium-project-section premium-project-action-section" aria-label="Primary actions">
                <div className="premium-project-actions" aria-label="Primary actions">
                  <button type="button" className="premium-book-visit" onClick={() => setShowBookingModal(true)}><CalendarDays size={18} /> Book Site Visit</button>
                  <button type="button" onClick={openWhatsApp}><MessageCircle size={18} /> WhatsApp</button>
                  <button type="button" onClick={openDirections}><Navigation size={18} /> Directions</button>
                  <button type="button" onClick={shareProject}><Share2 size={18} /> Share</button>
                </div>
              </section>

              <section className="premium-project-score">
                <div className="premium-section-heading"><div><span>OVERVIEW</span><h3>Druvio Score</h3></div>{score && <strong>{score}<small>/100</small></strong>}</div>
                <p>{score ? 'A concise overview based on the project information available in Druvio.' : 'A Druvio Score will appear once enough project information is available.'}</p>
                {scoreSignals.length > 0 && <ul>{scoreSignals.slice(0, 4).map((signal) => <li key={signal}><Check size={15} /> {signal}</li>)}</ul>}
              </section>

              <section className="premium-project-section">
                <div className="premium-section-heading"><div><span>AMENITIES</span><h3>Amenities</h3></div></div>
                {selectedAmenities.length > 0
                  ? <div className="premium-feature-grid">{selectedAmenities.slice(0, 6).map((item, index) => <div key={`${item}-${index}`}><Check size={16} /><span>{item}</span></div>)}</div>
                  : <p>No amenities have been added yet.</p>}
              </section>

              <section className="premium-project-section premium-documents-section">
                <div className="premium-section-heading"><div><span>DOCUMENTS</span><h3>Documents</h3></div><FileCheck size={20} /></div>
                {documentsLoading ? <p>Loading documents…</p> : <><p>{selectedDocuments.length ? 'Verified Documents' : 'No documents uploaded.'}</p>{allSelectedDocuments.length > 0 && <button type="button" className="premium-outline-action" onClick={() => setDocumentViewer(selectedDocuments[0] || allSelectedDocuments[0])}>View Documents <ChevronRight size={16} /></button>}</>}
              </section>

              <section className="premium-project-section premium-location-section">
                <div className="premium-section-heading"><div><span>LOCATION</span><h3>Location</h3></div><MapPin size={20} /></div>
                {mapPreviewUrl && (
                  <div className="premium-location-preview">
                    <iframe src={mapPreviewUrl} title={`${selectedProject.name} location preview`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                )}
                <div className="premium-location-actions">
                  <button type="button" className="premium-outline-action" onClick={openFullscreenLocation}>Open Fullscreen <ExternalLink size={16} /></button>
                  <button type="button" className="premium-outline-action" onClick={openDirections}>Navigate <Navigation size={16} /></button>
                </div>
              </section>

              {isAdmin && (
                <section className="details-admin-controls-block">
                  <div className="premium-section-heading">
                    <div>
                      <span>ADMIN TOOLS</span>
                      <h3>Admin Tools</h3>
                    </div>
                  </div>
                  <div className="admin-actions-row">
                    {adminActions.map(({ label, icon: Icon, onClick, danger }) => (
                      <button key={label} type="button" onClick={onClick} className={`btn-admin-action${danger ? ' danger' : ''}`}>
                        <Icon size={16} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`buyer-map-first-root buyer-screen-${activeScreen}`}>
      <div className="buyer-map-canvas">
        <MapScreen
          projects={filteredProjects}
          selectedProject={selectedProject}
          onSelectProject={handleProjectSelect}
          onViewProjectDetails={openFullProjectDetails}
          showProjectPopup={panelMode !== 'project'}
          activeLayout={activeLayout}
          onActiveLayoutChange={setActiveLayout}
          onVisibleProjectsChange={setVisibleProjects}
          filters={mapFilters}
          externalOverlayOpen={filtersOpen || panelOpen}
          onLayersOpen={() => setFiltersOpen(false)}
        />
      </div>

      {activeScreen === 'map' && (
        <>
        </>
      )}

      <header className="buyer-workspace-header">
        <div className="buyer-workspace-search-shell">
        <label className="buyer-workspace-search">
          <span className="buyer-search-brand" aria-hidden="true"><MapPin size={19} /></span>
          <input
            type="search"
            placeholder="Search projects"
            value={homeSearchQuery}
            onChange={(event) => {
              setHomeSearchQuery(event.target.value);
              setActiveScreen('home');
              if (panelMode) setPanelMode(null);
            }}
            onKeyDown={searchEnteredLocation}
            aria-label="Search plot projects"
          />
          {homeSearchQuery && (
            <button type="button" className="buyer-search-clear" onClick={() => setHomeSearchQuery('')} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
          <button type="button" className={`buyer-search-tool ${voiceSearchActive ? 'active' : ''}`} onClick={startVoiceSearch} aria-label="Search by voice" title="Search by voice">
            <Mic size={18} />
          </button>
        </label>
        {(homeSearchQuery.trim().length >= 2) && (
          <div className="buyer-map-search-results" role="listbox" aria-label="Search suggestions">
            {searchableProjects.map((project) => (
              <button key={`project-${project.id}`} type="button" onClick={() => { handleProjectSelect(project); setPlaceSuggestions([]); }}>
                <Building2 size={18} /><span><strong>{project.name}</strong><small>{getDisplayLocation(project) || 'Druvio approved project'}</small></span>
              </button>
            ))}
            {placeSuggestions.map((suggestion) => (
              <button key={suggestion.placePrediction.placeId} type="button" onClick={() => selectPlaceSuggestion(suggestion)}>
                <MapPin size={18} /><span><strong>{suggestion.placePrediction.mainText?.toString() || suggestion.placePrediction.text.toString()}</strong><small>{suggestion.placePrediction.secondaryText?.toString() || 'Location'}</small></span>
              </button>
            ))}
            {placeSearchError && <p>{placeSearchError}</p>}
            {!placeSearchError && searchableProjects.length === 0 && placeSuggestions.length === 0 && <p>Searching locations…</p>}
          </div>
        )}
        </div>
        <ProfileDropdown
          user={user}
          onThemeToggle={onThemeToggle}
          isDarkMode={isDarkMode}
          permissions={permissions}
          currentView={currentView}
          onViewChange={onViewChange}
          onBackToAdmin={onBackToAdmin}
          selectedSeller={selectedSeller}
          hideChevron
        />
      </header>

      <aside className="buyer-map-nav" aria-label="Buyer navigation">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = !item.disabled && activeSidebarItem === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`buyer-map-nav-btn ${active ? 'active' : ''}`}
              disabled={item.disabled}
              title={item.disabled ? `${item.label} coming soon` : item.label}
              onClick={() => !item.disabled && navigateToScreen(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>

      {activeScreen === 'home' && (
        <main className="buyer-primary-screen buyer-home-screen" aria-labelledby="buyer-home-title">
          <div className="buyer-primary-screen-inner">
            <h1 id="buyer-home-title" className="buyer-home-title">Buyer Home</h1>
            {renderHomePanel()}
          </div>
        </main>
      )}

      {activeScreen === 'cashback' && (
        <main className="buyer-primary-screen buyer-cashback-screen" aria-label="Cashback claim">
          {renderCashbackPanel()}
        </main>
      )}

      <section className={`buyer-slide-panel ${panelOpen ? 'open' : ''}`}>
        <div className="buyer-slide-panel-shell">
          {panelMode !== 'project' && <div className="buyer-slide-panel-head">
            <div>
              <span className="buyer-panel-kicker">{panelKicker}</span>
              <h3>{panelTitle}</h3>
            </div>
            <div className="buyer-panel-head-actions">
              <button type="button" className="buyer-panel-close" onClick={closePanel} aria-label="Close panel">
                <X size={18} />
              </button>
            </div>
          </div>}

          {panelMode === 'project' && renderProjectPanel()}
        </div>
      </section>

      <nav className="buyer-mobile-nav" aria-label="Buyer mobile navigation">
        <button type="button" className={`buyer-mobile-nav-btn ${activeScreen === 'home' ? 'active' : ''}`} onClick={() => navigateToScreen('home')}>
          <Home size={18} />
          <span>Home</span>
        </button>
        <button type="button" className={`buyer-mobile-nav-btn ${activeScreen === 'cashback' ? 'active' : ''}`} onClick={() => navigateToScreen('cashback')}>
          <Gift size={18} />
          <span>Cashback</span>
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

      {documentViewer && (
        <div className="document-viewer-overlay" role="dialog" aria-modal="true" aria-labelledby="document-viewer-title">
          <div className="document-viewer-shell">
            <div className="document-viewer-header">
              <div><span>Verified by Druvio</span><h3 id="document-viewer-title">{getProjectDocumentLabel(documentViewer.type)}</h3></div>
              <div>
                <a href={documentViewer.url} target="_blank" rel="noreferrer">Open externally</a>
                <button type="button" onClick={() => setDocumentViewer(null)} aria-label="Close document viewer"><X size={18} /></button>
              </div>
            </div>
            <iframe src={documentViewer.url} title={getProjectDocumentLabel(documentViewer.type)} />
          </div>
        </div>
      )}

    </div>
  );
}

export default BuyerApp;
