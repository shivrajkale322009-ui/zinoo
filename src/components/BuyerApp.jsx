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
  Loader2,
  IndianRupee,
  UserRound,
  Phone,
  Mic,
  Newspaper,
  Sparkles,
  Play,
  Pause,
  ChevronRight
} from 'lucide-react';
import { storage } from '../firebaseConfig';
import { isProjectPublishable } from '../utils/projectVisibility';
import { calculateCashbackForArea, getCashbackPerGuntha, squareFeetToGuntha } from '../utils/projectArea';
import { CHAKAN_MAP_POSITION } from '../utils/chakanLocation';
import { getProjectCompleteness } from '../utils/projectCompleteness';
import { formatIndianCurrency } from '../utils/formatIndian';
import { deriveNearbyUpdates, getDailyActivitySummary } from '../utils/nearbyUpdates';
import { matchesAssistantFilters, parsePropertyQuery } from '../utils/propertyAssistant';
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
  { id: 'general', label: 'General Information' },
  { id: 'layouts', label: 'Layouts' },
  { id: 'media', label: 'Media' },
  { id: 'documents', label: 'Documents' },
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
  thumbnailPath: '',
  thumbnailMetadata: null,
  amenities: '',
  status: 'approved',
  cashbackAmount: '',
  whatsappNumber: '',
  siteVisitContact: '',
  googleMapsLink: '',
  website: '',
  reraNumber: '',
  documents: []
});

const DEFAULT_FILTERS = {
  budgetMax: 3000000,
  distanceMax: 10,
  landZones: [],
  naStatuses: [],
  bankLoan: false,
  minScore: 0
};

const SIDEBAR_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'map', label: 'Map', icon: Compass },
  { id: 'feed', label: 'Feed', icon: Newspaper },
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
  const [assistantSummary, setAssistantSummary] = useState('');
  const [discoveryIndex, setDiscoveryIndex] = useState(0);
  const [discoveryActive, setDiscoveryActive] = useState(false);
  const [discoveryPaused, setDiscoveryPaused] = useState(false);

  const approvedProjects = useMemo(
    () => projects.filter(isProjectPublishable),
    [projects]
  );
  const filteredProjects = useMemo(
    () => approvedProjects.filter((project) => matchesProjectFilters(project, mapFilters)),
    [approvedProjects, mapFilters]
  );
  const nearbyUpdates = useMemo(() => deriveNearbyUpdates(filteredProjects), [filteredProjects]);
  const dailyActivity = useMemo(() => getDailyActivitySummary(filteredProjects), [filteredProjects]);

  useEffect(() => {
    if (!discoveryActive || discoveryPaused || filteredProjects.length < 2 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => setDiscoveryIndex((current) => (current + 1) % filteredProjects.length), 7000);
    return () => window.clearInterval(timer);
  }, [discoveryActive, discoveryPaused, filteredProjects.length]);

  useEffect(() => {
    if (!discoveryActive || !filteredProjects.length) return;
    const project = filteredProjects[discoveryIndex % filteredProjects.length];
    setSelectedProject(project);
    setActiveScreen('map');
    setPanelMode(null);
    window.dispatchEvent(new CustomEvent('druvio-focus-project', { detail: { project } }));
  }, [discoveryActive, discoveryIndex, filteredProjects]);

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

  const runPropertyAssistant = useCallback(() => {
    const filters = parsePropertyQuery(homeSearchQuery);
    const results = approvedProjects.filter((project) => matchesAssistantFilters(project, filters));
    const labels = [filters.budgetMax && `under ${formatIndianCurrency(filters.budgetMax)}`, filters.landZones?.length && filters.landZones[0], filters.location && `near ${filters.location}`, filters.cashback && 'cashback'].filter(Boolean);
    setAssistantSummary(labels.length ? `${results.length} project${results.length === 1 ? '' : 's'} match ${labels.join(' · ')}` : 'Try a query like “verified plots below ₹15 lakh near Chakan”.');
    if (results[0]) handleProjectSelect(results[0]);
  }, [approvedProjects, handleProjectSelect, homeSearchQuery]);

  const startDiscovery = useCallback(() => {
    if (!filteredProjects.length) return;
    setDiscoveryIndex(0);
    setDiscoveryPaused(false);
    setDiscoveryActive(true);
    setSelectedProject(null);
    setPanelMode(null);
    setActiveScreen('map');
  }, [filteredProjects.length]);

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
    setEditForm(getProjectFormFromRecord(selectedProject));
    setProjectManagerTab(tab);
    setProjectManagerOpen(true);
    setPanelMode('project');
  };

  const handleSaveProjectDetails = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    const completeness = getProjectCompleteness({ ...selectedProject, ...editForm });
    const publishing = ['approved', 'Active'].includes(editForm.status);
    if (publishing && !completeness.isComplete) {
      setProjectManagerError('Complete the required project information before publishing this project. You can save it as a draft or pending review instead.');
      return;
    }

    try {
      setProjectManagerError('');
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
  const documentsLoading = Boolean(selectedProject && loadingLayouts && selectedDocuments.length === 0);
  const selectedWhatsAppUrl = buildWhatsAppUrl(selectedProject);
  const selectedNavigateUrl = getNavigateUrl(selectedProject);
  const panelOpen = panelMode === 'project';
  const panelTitle = selectedProject?.name || 'Project';
  const panelKicker = 'Selected project';
  const activeFilterCount = mapFilters.landZones.length
    + mapFilters.naStatuses.length
    + Number(mapFilters.bankLoan)
    + Number(mapFilters.budgetMax !== DEFAULT_FILTERS.budgetMax)
    + Number(mapFilters.distanceMax !== DEFAULT_FILTERS.distanceMax);

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

    const field = (key, label, type = 'text', required = false, placeholder = '') => (
      <label className="project-manager-field">
        <span>{label}{required ? ' *' : ''}</span>
        <input
          required={required}
          type={type}
          className="project-manager-input"
          placeholder={placeholder}
          value={editForm[key]}
          min={key === 'cashbackAmount' ? '0' : undefined}
          step={key === 'cashbackAmount' ? '1' : undefined}
          onChange={(event) => setEditForm({ ...editForm, [key]: event.target.value })}
        />
      </label>
    );

    return (
      <form onSubmit={handleSaveProjectDetails} className="project-manager-form">
        <section className={`project-completeness-panel ${completeness.isComplete ? 'complete' : ''}`}>
          <div><span>Project completeness</span><strong>{completeness.score}%</strong></div>
          <p>{completeness.missingRequired.length} required missing · {completeness.invalidFields.length} invalid · {completeness.unverifiedDocuments.length} documents awaiting verification</p>
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
            <div className="project-manager-card">
              <div className="project-manager-card-head">
                <div>
                  <span className="project-manager-kicker">Required fields</span>
                  <h4>Core project information</h4>
                </div>
              </div>
              <div className="project-manager-grid">
                {field('name', 'Project Name', 'text', true, 'Project name')}
                {field('developer', 'Projected by', 'text', true, 'Company or project owner')}
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
                {field('totalPlots', 'Total Plots', 'number')}
                {field('minimumPlotArea', 'Minimum Plot Area (sq.ft.)', 'number')}
                {field('village', 'Village')}
                {field('taluka', 'Taluka')}
                {field('area', 'Area')}
                {field('latitude', 'Latitude', 'number')}
                {field('longitude', 'Longitude', 'number')}
                <label className="project-manager-field"><span>Land Zone</span><select className="project-manager-input" value={editForm.landZone} onChange={(event) => setEditForm({ ...editForm, landZone: event.target.value })}><option value="">Select zone</option>{LAND_ZONE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                <label className="project-manager-field"><span>NA Status</span><select className="project-manager-input" value={editForm.naStatus} onChange={(event) => setEditForm({ ...editForm, naStatus: event.target.value })}><option value="">Select status</option>{NA_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                {field('cashbackAmount', 'Cashback amount', 'number', false, 'Fixed amount in ₹')}
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
              <label className="project-manager-field">
                <span>Project thumbnail</span>
                <input type="file" className="project-manager-input" accept="image/jpeg,image/png,image/webp" disabled={projectUploadBusy === 'thumbnail'} onChange={(event) => uploadProjectManagerFile(event.target.files?.[0], 'thumbnail')} />
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
      <section className="buyer-explore-map-card">
        <div><span>Explore your next plot</span><h2>Projects, clearly mapped.</h2><p>Browse approved plotting projects around Chakan and the Pune growth corridor.</p></div>
        <div className="buyer-explore-map-actions"><button type="button" className="btn-primary" onClick={() => navigateToScreen('map')}><Compass size={17} /> Explore Projects on Map</button><button type="button" className="buyer-discovery-trigger" onClick={startDiscovery} disabled={!filteredProjects.length}><Sparkles size={16} /> Discovery</button></div>
      </section>
      <section className="buyer-assistant-card" aria-label="Property search assistant">
        <div><Sparkles size={17} /><strong>Smart property search</strong><span>Try: “verified plots below ₹15 lakh near Chakan”</span></div>
        <button type="button" onClick={runPropertyAssistant}>Search</button>
        {assistantSummary && <p>{assistantSummary}</p>}
      </section>
      {nearbyUpdates.length > 0 && <section className="buyer-panel-section"><div className="buyer-panel-section-head"><h4>What’s Happening Nearby</h4><button type="button" onClick={() => navigateToScreen('feed')}>See all <ChevronRight size={15} /></button></div><div className="nearby-updates-rail">{nearbyUpdates.slice(0, 4).map((update) => <button type="button" key={update.id} className="nearby-update-card" onClick={() => handleProjectSelect(update.project)}>{update.image && <img loading="lazy" src={update.image} alt="" />}<span>{update.type}</span><strong>{update.headline}</strong><small>{update.area} · {update.timestamp}</small></button>)}</div></section>}
      {dailyActivity.length > 0 && <section className="buyer-daily-activity"><span>Updated today</span>{dailyActivity.map((activity) => <div key={activity.label}><strong>{activity.value}</strong><small>{activity.label}</small></div>)}</section>}
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
              <label className="buyer-filter-range">
                <span>Maximum distance</span><strong>{mapFilters.distanceMax} km</strong>
                <input type="range" min="1" max="20" step="1" value={mapFilters.distanceMax} onChange={(event) => setMapFilters({ ...mapFilters, distanceMax: Number(event.target.value) })} />
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

  const renderFeedPanel = () => (
    <div className="buyer-side-panel-content buyer-feed-content">
      <section className="buyer-feed-header"><div><span>Location-based updates</span><h1>Nearby activity</h1><p>Recent project and verification updates derived from approved Druvio listings.</p></div><button type="button" className="btn-secondary" onClick={() => navigateToScreen('map')}><Compass size={16} /> Explore map</button></section>
      {nearbyUpdates.length === 0 ? <div className="feed-empty-state"><Newspaper size={26} /><p>No recent project updates are available yet.</p></div> : <div className="buyer-feed-list">{nearbyUpdates.map((update) => <article key={update.id} className="buyer-feed-item">{update.image && <img loading="lazy" src={update.image} alt="" />}<div><span>{update.type}</span><h2>{update.headline}</h2><p>{update.description}</p><small>{update.area} · {update.timestamp}</small><button type="button" onClick={() => handleProjectSelect(update.project)}>View on Map <ChevronRight size={15} /></button></div></article>)}</div>}
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
              <div className="details-title-row">
                <h2>{selectedProject.name}</h2>
                <div className="details-header-actions" aria-label="Project actions">
                  {selectedWhatsAppUrl && (
                    <a href={selectedWhatsAppUrl} target="_blank" rel="noreferrer" className="details-icon-action details-icon-whatsapp" aria-label="Contact seller on WhatsApp" title="Contact seller on WhatsApp">
                      <MessageCircle size={18} aria-hidden="true" />
                    </a>
                  )}
                  {selectedNavigateUrl && (
                    <button type="button" className="details-icon-action" onClick={() => window.open(selectedNavigateUrl, '_blank')} aria-label="Navigate to project" title="Navigate to project">
                      <Navigation size={18} aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="details-icon-action"
                    onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => alert('Link copied!'))}
                    aria-label="Share listing"
                    title="Share listing"
                  >
                    <Share2 size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
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
                    <span>Projected by</span>
                    <strong>{selectedProject.developer}</strong>
                  </div>
                )}
                <div className="spec-card">
                  <span>Land Zone</span>
                  <strong>{getLandZoneLabel(selectedProject)}</strong>
                </div>
                <div className="spec-card">
                  <span>NA Status</span>
                  <strong>{getNaStatusLabel(selectedProject)}</strong>
                </div>
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

              <section className="project-documents-section project-layout-preview" aria-labelledby="project-layout-title">
                <div className="project-documents-heading">
                  <div>
                    <span className="project-manager-kicker">Verified geography</span>
                    <h4 id="project-layout-title">Layout Preview</h4>
                  </div>
                  {selectedProject.layoutAreaSqFt && <span>{new Intl.NumberFormat('en-IN').format(selectedProject.layoutAreaSqFt)} sq.ft.</span>}
                </div>
                {selectedProject.layoutPolygon ? (
                  <button type="button" className="btn-secondary" onClick={() => window.dispatchEvent(new CustomEvent('druvio-view-project-layout', { detail: { projectId: selectedProject.id } }))}>
                    View layout in fullscreen satellite map
                  </button>
                ) : (
                  <p className="project-documents-empty">Layout not available for this legacy project.</p>
                )}
              </section>

              <section className="project-documents-section" aria-labelledby="project-documents-title">
                  <div className="project-documents-heading">
                    <div>
                      <span className="project-manager-kicker">Due diligence</span>
                      <h4 id="project-documents-title">Project Documents</h4>
                    </div>
                    <span>{getVerifiedDocumentCount(selectedProject)} verified</span>
                  </div>
                  {documentsLoading ? (
                    <p className="project-documents-empty">Loading documents…</p>
                  ) : selectedDocuments.length === 0 ? (
                    <p className="project-documents-empty">No verified documents are available yet. Documents will appear here once they are submitted and reviewed.</p>
                  ) : (
                    <div className="project-document-list">
                    {selectedDocuments.map((document, index) => {
                      const updatedDate = formatDocumentDate(document.updatedAt);
                      const verified = document.status === 'verified';
                      return (
                        <article key={`${document.type}-${index}`} className="project-document-row">
                          <span className={`project-document-icon ${verified ? 'verified' : ''}`}><FileText size={18} /></span>
                          <div>
                            <strong>{getProjectDocumentLabel(document.type)}</strong>
                            <span>{verified ? 'Verified by Druvio' : 'Pending verification'}{updatedDate ? ` • Updated ${updatedDate}` : ''}</span>
                          </div>
                          <button type="button" className="project-document-link" onClick={() => setDocumentViewer(document)}>View document</button>
                        </article>
                      );
                    })}
                    </div>
                  )}
                </section>

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
                  <button onClick={() => setShowBookingModal(true)} className="btn-primary site-visit-btn">
                    Book Site Visit
                  </button>
                </div>

                {isAdmin && (
                  <div className="details-admin-controls-block">
                    <span className="admin-block-title"><Settings size={12} /> Admin Actions</span>
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
          {discoveryActive && <div className="buyer-discovery-controls" role="status"><span><Sparkles size={15} /> Discovery mode · {Math.min(discoveryIndex + 1, filteredProjects.length)} of {filteredProjects.length}</span><button type="button" onClick={() => setDiscoveryIndex((current) => (current - 1 + filteredProjects.length) % filteredProjects.length)}>Previous</button><button type="button" onClick={() => setDiscoveryIndex((current) => (current + 1) % filteredProjects.length)}>Next</button><button type="button" onClick={() => setDiscoveryPaused((current) => !current)}>{discoveryPaused ? <Play size={15} /> : <Pause size={15} />}{discoveryPaused ? 'Resume' : 'Pause'}</button><button type="button" onClick={() => setDiscoveryActive(false)}>Exit</button></div>}
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
            <h1 id="buyer-home-title" className="sr-only">Buyer Home</h1>
            {renderHomePanel()}
          </div>
        </main>
      )}

      {activeScreen === 'feed' && (
        <main className="buyer-primary-screen buyer-feed-screen" aria-label="Nearby activity feed">
          <div className="buyer-primary-screen-inner">{renderFeedPanel()}</div>
        </main>
      )}

      {activeScreen === 'cashback' && (
        <main className="buyer-primary-screen buyer-cashback-screen" aria-label="Cashback claim">
          {renderCashbackPanel()}
        </main>
      )}

      <section className={`buyer-slide-panel ${panelOpen ? 'open' : ''}`}>
        <div className="buyer-slide-panel-shell">
          <div className="buyer-slide-panel-head">
            <div>
              <span className="buyer-panel-kicker">{panelKicker}</span>
              <h3>{panelTitle}</h3>
            </div>
            <div className="buyer-panel-head-actions">
              <button type="button" className="buyer-panel-close" onClick={closePanel} aria-label="Close panel">
                <X size={18} />
              </button>
            </div>
          </div>

          {panelMode === 'project' && renderProjectPanel()}
        </div>
      </section>

      <nav className="buyer-mobile-nav" aria-label="Buyer mobile navigation">
        <button type="button" className={`buyer-mobile-nav-btn ${activeScreen === 'home' ? 'active' : ''}`} onClick={() => navigateToScreen('home')}>
          <Home size={18} />
          <span>Home</span>
        </button>
        <button type="button" className={`buyer-mobile-nav-btn ${activeScreen === 'feed' ? 'active' : ''}`} onClick={() => navigateToScreen('feed')}>
          <Newspaper size={18} />
          <span>Feed</span>
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
