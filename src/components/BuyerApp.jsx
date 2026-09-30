import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  formatDocumentDate,
  getProjectDocumentLabel,
  normalizeProjectDocuments
} from '../utils/projectDocuments';
import {
  Gift,
  ArrowLeft,
  BadgeCheck,
  Search,
  MessageSquare,
  Check,
  X,
  Globe,
  ExternalLink,
  FileText,
  Camera,
  Loader2,
  IndianRupee,
  UserRound,
  Phone,
  ChevronRight,
  Clock3,
  Eye,
  PieChart,
  Route,
  Share2,
  Heart
} from 'lucide-react';
import { functions, storage } from '../firebaseConfig';
import { isProjectPublishable, PROPERTY_STATUS } from '../utils/projectVisibility';
import useMediaQuery from '../utils/useMediaQuery';
import { getProjectPurchaseValue } from '../utils/purchaseValue';
import { calculateCashbackForArea, getCashbackPerGuntha, squareFeetToGuntha } from '../utils/projectArea';
import { normalizePropertyImages, openDocumentPreview } from './PropertyMediaDocumentsManager';
import { getPropertyDisplayModel } from '../utils/propertyDisplayModel';
import { mergeFreshProject } from '../utils/projectFreshness';
import {
  LAND_ZONE_OPTIONS,
  NA_STATUS_OPTIONS,
  getLandZoneLabel,
  getNaStatusLabel,
  matchesProjectFilters
} from '../utils/projectLand';
import {
  loadProjectLayouts,
  deleteProjectLayout,
  duplicateProjectLayout,
  deleteProject
} from '../maps/projectMapService';
import { DEFAULT_FILTERS, SIDEBAR_ITEMS } from './Buyer/buyerConstants';
import BuyerDesktopNavigation from './Buyer/Navigation/BuyerDesktopNavigation';
import BuyerMobileNavigation from './Buyer/Navigation/BuyerMobileNavigation';
import BuyerLoanScreen from './Buyer/Loan/BuyerLoanScreen';
import CashbackProjectSelect from './CashbackProjectSelect';
import DesktopHeader from './Buyer/Shell/DesktopHeader';
import BuyerHomePanel from './Buyer/Home/BuyerHomePanel';
import BuyerFilters from './Buyer/Home/BuyerFilters';
import BuyerHomeScreen from './Buyer/Home/BuyerHomeScreen';
import StaticMap from './map/StaticMap';
import { readPersistentCache, writeStartupCache } from '../utils/startupCache';
import { CHAKAN_MAP_POSITION } from '../utils/chakanLocation';
import BuyerProjectActions from './Buyer/ProjectDetails/BuyerProjectActions';
import BuyerProjectMedia from './Buyer/ProjectDetails/BuyerProjectMedia';
import useBuyerSearch from './Buyer/Search/useBuyerSearch';
import {
  buildWhatsAppUrl,
  formatCashbackLabel,
  formatExactINR,
  formatINR,
  getNavigateUrl,
  hasValue
} from './Buyer/buyerPresentation';
import { trackLead, trackViewContent } from '../utils/metaPixel';
import { getProjectPublicUrl } from '../utils/projectPublicUrl';
import { getProjectShareData } from '../utils/projectShare';

const InteractiveMap = lazy(() => import('./map/InteractiveMap'));
const CashbackWorkspace = lazy(() => import('./CashbackWorkspace'));
const BuyerSupportScreen = lazy(() => import('./Buyer/Support/BuyerSupportScreen'));
const BuyerDeveloperProfile = lazy(() => import('./Buyer/Developer/BuyerDeveloperProfile'));
const BuyerProjectDetails = lazy(() => import('./Buyer/ProjectDetails/BuyerProjectDetails'));
const BuyerSavedScreen = lazy(() => import('./Buyer/Saved/BuyerSavedScreen'));

const getSafeAreaInsetTop = () => {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top, 0px)';
  document.body.append(probe);
  const inset = Number.parseFloat(getComputedStyle(probe).paddingTop) || 0;
  probe.remove();
  return inset;
};

function BuyerApp({
  projects,
  leads,
  visits,
  cashbacks,
  notifications = [],
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
  selectedSeller,
  projectsLoading = false,
  onAccountDeleted,
  onRequireAuth,
  routeProject = null,
  routeStatus = 'idle',
  routeSlug = '',
  onProjectRouteChange
}) {
  const isAndroidLayout = useMediaQuery('(max-width: 768px)');
  const [activeScreen, setActiveScreen] = useState('map');
  const loanReturnScreen = useRef('map');
  const [loanPlotPrice, setLoanPlotPrice] = useState(null);
  const [panelMode, setPanelMode] = useState(null);
  const [mobileSheetSnap, setMobileSheetSnap] = useState('expanded');
  // Preserve the compact map-marker preview when the selected project's URL
  // route finishes resolving after a marker tap.
  const [mapMarkerPreviewProjectId, setMapMarkerPreviewProjectId] = useState('');
  const mobileSheetDragRef = useRef(null);
  const mobileSheetRef = useRef(null);
  const mobileSheetCompactRef = useRef(null);
  const mobileSheetMetricsRef = useRef(null);
  const mobileSheetFrameRef = useRef(null);
  const resumedPublicIntentRef = useRef(false);
  const trackedProjectDetailRef = useRef('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [pendingMapFocusProjectId, setPendingMapFocusProjectId] = useState('');
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [developerProfile, setDeveloperProfile] = useState(null);
  const [developerProfileLoading, setDeveloperProfileLoading] = useState(false);
  const [developerProfileError, setDeveloperProfileError] = useState('');
  const [mapDeveloperId, setMapDeveloperId] = useState('');
  const [projectLayouts, setProjectLayouts] = useState([]);
  const [activeLayout, setActiveLayout] = useState(null);
  const [loadingLayouts, setLoadingLayouts] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // The map is the default buyer destination and begins loading immediately.
  const [interactiveMap, setInteractiveMap] = useState(activeScreen === 'map');
  const [interactiveMapReady, setInteractiveMapReady] = useState(false);
  const enableInteractiveMap = useCallback(() => setInteractiveMap(true), []);
  const handleInteractiveMapReady = useCallback(() => setInteractiveMapReady(true), []);
  const [mapFilters, setMapFilters] = useState(DEFAULT_FILTERS);
  const savedCacheKey = `saved-projects:${user?.uid || 'guest'}`;
  const [savedProjectIds, setSavedProjectIds] = useState(() => new Set(readPersistentCache(savedCacheKey, [])));
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', date: '', time: '11:00 AM' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [cashbackForm, setCashbackForm] = useState({ purchasedAreaSqFt: '', projectId: '', proofFile: null });
  const [cashbackSuccess, setCashbackSuccess] = useState(false);
  const [cashbackSubmitting, setCashbackSubmitting] = useState(false);
  const [cashbackError, setCashbackError] = useState('');
  const [cashbackView, setCashbackView] = useState('claim');
  const [documentViewer, setDocumentViewer] = useState(null);
  const [galleryViewerIndex, setGalleryViewerIndex] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [projectScrollTop, setProjectScrollTop] = useState(0);
  const isAuthenticated = Boolean(user?.uid);
  const requireAuthentication = useCallback((intent) => {
    window.dispatchEvent(new CustomEvent('zinoo:capture-map-auth-context'));
    onRequireAuth?.({
      ...intent,
      activeScreen,
      mapFilters,
      panelMode,
      selectedProjectId: selectedProject?.id || '',
      mobileSheetSnap
    });
  }, [activeScreen, mapFilters, mobileSheetSnap, onRequireAuth, panelMode, selectedProject?.id]);

  const activeProjects = useMemo(
    () => projects.filter(isProjectPublishable),
    [projects]
  );
  const savedProjects = useMemo(
    () => activeProjects.filter((project) => savedProjectIds.has(project.id)),
    [activeProjects, savedProjectIds]
  );
  const unavailableSavedProjectCount = Math.max(0, savedProjectIds.size - savedProjects.length);

  useEffect(() => {
    setSavedProjectIds(new Set(readPersistentCache(savedCacheKey, [])));
  }, [savedCacheKey]);
  const filteredProjects = useMemo(
    () => activeProjects.filter((project) => matchesProjectFilters(project, mapFilters)),
    [activeProjects, mapFilters]
  );
  const developerProjects = useMemo(() => selectedDeveloper ? activeProjects.filter((project) => project.ownerId === selectedDeveloper.sellerId) : [], [activeProjects, selectedDeveloper]);
  const mapProjects = useMemo(() => mapDeveloperId ? filteredProjects.filter((project) => project.ownerId === mapDeveloperId) : filteredProjects, [filteredProjects, mapDeveloperId]);
  useEffect(() => {
    if (!selectedDeveloper?.sellerId) return;
    let active = true;
    setDeveloperProfileLoading(true);
    setDeveloperProfileError('');
    httpsCallable(functions, 'getDeveloperProfile')({ sellerId: selectedDeveloper.sellerId }).then((result) => { if (active) setDeveloperProfile(result.data.profile); }).catch((error) => { console.error('[Zinoo Developer Profile] Load failed.', error); if (active) setDeveloperProfileError('Developer profile is temporarily unavailable.'); }).finally(() => { if (active) setDeveloperProfileLoading(false); });
    return () => { active = false; };
  }, [selectedDeveloper?.sellerId]);
  useEffect(() => {
    console.debug('[Zinoo listings] Buyer filters applied', {
      fetchedCount: projects.length,
      fetchedStatuses: projects.map(({ id, status }) => ({ id, status })),
      publicStatus: PROPERTY_STATUS.ACTIVE,
      publicCount: activeProjects.length,
      filters: mapFilters,
      resultCount: filteredProjects.length,
      results: filteredProjects.map(({ id, name, status }) => ({ id, name, status }))
    });
  }, [projects, activeProjects, mapFilters, filteredProjects]);

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
      if (panelMode === 'project') setPanelMode(null);
      return;
    }

    setLoadingLayouts(true);
    refreshLayouts(selectedProject.id)
      .then(() => setLoadingLayouts(false))
      .catch((err) => {
        console.error('[Zinoo] Error loading layouts:', err);
        setLoadingLayouts(false);
      });
  }, [panelMode, refreshLayouts, selectedProject]);

  useEffect(() => {
    if (panelMode !== 'project' || !selectedProject) {
      trackedProjectDetailRef.current = '';
      return;
    }
    const projectKey = String(selectedProject.id || selectedProject.name || 'project');
    if (trackedProjectDetailRef.current === projectKey) return;
    trackedProjectDetailRef.current = projectKey;
    trackViewContent(selectedProject);
  }, [panelMode, selectedProject]);

  useEffect(() => {
    const handleLayoutSaved = (event) => {
      if (!selectedProject?.id || event.detail?.projectId !== selectedProject.id) return;
      refreshLayouts(selectedProject.id, event.detail?.layoutId)
        .catch((err) => console.error('[Zinoo] Error refreshing layouts:', err));
    };

    window.addEventListener('flinok-layout-saved', handleLayoutSaved);
    return () => window.removeEventListener('flinok-layout-saved', handleLayoutSaved);
  }, [refreshLayouts, selectedProject]);

  const handleProjectSelect = useCallback((project, { mobileSheetSnap: nextMobileSheetSnap = 'expanded', fromMapMarker = false } = {}) => {
    if (!project) {
      setSelectedProject(null);
      setPanelMode(null);
      setMapMarkerPreviewProjectId('');
      onProjectRouteChange?.(null);
      return;
    }
    enableInteractiveMap();
    setMapMarkerPreviewProjectId(fromMapMarker ? String(project.id || '') : '');
    onProjectRouteChange?.(project);
    setSelectedProject(project);
    setActiveScreen('map');
    setPanelMode('project');
    setMobileSheetSnap(nextMobileSheetSnap);
    setProjectScrollTop(0);
  }, [enableInteractiveMap, onProjectRouteChange]);

  useEffect(() => {
    if (!routeSlug) {
      setMapMarkerPreviewProjectId('');
      if (selectedProject && panelMode === 'project') {
        setSelectedProject(null);
        setPanelMode(null);
      }
      return;
    }
    // The parent route state updates asynchronously. Do not let the previous
    // ready project replace a newly tapped marker while its route is loading.
    if (routeStatus !== 'ready' || !routeProject || routeProject.slug !== routeSlug) return;
    enableInteractiveMap();
    setSelectedProject((current) => {
      if (String(current?.id || '') !== String(routeProject.id || '')) return routeProject;
      // The public route projection can briefly lag behind the admin update.
      // Retain the already-selected property's presentation flag until the
      // projection catches up, rather than flashing the name badge away.
      const showVerifiedNameBadge = current.showVerifiedNameBadge === true
        || current.display?.verified?.showNameBadge === true
        || routeProject.showVerifiedNameBadge === true
        || routeProject.display?.verified?.showNameBadge === true;
      const resolvedRouteProject = {
        ...mergeFreshProject(current, routeProject),
        ...(showVerifiedNameBadge ? { showVerifiedNameBadge: true } : {})
      };
      const currentImage = current.thumbnail || current.heroImage || current.primaryImage || '';
      const routeImage = routeProject.thumbnail || routeProject.heroImage || routeProject.primaryImage || '';
      const currentImageIsFallback = String(currentImage).includes('zinoo-home-hero.webp');
      if (!currentImage || currentImageIsFallback || currentImage === routeImage) return resolvedRouteProject;
      return {
        ...resolvedRouteProject,
        thumbnail: currentImage,
        heroImage: currentImage,
        primaryImage: currentImage,
        images: current.images?.length ? current.images : routeProject.images
      };
    });
    setActiveScreen('map');
    setPanelMode('project');
    setMobileSheetSnap(isAndroidLayout && mapMarkerPreviewProjectId === String(routeProject.id || '') ? 'collapsed' : 'expanded');
    setProjectScrollTop(0);
  }, [enableInteractiveMap, isAndroidLayout, mapMarkerPreviewProjectId, panelMode, routeProject, routeSlug, routeStatus]);

  useEffect(() => {
    setSelectedProject((current) => {
      if (!current) return current;
      const latest = projects.find((project) => project.id === current.id);
      return latest ? mergeFreshProject(current, latest) : current;
    });
  }, [projects]);

  const handleHomeProjectSelect = useCallback((project) => {
    if (!project) return;
    setPendingMapFocusProjectId(project.id || 'selected-project');
    handleProjectSelect(project);
  }, [handleProjectSelect]);

  const handleMapProjectSelect = useCallback((project) => {
    if (!project) {
      handleProjectSelect(null);
      return;
    }
    handleProjectSelect(project, {
      fromMapMarker: isAndroidLayout,
      mobileSheetSnap: isAndroidLayout ? 'collapsed' : 'expanded'
    });
  }, [handleProjectSelect, isAndroidLayout]);

  const handleDeveloperSelect = useCallback((developer) => {
    if (!developer?.sellerId) return;
    setSelectedProject(null);
    setPanelMode(null);
    setSelectedDeveloper(developer);
    setDeveloperProfile(null);
    setActiveScreen('developer');
  }, []);

  useEffect(() => {
    if (resumedPublicIntentRef.current || !activeProjects.length) return;
    const storedIntent = window.sessionStorage.getItem('flinokPendingPropertyIntent');
    if (!storedIntent) return;
    let intent;
    try {
      intent = JSON.parse(storedIntent);
    } catch {
      window.sessionStorage.removeItem('flinokPendingPropertyIntent');
      return;
    }
    const normalizedName = String(intent?.project || '').trim().toLowerCase();
    const project = activeProjects.find((item) => item.id === intent?.projectId)
      || activeProjects.find((item) => String(item.name || '').trim().toLowerCase() === normalizedName);
    if (!project) return;
    resumedPublicIntentRef.current = true;
    window.sessionStorage.removeItem('flinokPendingPropertyIntent');
    handleProjectSelect(project);
  }, [activeProjects, handleProjectSelect]);

  const openFullProjectDetails = useCallback(() => {
    if (selectedProject) setPanelMode('project');
  }, [selectedProject]);

  const closePanel = useCallback(() => {
    if (panelMode === 'project') setSelectedProject(null);
    setPanelMode(null);
    setMapMarkerPreviewProjectId('');
    onProjectRouteChange?.(null);
  }, [onProjectRouteChange, panelMode]);

  const shareProject = useCallback(async () => {
    const url = getProjectPublicUrl(selectedProject);
    if (!url) return alert('This project does not have a public link yet.');
    const shareData = getProjectShareData(selectedProject, url);
    try {
      if (navigator.share) return await navigator.share(shareData);
      await navigator.clipboard?.writeText(shareData.text);
      alert('Project link copied.');
    } catch (error) {
      if (error?.name !== 'AbortError') alert('Unable to share this project right now.');
    }
  }, [selectedProject]);

  const navigateToScreen = useCallback((screen) => {
    if (screen !== 'loan') setLoanPlotPrice(null);
    if (screen === 'loan' && activeScreen !== 'loan') loanReturnScreen.current = activeScreen;
    if (screen === 'map') {
      enableInteractiveMap();
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('flinok-focus-location', {
          detail: { location: CHAKAN_MAP_POSITION, useDefaultZoom: true }
        }));
      }, 0);
    }
    if (screen !== 'map') setMapDeveloperId('');
    onProjectRouteChange?.(null);
    setSelectedProject(null);
    setPanelMode(null);
    setActiveScreen(screen);
  }, [activeScreen, enableInteractiveMap, onProjectRouteChange]);

  useEffect(() => {
    if (activeScreen !== 'cashback') return undefined;
    const handleBack = (event) => {
      event.preventDefault();
      navigateToScreen('home');
    };
    window.addEventListener('zinoo:buyer-back', handleBack);
    return () => window.removeEventListener('zinoo:buyer-back', handleBack);
  }, [activeScreen, navigateToScreen]);

  useEffect(() => {
    const handleNotificationNavigation = (event) => {
      const screen = event.detail?.screen;
      if (['home', 'map', 'saved', 'cashback', 'nearby', 'support'].includes(screen)) {
        navigateToScreen(screen);
      }
    };
    window.addEventListener('druvio:notification-navigation', handleNotificationNavigation);
    return () => window.removeEventListener('druvio:notification-navigation', handleNotificationNavigation);
  }, [navigateToScreen]);

  const {
    homeSearchQuery,
    setHomeSearchQuery,
    placeSuggestions,
    setPlaceSuggestions,
    placeSearchError,
    voiceSearchActive,
    searchableProjects,
    selectPlaceSuggestion,
    startVoiceSearch,
    searchEnteredLocation
  } = useBuyerSearch({
    filteredProjects,
    onProjectSelect: handleProjectSelect,
    onLocationSelected: () => {
      enableInteractiveMap();
      setActiveScreen('map');
      setPanelMode(null);
    },
    onVoiceResult: () => {
      setActiveScreen('home');
      setPanelMode(null);
    }
  });

  const toggleSavedProject = (projectId) => {
    if (!isAuthenticated) {
      requireAuthentication({ type: 'save-project', projectId });
      return;
    }
    setSavedProjectIds((current) => {
      const next = new Set(current);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      writeStartupCache(savedCacheKey, [...next]);
      return next;
    });
  };

  useEffect(() => {
    if (!isAuthenticated || !activeProjects.length) return;
    const stored = window.sessionStorage.getItem('zinooPendingAuthenticatedAction');
    if (!stored) return;
    let intent;
    try { intent = JSON.parse(stored); } catch { window.sessionStorage.removeItem('zinooPendingAuthenticatedAction'); return; }
    window.sessionStorage.removeItem('zinooPendingAuthenticatedAction');
    const project = activeProjects.find((item) => item.id === intent.projectId);
    const contextProject = activeProjects.find((item) => item.id === intent.selectedProjectId);
    if (intent.mapFilters) setMapFilters(intent.mapFilters);
    if (intent.resumeScreen || intent.activeScreen) setActiveScreen(intent.resumeScreen || intent.activeScreen);
    if (intent.mobileSheetSnap) setMobileSheetSnap(intent.mobileSheetSnap);
    if (contextProject) {
      setSelectedProject(contextProject);
      setPanelMode(intent.panelMode || null);
    }
    if (project && intent.type === 'save-project') toggleSavedProject(project.id);
    if (project && intent.type === 'book-visit') {
      handleProjectSelect(project);
      setShowBookingModal(true);
    }
    if (project && intent.type === 'contact-seller') {
      handleProjectSelect(project);
      if (intent.method === 'call') {
        const number = getPropertyDisplayModel(project).actions.callNumber;
        if (number) window.location.href = `tel:${String(number).replace(/[^\d+]/g, '')}`;
      } else {
        const url = buildWhatsAppUrl(project);
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
    if (intent.type === 'contact-support' && intent.phone) {
      const digits = String(intent.phone).replace(/[^\d]/g, '');
      if (digits) window.open(`https://wa.me/${digits}?text=${encodeURIComponent(intent.message || '')}`, '_blank', 'noopener,noreferrer');
    }
  // Run once when the authenticated project catalog has loaded.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeProjects.length]);

  const handleBookVisit = async (e) => {
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

    try {
      await addVisit(newVisit);

      const existingLead = leads.find((lead) => lead.phone === bookingForm.phone);
      if (!existingLead) {
        await addLead({
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
        await updateLead({
          ...existingLead,
          stage: 'Book Visit',
          project: selectedProject.name,
          projectId: selectedProject.id,
          projectOwnerId: selectedProject.ownerId || ''
        });
      }
      trackLead({ project: selectedProject, leadType: 'site_visit' });
    } catch (visitError) {
      console.error('[Zinoo] Site visit enquiry could not be saved', {
        code: visitError?.code,
        message: visitError?.message
      });
      alert('We could not submit your site visit request. Please try again.');
      return;
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

    let purchaseVal;
    try {
      purchaseVal = getProjectPurchaseValue(project);
    } catch (purchaseValueError) {
      console.error('Cashback submission blocked by invalid purchase value', {
        projectId: project.id,
        purchasePrice: project.purchasePrice,
        startingPrice: project.startingPrice,
        priceFrom: project.priceFrom,
        error: purchaseValueError
      });
      setCashbackError(purchaseValueError.message);
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
          buyerEmail: buyerProfile?.email || user?.email || '',
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
          submittedAt: new Date().toISOString().split('T')[0]
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

  const cashbackProjects = useMemo(
    () => activeProjects.filter((project) => formatCashbackLabel(project)),
    [activeProjects]
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
  const selectedDisplay = selectedProject ? getPropertyDisplayModel(selectedProject) : null;
  const selectedGallery = selectedDisplay
    ? [
        ...selectedDisplay.media.gallery.filter((image) => image.enabled !== false).map((image) => ({ ...image, downloadURL: image.url, mediaType: 'image' })),
        ...(Array.isArray(selectedProject?.videos) ? selectedProject.videos : []).map((video, index) => ({ id: video.id || `video-${index}`, downloadURL: video.downloadURL || video.url, mediaType: 'video' })).filter((video) => video.downloadURL)
      ]
    : [];
  useEffect(() => {
    setGalleryIndex(0);
    setGalleryViewerIndex(null);
  }, [selectedProject?.id]);
  const selectedDocuments = selectedDisplay
    ? selectedDisplay.documents.items.filter((document) => document.enabled !== false && document.verified && document.showOnDetails !== false).map((document) => ({
        ...document,
        displayName: document.title,
        downloadURL: document.url,
        url: document.url,
        type: document.documentType,
        status: 'verified'
      }))
    : [];
  const documentsLoading = Boolean(selectedProject && loadingLayouts && selectedDocuments.length === 0);
  useEffect(() => {
    if (!import.meta.env.DEV || !selectedProject) return;
    const mappedDocuments = normalizeProjectDocuments(selectedProject);
    console.info('[Zinoo Documents] Buyer details mapping', {
      propertyId: selectedProject.id,
      firestoreDocument: `projects/${selectedProject.id}`,
      documentsFound: Array.isArray(selectedProject.documents) ? selectedProject.documents.length : 0,
      documentsMapped: mappedDocuments.length,
      documentsRendered: mappedDocuments.filter((document) => document.status === 'verified').length,
      documents: mappedDocuments.map((document) => ({
        id: document.id,
        displayName: document.displayName || getProjectDocumentLabel(document.type),
        hasDownloadURL: Boolean(document.downloadURL || document.url),
        verified: document.verified,
        status: document.status
      }))
    });
  }, [selectedProject?.id, selectedProject?.documents]);
  const selectedWhatsAppUrl = buildWhatsAppUrl(selectedProject);
  const selectedNavigateUrl = selectedDisplay?.map.directionsLink || selectedDisplay?.map.googleMapsLink || getNavigateUrl(selectedProject);
  const panelOpen = activeScreen === 'map' && panelMode === 'project' && Boolean(selectedProject);
  const panelTitle = selectedProject?.name || 'Project';
  const panelKicker = 'Selected project';
  const activeFilterCount = mapFilters.landZones.length
    + mapFilters.naStatuses.length
    + mapFilters.zones.length
    + Number(mapFilters.bankLoan)
    + Number(mapFilters.verified)
    + Number(mapFilters.installmentMax > 0)
    + Number(mapFilters.budgetMin !== DEFAULT_FILTERS.budgetMin || mapFilters.budgetMax !== DEFAULT_FILTERS.budgetMax);

  const applyMobileSheetHeight = useCallback((height, animate = false) => {
    const sheet = mobileSheetRef.current;
    if (!sheet) return;
    sheet.classList.toggle('is-sheet-dragging', !animate);
    if (mobileSheetFrameRef.current) cancelAnimationFrame(mobileSheetFrameRef.current);
    mobileSheetFrameRef.current = requestAnimationFrame(() => {
      sheet.style.setProperty('--sheet-height-px', `${Math.round(height)}px`);
    });
  }, []);

  const measureMobileSheet = useCallback(() => {
    const sheet = mobileSheetRef.current;
    if (!sheet || !isAndroidLayout || !panelOpen) return null;
    const header = document.querySelector('.buyer-workspace-header');
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    // An open property sheet owns the entire mobile bottom edge. The primary
    // navigation is unmounted by the parent layout while it is open, so no
    // navigation inset should be reserved for any snap point.
    const navTop = viewportHeight;
    const navHeight = 0;
    const headerBottom = header?.getBoundingClientRect().bottom || 0;
    const compactContentHeight = mobileSheetCompactRef.current?.scrollHeight || 84;
    const compact = Math.max(92, Math.min(compactContentHeight + 28, navTop - headerBottom - 16));
    const intendedTopGap = Math.max(16, getSafeAreaInsetTop());
    const full = Math.max(compact, navTop - intendedTopGap);
    const expanded = Math.max(compact, Math.min(full, Math.round(viewportHeight * 0.5)));
    const metrics = { collapsed: compact, expanded, full, min: compact, max: full, navHeight };
    mobileSheetMetricsRef.current = metrics;
    sheet.style.setProperty('--sheet-full-height-px', `${Math.round(full)}px`);
    sheet.style.setProperty('--sheet-bottom-px', `${Math.round(navHeight)}px`);
    return metrics;
  }, [isAndroidLayout, panelOpen]);

  useEffect(() => {
    if (!pendingMapFocusProjectId || !selectedProject || activeScreen !== 'map' || !interactiveMapReady) return undefined;
    let cancelled = false;
    let completionTimer;
    const requestFocus = () => {
      if (cancelled) return;
      window.dispatchEvent(new CustomEvent('flinok-focus-project', {
        detail: { project: selectedProject, layout: activeLayout, animated: true, requestId: pendingMapFocusProjectId }
      }));
      completionTimer = window.setTimeout(() => setPendingMapFocusProjectId(''), 1800);
    };
    const frame = requestAnimationFrame(() => requestAnimationFrame(requestFocus));
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      clearTimeout(completionTimer);
    };
  }, [activeLayout, activeScreen, interactiveMapReady, pendingMapFocusProjectId, selectedProject]);

  useEffect(() => {
    const finishFocus = (event) => {
      if (!pendingMapFocusProjectId || event.detail?.requestId !== pendingMapFocusProjectId) return;
      setPendingMapFocusProjectId('');
    };
    window.addEventListener('flinok-project-focus-complete', finishFocus);
    return () => window.removeEventListener('flinok-project-focus-complete', finishFocus);
  }, [pendingMapFocusProjectId]);

  useEffect(() => {
    if (!isAndroidLayout || !panelOpen) return undefined;
    const update = () => {
      const metrics = measureMobileSheet();
      if (metrics) applyMobileSheetHeight(metrics[mobileSheetSnap], true);
    };
    update();
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      if (mobileSheetFrameRef.current) cancelAnimationFrame(mobileSheetFrameRef.current);
    };
  }, [applyMobileSheetHeight, isAndroidLayout, measureMobileSheet, mobileSheetSnap, panelOpen]);

  const finishMobileSheetDrag = useCallback((event) => {
    const drag = mobileSheetDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const metrics = mobileSheetMetricsRef.current || measureMobileSheet();
    mobileSheetDragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (!metrics) return;
    const velocity = drag.velocity || 0;
    const currentHeight = Math.max(metrics.min, Math.min(metrics.max, drag.startHeight + drag.startY - event.clientY));
    const ordered = ['collapsed', 'expanded', 'full'];
    const projectedHeight = Math.max(metrics.min, Math.min(metrics.max,
      currentHeight - (Math.abs(velocity) > 0.45 ? velocity * 180 : 0)));
    const nextSnap = ordered.reduce((closest, snap) => (
      Math.abs(metrics[snap] - projectedHeight) < Math.abs(metrics[closest] - projectedHeight) ? snap : closest
    ));
    mobileSheetRef.current?.classList.remove('is-sheet-dragging');
    setMobileSheetSnap(nextSnap);
    applyMobileSheetHeight(metrics[nextSnap], true);
  }, [applyMobileSheetHeight, measureMobileSheet]);

  useEffect(() => {
    const sheet = mobileSheetRef.current;
    if (!sheet || !isAndroidLayout || !panelOpen || panelMode !== 'project') return undefined;
    let gesture = null;
    const start = (event) => {
      gesture = null;
      if (event.touches.length !== 1 || event.target.closest(
        'button, a, input, textarea, select, video, [contenteditable="true"], [role="combobox"], [role="listbox"], [role="option"], [role="menu"], [data-dropdown-trigger], [data-dropdown-content], .property-sheet-drag-handle'
      )) return;
      const touch = event.touches[0];
      const shell = sheet.querySelector('.buyer-slide-panel-shell');
      gesture = {
        x: touch.clientX,
        y: touch.clientY,
        lastY: touch.clientY,
        startHeight: shell?.getBoundingClientRect().height || 0,
        currentHeight: shell?.getBoundingClientRect().height || 0,
        draggingSheet: false
      };
    };
    const move = (event) => {
      if (!gesture || event.touches.length !== 1) return;
      const touch = event.touches[0];
      const dx = touch.clientX - gesture.x;
      const dy = touch.clientY - gesture.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        gesture = null;
        return;
      }
      const content = sheet.querySelector('.project-panel-content');
      if (mobileSheetSnap !== 'collapsed' && content?.scrollTop > 2) {
        gesture.y = touch.clientY;
        gesture.lastY = touch.clientY;
        gesture.startHeight = sheet.querySelector('.buyer-slide-panel-shell')?.getBoundingClientRect().height || gesture.startHeight;
        gesture.currentHeight = gesture.startHeight;
        return;
      }
      const metrics = mobileSheetMetricsRef.current || measureMobileSheet();
      if (!metrics) return;
      if (!gesture.draggingSheet) {
        if (Math.abs(dy) < 10) return;
        // At the full snap point, upward movement belongs to the details scroll.
        if (dy < 0 && mobileSheetSnap === 'full') return;
        gesture.draggingSheet = true;
      }
      if (event.cancelable) event.preventDefault();
      gesture.lastY = touch.clientY;
      const height = Math.max(metrics.min, Math.min(metrics.max, gesture.startHeight - dy));
      gesture.currentHeight = height;
      applyMobileSheetHeight(height);
    };
    const end = () => {
      if (!gesture) return;
      const dy = (gesture.lastY ?? gesture.y) - gesture.y;
      // A small tap or incidental scroll should leave the sheet where it is.
      if (Math.abs(dy) < 60) {
        if (gesture.draggingSheet) {
          mobileSheetRef.current?.classList.remove('is-sheet-dragging');
          applyMobileSheetHeight(mobileSheetMetricsRef.current?.[mobileSheetSnap] || gesture.startHeight, true);
        }
        gesture = null;
        return;
      }
      if (gesture.draggingSheet) {
        const metrics = mobileSheetMetricsRef.current || measureMobileSheet();
        if (metrics) {
          const shell = sheet.querySelector('.buyer-slide-panel-shell');
          const currentHeight = gesture.currentHeight || shell?.getBoundingClientRect().height || gesture.startHeight - dy;
          const ordered = ['collapsed', 'expanded', 'full'];
          const nextSnap = ordered.reduce((closest, snap) => (
            Math.abs(metrics[snap] - currentHeight) < Math.abs(metrics[closest] - currentHeight) ? snap : closest
          ));
          mobileSheetRef.current?.classList.remove('is-sheet-dragging');
          if (nextSnap !== mobileSheetSnap) {
            const content = sheet.querySelector('.project-panel-content');
            if (content) content.scrollTop = 0;
            setProjectScrollTop(0);
            setMobileSheetSnap(nextSnap);
          }
          applyMobileSheetHeight(metrics[nextSnap], true);
        }
        gesture = null;
        return;
      }
      const nextSnap = dy < 0
        ? (mobileSheetSnap === 'collapsed' ? 'expanded' : 'full')
        : 'collapsed';
      if (nextSnap !== mobileSheetSnap) {
        const content = sheet.querySelector('.project-panel-content');
        if (content) content.scrollTop = 0;
        setProjectScrollTop(0);
        setMobileSheetSnap(nextSnap);
      }
      gesture = null;
    };
    sheet.addEventListener('touchstart', start, { passive: true });
    sheet.addEventListener('touchmove', move, { passive: false });
    sheet.addEventListener('touchend', end);
    sheet.addEventListener('touchcancel', end);
    return () => {
      sheet.removeEventListener('touchstart', start);
      sheet.removeEventListener('touchmove', move);
      sheet.removeEventListener('touchend', end);
      sheet.removeEventListener('touchcancel', end);
    };
  }, [applyMobileSheetHeight, isAndroidLayout, measureMobileSheet, mobileSheetSnap, panelMode, panelOpen]);

  const handleProjectPanelScroll = useCallback((event) => {
    const scrollTop = event.currentTarget.scrollTop;
    setProjectScrollTop(Math.min(scrollTop, 180));

    // On mobile, the first upward content scroll should promote the half-height
    // preview into the full details sheet instead of trapping the user inside
    // the smaller scroll area.
    if (isAndroidLayout && mobileSheetSnap === 'expanded' && scrollTop > 2) {
      setMobileSheetSnap('full');
    }
  }, [isAndroidLayout, mobileSheetSnap]);

  const toggleFilterOption = (key, value) => {
    setMapFilters((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value]
    }));
  };

  const renderCashbackPanel = () => (
    <div className="buyer-side-panel-content cashback-panel-content">
      <div className="cashback-view-tabs">
        <button type="button" className={cashbackView === 'claim' ? 'active' : ''} onClick={() => setCashbackView('claim')}>New request</button>
        <button type="button" className={cashbackView === 'history' ? 'active' : ''} onClick={() => setCashbackView('history')}>History <span>{cashbacks.length}</span></button>
      </div>
      {cashbackView === 'history' ? <CashbackWorkspace role="buyer" cashbacks={cashbacks} /> : <form onSubmit={handleCashbackSubmit} className="cashback-claim-form">
        <section className="cashback-form-section">
          <div className="cashback-section-heading"><span>1</span><div><h4>Purchase details</h4></div></div>
          <CashbackProjectSelect
            projects={cashbackProjects}
            value={cashbackForm.projectId}
            onChange={(projectId) => setCashbackForm((current) => ({ ...current, projectId }))}
          />
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
          <div className="cashback-section-heading"><span>2</span><div><h4>Purchase proof</h4><p>Capture the Booking receipt with your device camera.</p></div></div>
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
          <div className="cashback-section-heading"><span>3</span><div><h4>Review claim</h4></div></div>
          <div className="cashback-review-row"><UserRound size={18} /><span>Purchaser</span><strong>{cashbackBuyerName}</strong></div>
          <div className="cashback-review-row"><Phone size={18} /><span>Phone</span><strong>{cashbackBuyerPhone}</strong></div>
          <div className="cashback-review-row"><IndianRupee size={18} /><span>Cashback</span><strong>{cashbackProject && Number(cashbackForm.purchasedAreaSqFt) > 0 ? `₹${new Intl.NumberFormat('en-IN').format(estimatedCashback)}` : 'Enter purchased area'}</strong></div>
        </section>

        {cashbackError && <div className="cashback-error-alert" role="alert">{cashbackError}</div>}
        {cashbackSuccess ? (
          <div className="cashback-success-alert">Claim submitted successfully. Zinoo will verify your purchase proof.</div>
        ) : (
          <button type="submit" className="btn-primary claim-submit-btn" disabled={cashbackSubmitting || cashbackProjects.length === 0}>
            {cashbackSubmitting ? <><Loader2 size={18} className="spin" /> Uploading proof…</> : 'Submit cashback claim'}
          </button>
        )}
      </form>}
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
    const heroPrice = formatINR(selectedDisplay.pricing.startingPrice);
    const plotsLeftLabel = hasValue(selectedProject.remainingPlots)
      ? (Number(selectedProject.remainingPlots) > 0 ? selectedProject.remainingPlots : 'Sold out')
      : '—';
    const landZoneLabel = getLandZoneLabel(selectedProject);
    const openWhatsApp = () => {
      if (selectedWhatsAppUrl) {
        window.open(selectedWhatsAppUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      alert('WhatsApp contact is not available for this project yet.');
    };
    return (
      <BuyerProjectDetails
        onNeedFinancing={() => {
          setLoanPlotPrice(selectedDisplay.pricing.startingPrice);
          navigateToScreen('loan');
        }}
        selectedProject={selectedProject}
        selectedDisplay={selectedDisplay}
        selectedGallery={selectedGallery}
        galleryIndex={galleryIndex}
        onGalleryIndexChange={setGalleryIndex}
        projectScrollTop={projectScrollTop}
        heroPrice={heroPrice}
        onScroll={handleProjectPanelScroll}
        appBar={!isAndroidLayout ? (
          <header className="project-details-app-bar">
            <h2>{selectedDisplay.basic.projectName}{selectedDisplay.verified.showNameBadge && <BadgeCheck className="property-name-verified-badge" aria-label="Verified property" />}</h2>
            <BuyerProjectActions
              variant="header"
              saved={savedProjectIds.has(selectedProject.id)}
              onShare={shareProject}
              onSave={() => toggleSavedProject(selectedProject.id)}
              onClose={closePanel}
            />
          </header>
        ) : null}
        contactActions={(
          <BuyerProjectActions
            variant="contact"
            actions={selectedDisplay.actions}
            callHref={`tel:${String(selectedDisplay.actions.callNumber).replace(/[^\d+]/g, '')}`}
            onWhatsApp={openWhatsApp}
          />
        )}
        documentsSection={(
          <BuyerProjectMedia
            variant="documents"
            selectedDisplay={selectedDisplay}
            documents={selectedDocuments}
            documentsLoading={documentsLoading}
            onViewDocument={(document) => openDocumentPreview(document, setDocumentViewer)}
          />
        )}
        bottomActions={null}
      />
    );
  };

  return (
    <div className={`buyer-map-first-root buyer-screen-${activeScreen}`}>
      {routeSlug && routeStatus !== 'ready' && (
        <div className="project-panel-empty-state" role={routeStatus === 'error' || routeStatus === 'not-found' ? 'alert' : 'status'}>
          <FileText size={24} aria-hidden="true" />
          <h4>{routeStatus === 'loading' ? 'Loading project…' : routeStatus === 'not-found' ? 'Project not found' : 'Project unavailable'}</h4>
          <p>{routeStatus === 'loading' ? 'Loading the requested project details.' : routeStatus === 'not-found' ? 'This project link is unavailable or incorrect.' : 'We could not load this project. Please try again.'}</p>
        </div>
      )}
      {activeScreen === 'map' && (
        <div className={`buyer-map-canvas map-mode-${interactiveMapReady ? 'interactive' : 'static'}`}>
          {interactiveMap && <Suspense fallback={null}><InteractiveMap
            projects={mapProjects}
            selectedProject={selectedProject}
            onSelectProject={handleMapProjectSelect}
            onViewProjectDetails={openFullProjectDetails}
            showProjectPopup={panelMode !== 'project'}
            activeLayout={activeLayout}
            onActiveLayoutChange={setActiveLayout}
            loadVisibleProjects={false}
            filters={mapFilters}
            onOpenFilters={() => setFiltersOpen(true)}
            onToggleInstallment={() => setMapFilters({ ...mapFilters, installmentMax: mapFilters.installmentMax ? 0 : 20000 })}
            showFilterCapsules={!panelOpen}
            externalOverlayOpen={filtersOpen || panelOpen}
            onLayersOpen={() => setFiltersOpen(false)}
            onMapReady={handleInteractiveMapReady}
          /></Suspense>}
          {!interactiveMapReady && <StaticMap
            projects={mapProjects}
            onActivate={enableInteractiveMap}
            onSelectProject={handleMapProjectSelect}
          />}
        </div>
      )}

      {activeScreen === 'map' && <BuyerFilters
        hideShortcuts
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
        filteredProjectCount={filteredProjects.length}
        mapFilters={mapFilters}
        landZoneOptions={LAND_ZONE_OPTIONS}
        naStatusOptions={NA_STATUS_OPTIONS}
        onToggleFilters={() => setFiltersOpen((prev) => !prev)}
        onCloseFilters={() => setFiltersOpen(false)}
        onBudgetChange={(event) => setMapFilters({ ...mapFilters, budgetMax: Number(event.target.value) })}
        onLandZoneToggle={(value) => toggleFilterOption('landZones', value)}
        onNaStatusToggle={(value) => toggleFilterOption('naStatuses', value)}
        onInstallmentToggle={() => setMapFilters({ ...mapFilters, installmentMax: mapFilters.installmentMax ? 0 : 20000 })}
        onResetFilters={() => setMapFilters(DEFAULT_FILTERS)}
      />}

      {(['home', 'map', 'saved', 'nearby', 'support', 'developer'].includes(activeScreen)) && (!isAndroidLayout || panelMode !== 'project' || mobileSheetSnap === 'collapsed') && (
        <DesktopHeader
          homeSearchQuery={homeSearchQuery}
          voiceSearchActive={voiceSearchActive}
          searchableProjects={searchableProjects}
          placeSuggestions={placeSuggestions}
          placeSearchError={placeSearchError}
          onQueryChange={(event) => {
            setHomeSearchQuery(event.target.value);
            setActiveScreen('home');
            if (panelMode) setPanelMode(null);
          }}
          onSearchKeyDown={searchEnteredLocation}
          onActivateMap={enableInteractiveMap}
          onClearSearch={() => setHomeSearchQuery('')}
          onStartVoiceSearch={startVoiceSearch}
          onProjectSelect={(project) => {
            handleProjectSelect(project);
            setPlaceSuggestions([]);
          }}
          onPlaceSelect={selectPlaceSuggestion}
          showFilters={activeScreen === 'home'}
          filtersOpen={filtersOpen}
          activeFilterCount={activeFilterCount}
          onToggleFilters={() => setFiltersOpen((prev) => !prev)}
          mapFilters={mapFilters}
          onMapFiltersChange={setMapFilters}
          notifications={notifications}
          user={user}
          isAdmin={isAdmin}
          onThemeToggle={onThemeToggle}
          isDarkMode={isDarkMode}
          permissions={permissions}
          currentView={currentView}
          onViewChange={onViewChange}
          onCustomerSupport={() => navigateToScreen('support')}
          onRequireAuth={requireAuthentication}
          onBackToAdmin={onBackToAdmin}
          selectedSeller={selectedSeller}
          onAccountDeleted={onAccountDeleted}
        />
      )}

      {!isAndroidLayout && (
        <BuyerDesktopNavigation
          items={SIDEBAR_ITEMS}
          activeItem={activeSidebarItem}
          onNavigate={navigateToScreen}
        />
      )}

      {activeScreen === 'home' && (
        <BuyerHomeScreen>
          <BuyerHomePanel
            onOpenCashback={() => navigateToScreen('cashback')}
            filtersOpen={filtersOpen}
            activeFilterCount={activeFilterCount}
            filteredProjects={filteredProjects}
            mapFilters={mapFilters}
            landZoneOptions={LAND_ZONE_OPTIONS}
            naStatusOptions={NA_STATUS_OPTIONS}
            homeSearchQuery={homeSearchQuery}
            searchableProjects={searchableProjects}
            savedProjectIds={savedProjectIds}
            onToggleFilters={() => setFiltersOpen((prev) => !prev)}
            onCloseFilters={() => setFiltersOpen(false)}
            onBudgetChange={(event) => setMapFilters({ ...mapFilters, budgetMax: Number(event.target.value) })}
            onLandZoneToggle={(value) => toggleFilterOption('landZones', value)}
            onNaStatusToggle={(value) => toggleFilterOption('naStatuses', value)}
            onInstallmentToggle={() => setMapFilters({ ...mapFilters, installmentMax: mapFilters.installmentMax ? 0 : 20000 })}
            onResetFilters={() => setMapFilters(DEFAULT_FILTERS)}
            onProjectSelect={handleHomeProjectSelect}
            onDeveloperSelect={handleDeveloperSelect}
            onFavouriteToggle={toggleSavedProject}
            onShare={shareProject}
            projectsLoading={projectsLoading}
          />
        </BuyerHomeScreen>
      )}

      {activeScreen === 'developer' && (
        <BuyerDeveloperProfile
          profile={developerProfile}
          projects={developerProjects}
          loading={developerProfileLoading}
          error={developerProfileError}
          fallbackName={selectedDeveloper?.developerName}
          onBack={() => navigateToScreen('home')}
          onProjectSelect={handleProjectSelect}
          onDeveloperSelect={handleDeveloperSelect}
          onViewProjectsOnMap={() => { setMapDeveloperId(selectedDeveloper?.sellerId || ''); enableInteractiveMap(); setActiveScreen('map'); setPanelMode(null); }}
        />
      )}

      {activeScreen === 'saved' && (
        <BuyerSavedScreen
          projects={savedProjects}
          savedCount={savedProjectIds.size}
          unavailableCount={unavailableSavedProjectCount}
          loading={projectsLoading}
          onProjectSelect={handleProjectSelect}
          onDeveloperSelect={handleDeveloperSelect}
          authRequired={!isAuthenticated}
          onLogin={() => requireAuthentication({ type: 'open-saved', resumeScreen: 'saved' })}
        />
      )}

      {activeScreen === 'cashback' && (
        <main className="buyer-primary-screen buyer-cashback-screen" aria-label="Cashback claim">
          <button type="button" className="buyer-cashback-back" onClick={() => navigateToScreen('home')} aria-label="Back to Home"><ArrowLeft size={22} /></button>
          {renderCashbackPanel()}
          {!isAuthenticated && (
            <div className="buyer-auth-mask" role="region" aria-label="Login required to view cashback">
              <button type="button" className="buyer-auth-mask-login" onClick={() => requireAuthentication({ type: 'open-cashback', resumeScreen: 'cashback' })}>Log in</button>
            </div>
          )}
        </main>
      )}

      {activeScreen === 'support' && <BuyerSupportScreen />}
      {activeScreen === 'loan' && <BuyerLoanScreen initialPlotPrice={loanPlotPrice} onBack={() => navigateToScreen(loanReturnScreen.current)} />}

      <section
        ref={mobileSheetRef}
        className={`buyer-slide-panel ${panelOpen ? 'open' : ''} ${pendingMapFocusProjectId ? 'map-focus-pending' : ''} ${isAndroidLayout && panelMode === 'project' ? `map-property-bottom-sheet sheet-${mobileSheetSnap}` : 'map-property-side-panel'}`}
        data-sheet-state={isAndroidLayout && panelMode === 'project' ? mobileSheetSnap : undefined}
        style={isAndroidLayout && panelOpen ? { '--sheet-bottom-px': '0px' } : undefined}
      >
        <div className="buyer-slide-panel-shell">
          {isAndroidLayout && panelMode === 'project' && <button
            type="button"
            className="property-sheet-drag-handle"
            aria-label={`Resize property details. Current state ${mobileSheetSnap}`}
            onPointerDown={(event) => {
              const metrics = measureMobileSheet();
              if (!metrics) return;
              mobileSheetDragRef.current = {
                pointerId: event.pointerId,
                startY: event.clientY,
                lastY: event.clientY,
                lastTime: performance.now(),
                startHeight: mobileSheetRef.current.querySelector('.buyer-slide-panel-shell').getBoundingClientRect().height
              };
              if (mobileSheetFrameRef.current) cancelAnimationFrame(mobileSheetFrameRef.current);
              mobileSheetRef.current.style.setProperty('--sheet-height-px', `${mobileSheetDragRef.current.startHeight}px`);
              mobileSheetRef.current?.classList.add('is-sheet-dragging');
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const drag = mobileSheetDragRef.current;
              const metrics = mobileSheetMetricsRef.current;
              if (!drag || drag.pointerId !== event.pointerId || !metrics) return;
              const now = performance.now();
              drag.velocity = (event.clientY - drag.lastY) / Math.max(now - drag.lastTime, 1);
              const next = Math.max(metrics.min, Math.min(metrics.max, drag.startHeight + drag.startY - event.clientY));
              drag.lastY = event.clientY;
              drag.lastTime = now;
              applyMobileSheetHeight(next);
            }}
            onPointerUp={finishMobileSheetDrag}
            onPointerCancel={finishMobileSheetDrag}
          ><span /></button>}
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

          {isAndroidLayout && panelMode === 'project' && selectedProject && <div className="property-sheet-unified-actions">
            <button type="button" onClick={shareProject} aria-label="Share project"><Share2 size={19} /></button>
            <button type="button" onClick={() => toggleSavedProject(selectedProject.id)} aria-label={savedProjectIds.has(selectedProject.id) ? 'Remove from saved projects' : 'Save project'}><Heart size={19} fill={savedProjectIds.has(selectedProject.id) ? 'currentColor' : 'none'} /></button>
            <button type="button" onClick={closePanel} aria-label="Close project preview"><X size={21} /></button>
          </div>}
          {panelMode === 'project' && selectedProject && <div ref={mobileSheetCompactRef} className="property-sheet-compact-preview" aria-hidden={mobileSheetSnap !== 'collapsed'}>
            <img src={selectedDisplay?.media.heroImage || selectedGallery[0]?.downloadURL || '/zinoo-home-hero.webp'} alt="" />
            <div className="property-sheet-compact-copy">
              <strong>{selectedDisplay?.basic.projectName || selectedProject.name}{selectedDisplay?.verified.showNameBadge && <BadgeCheck className="property-name-verified-badge" aria-label="Verified property" />}</strong>
              <div className="property-sheet-compact-pricing">
                <span>{selectedDisplay ? formatINR(selectedDisplay.pricing.startingPrice) : 'Price on request'}</span>
                {selectedDisplay?.cashback.enabled && <i aria-hidden="true">•</i>}
                {selectedDisplay?.cashback.enabled && <small>{formatExactINR(selectedDisplay.cashback.amount)} Cashback</small>}
              </div>
            </div>
            <button type="button" className="property-sheet-view-button" onClick={() => setMobileSheetSnap('expanded')}>View</button>
          </div>}
          {panelMode === 'project' && renderProjectPanel()}
        </div>
      </section>

      {isAndroidLayout && !panelOpen && activeScreen !== 'cashback' && (
        <BuyerMobileNavigation
          activeScreen={activeScreen}
          onNavigate={navigateToScreen}
        />
      )}

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

      <BuyerProjectMedia
        variant="viewers"
        documentViewer={documentViewer}
        galleryViewerIndex={galleryViewerIndex}
        selectedProject={selectedProject}
        selectedDisplay={selectedDisplay}
        selectedGallery={selectedGallery}
        saved={selectedProject ? savedProjectIds.has(selectedProject.id) : false}
        onSave={() => selectedProject && toggleSavedProject(selectedProject.id)}
        onShare={shareProject}
        onCloseDocumentViewer={() => setDocumentViewer(null)}
        onCloseGalleryViewer={() => setGalleryViewerIndex(null)}
      />

    </div>
  );
}

export default BuyerApp;



