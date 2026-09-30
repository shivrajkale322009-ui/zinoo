import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building,
  ClipboardList,
  Home,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  ShieldCheck,
  ShieldX,
  Store,
  Sun,
  User,
  Users,
  FileText,
  Images,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  MapPin,
  Map,
  Plus,
  Trash,
  ArrowLeft,
  ArrowRight,
  Save,
  AlertCircle,
  Menu,
  X,
  Trash2,
  MoreVertical,
  CircleDollarSign,
  Layers3,
  Clock3,
  LoaderCircle,
  Image as ImageIcon,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Bell,
  UserCheck,
  Activity,
  Megaphone,
  BarChart3,
  TrendingUp,
  Bot,
  Copy,
  MessageCircle,
  Phone
} from 'lucide-react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  limit,
  updateDoc
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import EditProfileModal from './EditProfileModal';
import ProfileDropdown from './ProfileDropdown';
import UserAvatar from './UserAvatar';
import { auth, db, functions } from '../firebaseConfig';
import { logoutUser } from '../services/authSessionService';
import { isApprovedSellerAccount, normalizePermissions } from '../utils/permissions';
import { getProjectStatus, isProjectPublishable, PROPERTY_STATUS, PROPERTY_STATUSES } from '../utils/projectVisibility';
import { getLandZoneLabel, getNaStatusLabel, LAND_ZONE_OPTIONS, NA_STATUS_OPTIONS } from '../utils/projectLand';
import { getProjectDocumentLabel, normalizeProjectDocuments } from '../utils/projectDocuments';
import { validateProperty, validatePropertyLocation } from '../utils/adminPropertyUtils';
import ProjectLocationPicker from './ProjectLocationPicker';
import { applyHighwayResult } from '../utils/highwayInfo';
import PropertyMediaDocumentsManager, { InAppDocumentViewer, openDocumentPreview } from './PropertyMediaDocumentsManager';
import PropertyDisplayEditor from './PropertyDisplayEditor';
import AdminPropertyDetails from './AdminPropertyDetails';
import PropertyHighlightBadge from './PropertyHighlightBadge';
import AmenityCatalogManager from './AmenityCatalogManager';
import useMediaQuery from '../utils/useMediaQuery';
import CashbackWorkspace from './CashbackWorkspace';
import FeedBannerManager from './FeedBannerManager';
import FeaturedDeveloperManager from './FeaturedDeveloperManager';
import SearchBar from './ui/SearchBar';
import { withPropertyDisplayModel, withPropertyStartingPrice } from '../utils/propertyDisplayModel';
import DeletePropertyModal from './DeletePropertyModal';
import PropertyRejectionModal from './PropertyRejectionModal';
import AdminSellerReview from './AdminSellerReview';
import { deleteProperty } from '../services/propertyService';
import { AccountDeletionService } from '../services/accountDeletionService';
import AdminAIAssistant from './AdminAIAssistant';
import WhatsAppLeadManager from './WhatsAppLeadManager';
import WhatsAppInbox from './WhatsAppInbox';
import LeadManagementWorkspace from './CRM/LeadManagementWorkspace';
import { isToday } from '../utils/crmLeadModel';
import { getPropertyGovernance } from '../utils/propertyGovernance';
import { getSellerApplicationGovernance, isActionableSellerApplication } from '../utils/sellerGovernance.js';

const getName = (account) => account?.displayName || account?.name || account?.businessName || account?.userName || account?.email || 'Unknown';
const getBuyerName = (account) => account?.displayName || account?.name || account?.userName || 'Unknown buyer';
const getInitials = (account) => getBuyerName(account).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase() || 'B';
const getDateValue = (value) => {
  if (!value) return 0;
  const date = value?.toDate?.() || (Number.isFinite(value?.seconds) ? new Date(value.seconds * 1000) : new Date(value));
  const time = date?.getTime?.();
  return Number.isFinite(time) ? time : 0;
};
const formatAdminDate = (value) => {
  const time = getDateValue(value);
  return time ? new Date(time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'date unavailable';
};
const formatAdminDateTime = (value) => {
  const time = getDateValue(value);
  return time
    ? new Date(time).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
    : 'date unavailable';
};

const getProjectOwnerName = (project, sellers) => {
  const owner = sellers.find((item) => item.id === project.ownerId);
  return owner ? getName(owner) : (project.developer || 'Unknown seller');
};

function AnimatedMetric({ value }) {
  const target = Number(value) || 0;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(target);
      return undefined;
    }

    let frame;
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startedAt) / 650, 1);
      setDisplayValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [target]);

  return displayValue;
}

function AdminPanel({
  projects,
  leads = [],
  cashbacks = [],
  updateProject,
  user,
  isDarkMode,
  onThemeToggle,
  onSwitchToAdmin,
  onSwitchToBuyer,
  onSwitchToSeller,
  onSelectSeller,
  onListenerDebug,
  permissions,
  currentView = 'admin',
  onViewChange,
  onCustomerSupport,
  onBackToAdmin,
  selectedSeller,
  canDeleteProperties = false,
  initialTab = 'home'
}) {
  const isAndroidLayout = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/leads')) {
      return 'crm_leads';
    }
    return initialTab;
  });
  const crmFollowUpsTodayCount = useMemo(() => {
    return (leads || []).filter((lead) => lead.nextFollowUpAt && isToday(lead.nextFollowUpAt)).length;
  }, [leads]);
  const [selectedWhatsAppCampaignId, setSelectedWhatsAppCampaignId] = useState('');
  const [whatsAppView, setWhatsAppView] = useState('overview');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sellerRequests, setSellerRequests] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [editorSellers, setEditorSellers] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [workingKey, setWorkingKey] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Properties Section States
  const [propertiesSearchQuery, setPropertiesSearchQuery] = useState('');
  const [propertiesFilterTab, setPropertiesFilterTab] = useState('all');
  const [propertiesCityFilter, setPropertiesCityFilter] = useState('');
  const [propertiesLocalityFilter, setPropertiesLocalityFilter] = useState('');
  const [propertiesDeveloperFilter, setPropertiesDeveloperFilter] = useState('');
  const [propertiesErrorTypeFilter, setPropertiesErrorTypeFilter] = useState('');
  const [propertiesLocationStatusFilter, setPropertiesLocationStatusFilter] = useState('');
  const [viewingProperty, setViewingProperty] = useState(null);
  const [propertyDetailsOrigin, setPropertyDetailsOrigin] = useState('properties');
  const [selectedBuyerProfile, setSelectedBuyerProfile] = useState(null);
  const [selectedSellerProfile, setSelectedSellerProfile] = useState(null);
  const [selectedSellerRequest, setSelectedSellerRequest] = useState(null);
  const [sellerPendingRejection, setSellerPendingRejection] = useState(null);
  const [sellerRejectionError, setSellerRejectionError] = useState('');
  const [sellerSearchQuery, setSellerSearchQuery] = useState('');
  const [buyerSearchQuery, setBuyerSearchQuery] = useState('');
  const [buyerSortOrder, setBuyerSortOrder] = useState('recent');
  const [editingProperty, setEditingProperty] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  useEffect(() => {
    if (!isDirty) return undefined;
    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [isDirty]);
  const [collapsedSections, setCollapsedSections] = useState({ legal: false, amenities: false, media: false, siteVisit: false, audit: false });
  const [propertyPendingRejection, setPropertyPendingRejection] = useState(null);
  const [propertyRejectionError, setPropertyRejectionError] = useState('');
  const [amenityOptions, setAmenityOptions] = useState([]);
  const [propertySectionQuery, setPropertySectionQuery] = useState('');
  const [aiProjectContext, setAiProjectContext] = useState(null);

  // Pending media files (held in memory until Save Changes succeeds)
  const [pendingCoverFile, setPendingCoverFile] = useState(null);
  const [pendingCoverPreviewUrl, setPendingCoverPreviewUrl] = useState(null);
  const [pendingLayoutFile, setPendingLayoutFile] = useState(null);
  const [pendingLayoutPreviewUrl, setPendingLayoutPreviewUrl] = useState(null);
  const [pendingZoneCertFile, setPendingZoneCertFile] = useState(null);
  const [pendingZoneCertPreviewUrl, setPendingZoneCertPreviewUrl] = useState(null);
  const [pendingBrochureFile, setPendingBrochureFile] = useState(null);
  const [pendingBrochurePreviewUrl, setPendingBrochurePreviewUrl] = useState(null);
  const [previewModal, setPreviewModal] = useState(null); // { type, url, name }
  const [propertyPendingDeletion, setPropertyPendingDeletion] = useState(null);
  const [deletePropertyError, setDeletePropertyError] = useState('');
  const [deletingProperty, setDeletingProperty] = useState(false);
  const [propertyActionsMenu, setPropertyActionsMenu] = useState(null);
  const propertyActionsMenuRef = useRef(null);

  // File input refs (for programmatic click)
  const coverFileInputRef = useRef(null);
  const layoutFileInputRef = useRef(null);
  const zoneCertFileInputRef = useRef(null);
  const brochureFileInputRef = useRef(null);

  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setActiveTab(initialTab === 'seller_selection' ? 'sellers' : initialTab);
  }, [initialTab]);

  useEffect(() => {
    // The shared editor needs live catalog changes so Admin and Seller always
    // edit the same project-specific amenities from the same option source.
    const unsubscribe = onSnapshot(collection(db, 'amenityCatalog'), (snapshot) => {
      setAmenityOptions(snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((item) => item.isActive !== false)
        .sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''))));
    }, (error) => {
      console.error('Admin amenity catalog listener failed:', error);
      setErrorMessage('Unable to load the amenity catalog.');
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const path = 'sellerRequests';
    const filters = 'unfiltered';
    console.info('[Zinoo Firestore] Admin listener starting', { path, filters, uid: auth.currentUser?.uid });
    onListenerDebug?.(path, { status: 'connecting', path, filters });
    const unsubscribe = onSnapshot(
      collection(db, 'sellerRequests'),
      (snapshot) => {
        const lastSnapshotTime = new Date().toISOString();
        console.info('[Zinoo Firestore] Admin snapshot received', { path, filters, documentCount: snapshot.size, lastSnapshotTime });
        const requests = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        setSellerRequests(requests);
        onListenerDebug?.(path, { status: 'connected', path, filters, documentCount: snapshot.size, lastSnapshotTime });
      },
      (error) => {
        const detail = { code: error?.code || 'unknown', message: error?.message || String(error) };
        console.error('[Zinoo Firestore] Admin listener failed', { path, filters, uid: auth.currentUser?.uid, ...detail, error });
        onListenerDebug?.(path, { status: 'error', path, filters, error: detail });
        setErrorMessage(`Firestore ${path} sync failed [${detail.code}]: ${detail.message}`);
      }
    );
    return () => unsubscribe();
  }, [onListenerDebug]);

  useEffect(() => {
    const path = 'users';
    const filters = 'unfiltered (Admin Buyer Accounts)';
    console.info('[Zinoo Firestore] Admin listener starting', { path, filters, uid: auth.currentUser?.uid });
    onListenerDebug?.(path, { status: 'connecting', path, filters });
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const lastSnapshotTime = new Date().toISOString();
        console.info('[Zinoo Firestore] Admin snapshot received', { path, filters, documentCount: snapshot.size, lastSnapshotTime });
        const accounts = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

        const sellerList = accounts.filter((account) => {
          const permissions = normalizePermissions(account.permissions);
          return permissions.seller && !permissions.admin && isApprovedSellerAccount(account);
        });

        const buyerList = accounts.filter((account) => {
          const permissions = normalizePermissions(account.permissions);
          return permissions.buyer && !permissions.seller && !permissions.admin;
        });

        setSellers(sellerList);
        setEditorSellers(accounts.filter((account) => {
          const permissions = normalizePermissions(account.permissions);
          return permissions.seller && !permissions.admin;
        }).map((account) => ({ ...account, assignmentUnavailable: !sellerList.some((seller) => seller.id === account.id) || account.deleted || account.disabled })));
        setBuyers(buyerList);
        onListenerDebug?.(path, { status: 'connected', path, filters, documentCount: snapshot.size, lastSnapshotTime });
      },
      (error) => {
        const detail = { code: error?.code || 'unknown', message: error?.message || String(error) };
        console.error('[Zinoo Firestore] Admin listener failed', { path, filters, uid: auth.currentUser?.uid, ...detail, error });
        onListenerDebug?.(path, { status: 'error', path, filters, error: detail });
        setErrorMessage(`Firestore ${path} sync failed [${detail.code}]: ${detail.message}`);
      }
    );
    return () => unsubscribe();
  }, [onListenerDebug]);

  useEffect(() => {
    if (!statusMessage) return undefined;
    const timeout = setTimeout(() => {
      setStatusMessage('');
    }, 3000);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  const propertiesMetrics = useMemo(() => {
    let total = 0;
    let active = 0;
    let draft = 0;
    let withErrors = 0;
    let missingLocation = 0;
    let recentlyAdded = 0;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const validSellerIds = new Set(sellers.map((seller) => seller.id));
    const validatedProjects = projects.map(p => {
      const val = validateProperty(p);
      const sellerId = p.sellerId || p.sellerUid || p.ownerId;
      const sellerAssociationValid = Boolean(sellerId && validSellerIds.has(sellerId));
      return { ...p, ...val, sellerId, sellerAssociationValid };
    });

    validatedProjects.forEach(p => {
      total++;
      if (p.status === PROPERTY_STATUS.ACTIVE) active++;
      if (p.status === PROPERTY_STATUS.DRAFT) draft++;
      if (p.hasErrors) withErrors++;
      if (p.locationStatus !== 'verified') missingLocation++;
      const createdTime = getDateValue(p.createdAt);
      if (createdTime > sevenDaysAgo) recentlyAdded++;
    });

    const sellerMissing = validatedProjects.filter((p) => !p.sellerAssociationValid).length;
    return { total, active, draft, withErrors, missingLocation, recentlyAdded, sellerMissing, validatedProjects };
  }, [projects, sellers]);

  const uniqueCities = useMemo(() => {
    const list = new Set();
    projects.forEach(p => { if (p.city) list.add(p.city); });
    return Array.from(list).sort();
  }, [projects]);

  const uniqueLocalities = useMemo(() => {
    const list = new Set();
    projects.forEach(p => { if (p.locality) list.add(p.locality); });
    return Array.from(list).sort();
  }, [projects]);

  const uniqueDevelopers = useMemo(() => {
    const list = new Set();
    projects.forEach(p => {
      const dev = p.developerName || p.developer;
      if (dev) list.add(dev);
    });
    return Array.from(list).sort();
  }, [projects]);

  const filteredProperties = useMemo(() => {
    let result = propertiesMetrics.validatedProjects.filter(p => {
      // 1. Search Query
      if (propertiesSearchQuery) {
        const queryLower = propertiesSearchQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(queryLower);
        const matchesId = p.projectId?.toLowerCase().includes(queryLower) || p.id?.toLowerCase().includes(queryLower);
        const matchesDev = p.developerName?.toLowerCase().includes(queryLower) || p.developer?.toLowerCase().includes(queryLower);
        const matchesCity = p.city?.toLowerCase().includes(queryLower);
        const matchesLocality = p.locality?.toLowerCase().includes(queryLower);
        const matchesLandmark = p.landmark?.toLowerCase().includes(queryLower);
        const matchesErrors = p.errors?.some(err => err.title?.toLowerCase().includes(queryLower) || err.description?.toLowerCase().includes(queryLower));

        if (!matchesName && !matchesId && !matchesDev && !matchesCity && !matchesLocality && !matchesLandmark && !matchesErrors) {
          return false;
        }
      }

      // 2. Tab Filter
      if (propertiesFilterTab === 'active') {
        if (p.status !== PROPERTY_STATUS.ACTIVE) return false;
      } else if (propertiesFilterTab === PROPERTY_STATUS.PENDING) {
        if (p.status !== PROPERTY_STATUS.PENDING) return false;
      } else if (propertiesFilterTab === 'draft') {
        if (p.status !== PROPERTY_STATUS.DRAFT) return false;
      } else if (propertiesFilterTab === 'inactive') {
        if (p.status !== PROPERTY_STATUS.INACTIVE) return false;
      } else if (propertiesFilterTab === 'errors') {
        if (!p.hasErrors) return false;
      } else if (propertiesFilterTab === 'missing_location') {
        if (p.locationStatus === 'verified') return false;
      } else if (propertiesFilterTab === 'recent') {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const createdTime = getDateValue(p.createdAt);
        if (createdTime <= sevenDaysAgo) return false;
      }

      // 3. Dropdowns
      if (propertiesCityFilter && p.city !== propertiesCityFilter) return false;
      if (propertiesLocalityFilter && p.locality !== propertiesLocalityFilter) return false;
      if (propertiesDeveloperFilter && (p.developerName || p.developer) !== propertiesDeveloperFilter) return false;
      if (propertiesErrorTypeFilter && !p.errors?.some(e => e.type === propertiesErrorTypeFilter)) return false;
      if (propertiesLocationStatusFilter && p.locationStatus !== propertiesLocationStatusFilter) return false;

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (sortField === 'name') {
        valA = a.name || '';
        valB = b.name || '';
      }
      if (sortField === 'updatedAt' || sortField === 'createdAt') {
        valA = getDateValue(a[sortField]);
        valB = getDateValue(b[sortField]);
      }
      if (typeof valA === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    return result;
  }, [propertiesMetrics, propertiesSearchQuery, propertiesFilterTab, propertiesCityFilter, propertiesLocalityFilter, propertiesDeveloperFilter, propertiesErrorTypeFilter, propertiesLocationStatusFilter, sortField, sortDirection]);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProperties, currentPage]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage) || 1;

  const handleSaveProperty = async (updatedData) => {
    const original = projects.find(p => p.id === updatedData.id) || {};
    const nameWasEdited = updatedData.name !== original.name;
    const displayReadyData = withPropertyDisplayModel(updatedData, nameWasEdited ? {
      authoritativeName: updatedData.name,
      previousName: original.name || original.display?.basic?.projectName
    } : undefined);
    const valResult = validateProperty(displayReadyData);

    const updatedRecord = {
      ...displayReadyData,
      hasErrors: valResult.hasErrors,
      errors: valResult.errors,
      locationStatus: valResult.locationStatus,
      dataQualityStatus: valResult.dataQualityStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid
    };

    const changes = [];
    if (original.name !== displayReadyData.name) changes.push(`Name changed: "${original.name || ''}" -> "${displayReadyData.name || ''}"`);
    if (Number(original.startingPrice ?? original.priceFrom) !== Number(updatedData.startingPrice ?? updatedData.priceFrom)) {
      changes.push(`Price changed: ${original.startingPrice ?? original.priceFrom} -> ${updatedData.startingPrice ?? updatedData.priceFrom}`);
    }
    if (original.status !== updatedData.status) changes.push(`Status changed: ${original.status} -> ${updatedData.status}`);
    if (Number(original.latitude) !== Number(updatedData.latitude) || Number(original.longitude) !== Number(updatedData.longitude)) {
      changes.push(`Coordinates changed: (${original.latitude || 0}, ${original.longitude || 0}) -> (${updatedData.latitude || 0}, ${updatedData.longitude || 0})`);
    }
    if (original.mapMarkerConfirmed !== updatedData.mapMarkerConfirmed) {
      changes.push(`Marker confirmation changed: ${original.mapMarkerConfirmed} -> ${updatedData.mapMarkerConfirmed}`);
    }

    const currentAuditLog = Array.isArray(original.auditLog) ? original.auditLog : [];
    const newAuditEntries = changes.map(changeText => ({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      change: changeText,
      adminId: user.uid,
      adminName: user.displayName || user.email,
      timestamp: new Date().toISOString()
    }));

    updatedRecord.auditLog = [...newAuditEntries, ...currentAuditLog];

    try {
      const originalSellerId = original.sellerId || original.sellerUid || original.ownerId || '';
      const nextSellerId = updatedData.sellerId || updatedData.sellerUid || updatedData.ownerId || '';
      console.info('[Zinoo Admin Save] Started', {
        projectId: updatedData.id,
        sellerChanged: originalSellerId !== nextSellerId,
        coordinates: {
          latitude: updatedData.latitude,
          longitude: updatedData.longitude
        }
      });
      if (originalSellerId !== nextSellerId) {
        const assignmentResult = await httpsCallable(functions, 'assignProjectSeller')({ projectId: updatedData.id, sellerId: nextSellerId });
        console.info('[Zinoo Admin Save] Seller assignment completed', assignmentResult.data);
      }
      await updateProject(updatedRecord);
      console.info('[Zinoo Admin Save] Project update completed', { projectId: updatedData.id });
      setStatusMessage("Property details updated and revalidated successfully.");
      setIsDirty(false);
      setEditingProperty(null);
    } catch (err) {
      console.error('[Zinoo Admin Save] Failed', {
        projectId: updatedData.id,
        code: err?.code,
        message: err?.message
      });
      setErrorMessage("Failed to save property changes: " + err.message);
      return false;
    }
  };

  const handleDeleteProperty = async (confirmation) => {
    if (!propertyPendingDeletion || deletingProperty) return;
    setDeletingProperty(true);
    setDeletePropertyError('');
    setErrorMessage('');
    try {
      await deleteProperty(propertyPendingDeletion.id, confirmation);
      setPropertyPendingDeletion(null);
      setStatusMessage('Property deleted successfully.');
    } catch (error) {
      setDeletePropertyError(error.message);
    } finally {
      setDeletingProperty(false);
    }
  };

  const handleDeleteBuyer = async (buyerId) => {
    if (!window.confirm("Are you sure you want to permanently delete this buyer account and all associated data?")) return;
    try {
      setWorkingKey(`delete-buyer-${buyerId}`);
      await AccountDeletionService.deleteFirestoreData(buyerId);
      await AccountDeletionService.deleteStorageData(buyerId);
      setStatusMessage("Buyer deleted successfully.");
      setSelectedBuyerProfile(null);
    } catch (error) {
      console.error("Failed to delete buyer:", error);
      setErrorMessage("Failed to delete buyer account.");
    } finally {
      setWorkingKey('');
    }
  };

  useEffect(() => {
    if (!propertyActionsMenu) return undefined;
    const closeMenu = (event) => {
      if (!event.target.closest('.admin-overflow-menu') && !event.target.closest('.admin-overflow-trigger')) {
        setPropertyActionsMenu(null);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setPropertyActionsMenu(null);
    };
    const closeOnViewportChange = () => setPropertyActionsMenu(null);
    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnViewportChange);
    window.addEventListener('scroll', closeOnViewportChange, true);
    return () => {
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnViewportChange);
      window.removeEventListener('scroll', closeOnViewportChange, true);
    };
  }, [propertyActionsMenu]);

  useEffect(() => {
    if (!propertyActionsMenu || !propertyActionsMenuRef.current) return;
    const menu = propertyActionsMenuRef.current;
    const rect = menu.getBoundingClientRect();
    const nextTop = Math.max(8, Math.min(propertyActionsMenu.top, window.innerHeight - rect.height - 8));
    const nextRight = Math.max(8, Math.min(propertyActionsMenu.right, window.innerWidth - rect.width - 8));
    if (nextTop !== propertyActionsMenu.top || nextRight !== propertyActionsMenu.right) {
      setPropertyActionsMenu((current) => current?.id === propertyActionsMenu.id
        ? { ...current, top: nextTop, right: nextRight }
        : current);
    }
  }, [propertyActionsMenu]);

  const activeProjectList = useMemo(
    () => projects.filter((project) => {
      const status = String(project.status || project.approvalStatus || project.reviewStatus || '').toLowerCase();
      return ['approved', 'active', 'published'].includes(status) || project.isApproved === true;
    }),
    [projects]
  );
  const pendingProjects = useMemo(
    () => projects.filter((project) => ['pending', 'pending_review'].includes(String(project.status || project.approvalStatus || project.reviewStatus || '').toLowerCase())),
    [projects]
  );
  const pendingSellerRequests = useMemo(
    () => sellerRequests.filter(isActionableSellerApplication).length,
    [sellerRequests]
  );
  const visibleBuyers = useMemo(() => {
    const queryText = buyerSearchQuery.trim().toLowerCase();
    const matchingBuyers = queryText
      ? buyers.filter((buyer) => [buyer.id, buyer.displayName, buyer.name, buyer.userName, buyer.email, buyer.phoneNumber, buyer.phone]
        .some((value) => String(value || '').toLowerCase().includes(queryText)))
      : buyers;

    return [...matchingBuyers].sort((left, right) => {
      const timeDifference = getDateValue(right.lastSignedInAt) - getDateValue(left.lastSignedInAt);
      if (buyerSortOrder === 'oldest') return -timeDifference || getBuyerName(left).localeCompare(getBuyerName(right));
      if (buyerSortOrder === 'name') return getBuyerName(left).localeCompare(getBuyerName(right));
      return timeDifference || getBuyerName(left).localeCompare(getBuyerName(right));
    });
  }, [buyerSearchQuery, buyerSortOrder, buyers]);
  const sortedSellers = useMemo(
    () => [...sellers].sort((left, right) => getName(left).localeCompare(getName(right))),
    [sellers]
  );
  const visibleSellers = useMemo(() => {
    const queryText = sellerSearchQuery.trim().toLowerCase();
    if (!queryText) return sortedSellers;
    return sortedSellers.filter((seller) => [seller.id, seller.businessName, seller.displayName, seller.name, seller.email, seller.phoneNumber, seller.phone].some((value) => String(value || '').toLowerCase().includes(queryText)));
  }, [sellerSearchQuery, sortedSellers]);
  const sellerProjectCounts = useMemo(() => projects.reduce((counts, project) => {
    const sellerId = project.ownerId || project.sellerUid || project.sellerId;
    if (sellerId) counts.set(sellerId, (counts.get(sellerId) || 0) + 1);
    return counts;
  }, new globalThis.Map()), [projects]);
  const pendingRequests = useMemo(
    () => sellerRequests
      .filter(isActionableSellerApplication)
      .sort((left, right) => getName(left).localeCompare(getName(right))),
    [sellerRequests]
  );

  const resetFeedback = () => {
    setStatusMessage('');
    setErrorMessage('');
  };

  const handleApproveSellerRequest = async (request) => {
    const governance = getSellerApplicationGovernance(request, projects);
    if (!governance.approvalEligible) {
      setErrorMessage(`Seller approval is blocked by ${governance.blockers.length} unresolved requirement${governance.blockers.length === 1 ? '' : 's'}.`);
      return;
    }
    const actionKey = `approve-request-${request.id}`;
    setWorkingKey(actionKey);
    resetFeedback();

    try {
      await httpsCallable(functions, 'reviewSellerRequest')({
        requestId: request.id,
        decision: 'approved'
      });

      setStatusMessage(`${getName(request)} has been approved as a seller.`);
      setSelectedSellerRequest(null);
    } catch (error) {
      console.error('Failed to approve seller request:', error);
      setErrorMessage(error?.message || 'Unable to approve the seller request right now.');
    } finally {
      setWorkingKey('');
    }
  };

  const handleRejectSellerRequest = async (request, reason) => {
    const actionKey = `reject-request-${request.id}`;
    setWorkingKey(actionKey);
    resetFeedback();

    try {
      await httpsCallable(functions, 'reviewSellerRequest')({
        requestId: request.id,
        decision: 'rejected',
        reason
      });

      setStatusMessage(`${getName(request)} has been marked as rejected.`);
      setSellerPendingRejection(null);
      setSelectedSellerRequest(null);
    } catch (error) {
      console.error('Failed to reject seller request:', error);
      setSellerRejectionError(error?.message || 'Unable to reject the seller request right now.');
    } finally {
      setWorkingKey('');
    }
  };

  const handleApproveProject = async (project) => {
    const currentStatus = getProjectStatus(project);
    if (currentStatus !== PROPERTY_STATUS.PENDING) {
      setErrorMessage(`This property is already ${currentStatus}; only pending properties can be reviewed.`);
      return;
    }
    if (!project.sellerAssociationValid) {
      setErrorMessage('Unable to approve property. Assign a valid seller before approval.');
      return;
    }
    const actionKey = `approve-project-${project.id}`;
    setWorkingKey(actionKey);
    resetFeedback();

    try {
      await httpsCallable(functions, 'reviewProject')({
        projectId: project.id,
        decision: PROPERTY_STATUS.APPROVED
      });
      setStatusMessage('Property approved. Activate it separately when it is ready for buyers.');
    } catch (error) {
      console.error('Failed to approve property:', error);
      setErrorMessage(error?.message || 'Unable to approve this property right now.');
    } finally {
      setWorkingKey('');
    }
  };

  const handleListingStatus = async (project, status) => {
    const projectId = typeof project === 'string' ? project : project?.id;
    const currentProject = typeof project === 'string' ? projects.find((item) => item.id === project) : project;
    const currentStatus = getProjectStatus(currentProject);
    const allowedTransitions = {
      [PROPERTY_STATUS.APPROVED]: [PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.INACTIVE, PROPERTY_STATUS.SOLD],
      [PROPERTY_STATUS.ACTIVE]: [PROPERTY_STATUS.INACTIVE, PROPERTY_STATUS.SOLD],
      [PROPERTY_STATUS.INACTIVE]: [PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.SOLD]
    };
    if (!projectId || !allowedTransitions[currentStatus]?.includes(status)) {
      setErrorMessage(currentStatus === status
        ? `This property is already ${status}.`
        : `Cannot change a ${currentStatus || 'unknown'} property to ${status}. Refresh and try again.`);
      return;
    }
    const actionKey = `${status}-project-${projectId}`;
    setWorkingKey(actionKey);
    resetFeedback();
    try {
      await httpsCallable(functions, 'setProjectStatus')({ projectId, status });
      setStatusMessage(`Property status changed to ${status}.`);
    } catch (error) {
      console.error('Failed to change property status:', error);
      setErrorMessage(error?.message || 'Unable to change this property status right now.');
    } finally {
      setWorkingKey('');
    }
  };

  const handleRejectProject = async (projectId, reason) => {
    const actionKey = `reject-project-${projectId}`;
    setWorkingKey(actionKey);
    resetFeedback();

    try {
      await httpsCallable(functions, 'reviewProject')({
        projectId,
        decision: PROPERTY_STATUS.REJECTED,
        reason
      });
      setStatusMessage('Property listing rejected successfully.');
      setPropertyPendingRejection(null);
      setPropertyRejectionError('');
    } catch (error) {
      console.error('Failed to reject property:', error);
      setPropertyRejectionError(error?.message || 'Unable to reject this property right now.');
    } finally {
      setWorkingKey('');
    }
  };

  const handleDocumentDecision = async (project, documentIndex, status) => {
    const actionKey = `document-${project.id}-${documentIndex}-${status}`;
    const sourceDocuments = Array.isArray(project.documents) && project.documents.length
      ? project.documents
      : normalizeProjectDocuments(project);
    setWorkingKey(actionKey);
    resetFeedback();
    try {
      await updateProject({
        ...project,
        documents: sourceDocuments.map((document, index) => index === documentIndex ? {
          ...document,
          status,
          reviewedAt: new Date().toISOString(),
          reviewedBy: user.uid,
          verifiedAt: status === 'verified' ? new Date().toISOString() : null
        } : document)
      });
      setStatusMessage(status === 'verified' ? 'Document verified successfully.' : 'Document rejected.');
    } catch (error) {
      console.error('Failed to review project document:', error);
      setErrorMessage('Unable to update the document review status.');
    } finally {
      setWorkingKey('');
    }
  };

  const renderDocumentReview = (project) => {
    const documents = normalizeProjectDocuments(project);
    if (documents.length === 0) return <span className="admin-document-empty">No documents uploaded</span>;
    return (
      <div className="admin-document-review-list">
        {documents.map((document, index) => (
          <div key={`${document.id || document.type}-${index}`} className="admin-document-review-row">
            <FileText size={15} />
            <span><strong>{getProjectDocumentLabel(document.type)}</strong><small className={`document-review-status ${document.status}`}>{document.status}</small></span>
            <button type="button" onClick={() => openDocumentPreview(document, setPreviewModal)} aria-label={`Preview ${getProjectDocumentLabel(document.type)}`}><Eye size={14} /></button>
            <button type="button" disabled={workingKey.startsWith(`document-${project.id}-${index}`) || document.status === 'verified'} onClick={() => handleDocumentDecision(project, index, 'verified')}>Verify</button>
            <button type="button" className="danger" disabled={workingKey.startsWith(`document-${project.id}-${index}`) || document.status === 'rejected'} onClick={() => handleDocumentDecision(project, index, 'rejected')}>Reject</button>
          </div>
        ))}
      </div>
    );
  };

  const openSellerWorkspace = (seller) => {
    resetFeedback();
    onSelectSeller(seller);
  };

  const openPropertyDetails = (property, origin = activeTab) => {
    setPropertyDetailsOrigin(origin);
    setViewingProperty(property);
    setEditingProperty(null);
  };

  const openMasterPropertyEditor = (propertyId) => {
    const property = projects.find((item) => item.id === propertyId);
    if (!property) {
      setErrorMessage('That property is no longer available.');
      return;
    }
    setActiveTab('properties');
    setViewingProperty(null);
    setSelectedBuyerProfile(null);
    setSelectedSellerProfile(null);
    setPropertiesFilterTab('all');
    setPropertiesSearchQuery('');
    setEditingProperty(property);
    setAiProjectContext(property.id);
    setIsDirty(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePropertyNameBadge = async (property) => {
    if (!property?.id) return;
    const actionKey = `toggle-property-name-badge-${property.id}`;
    const showNameBadge = !Boolean(property.display?.verified?.showNameBadge ?? property.showVerifiedNameBadge);
    setWorkingKey(actionKey);
    resetFeedback();
    try {
      const updatedProperty = withPropertyDisplayModel({
        ...property,
        showVerifiedNameBadge: showNameBadge,
        display: {
          ...(property.display || {}),
          verified: { ...(property.display?.verified || {}), showNameBadge }
        },
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid
      });
      await updateProject(updatedProperty);
      setStatusMessage(`Property name verification badge ${showNameBadge ? 'shown' : 'hidden'}.`);
    } catch (error) {
      console.error('Failed to update property name verification badge:', error);
      setErrorMessage('Unable to update the property name verification badge.');
    } finally {
      setWorkingKey('');
    }
  };

  const requestSellerRejection = (request) => {
    setSellerRejectionError('');
    setSellerPendingRejection(request);
  };

  const discardPropertyChanges = () => {
    setEditingProperty(null);
    setIsDirty(false);
  };

  const requestPropertyRejection = (property) => {
    setPropertyActionsMenu(null);
    setPropertyRejectionError('');
    setPropertyPendingRejection(property);
  };

  const closePropertyDetails = () => {
    setViewingProperty(null);
    setActiveTab(propertyDetailsOrigin);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
      setErrorMessage('Unable to log out right now.');
    }
  };

  const handleSupport = () => {
    window.open('mailto:support@zinoo.com?subject=Admin Support Request', '_blank');
  };

  const sidebarGroups = [
    {
      label: 'Overview',
      items: [
        { key: 'home', label: 'Dashboard', icon: LayoutDashboard, count: null },
        { key: 'ai_assistant', label: 'AI Assistant', icon: Bot, count: null }
      ]
    },
    {
      label: 'Operations',
      items: [
        { key: 'properties', label: 'Properties', icon: Building, count: propertiesMetrics.withErrors > 0 ? propertiesMetrics.withErrors : null },
        { key: 'listings', label: 'Property Reviews', icon: Building, count: pendingProjects.length },
        { key: 'requests', label: 'Seller Requests', icon: ClipboardList, count: pendingSellerRequests },
        { key: 'cashbacks', label: 'Cashback Management', icon: IndianRupee, count: cashbacks.filter(item => item.status === 'Pending Admin Review').length }
      ]
    },
    {
      label: 'Accounts',
      items: [
        { key: 'buyers', label: 'Buyers', icon: Users, count: buyers.length },
        { key: 'sellers', label: 'Sellers', icon: Store, count: sellers.length }
      ]
    },
    {
      label: 'Content Management',
      items: [
        { key: 'feed', label: 'Feed', icon: Images, count: null },
        { key: 'developers', label: 'Featured Developers', icon: Building, count: null },
        { key: 'whatsapp', label: 'WhatsApp Leads', icon: MessageCircle, count: null },
        { key: 'whatsapp_inbox', label: 'WhatsApp Inbox', icon: MessageCircle, count: null }
      ]
    },
    {
      label: 'Lead Management',
      items: [
        { key: 'crm_leads', label: 'Lead CRM', icon: UserCheck, count: crmFollowUpsTodayCount > 0 ? crmFollowUpsTodayCount : null }
      ]
    },
    {
      label: 'Account',
      items: [
        { key: 'profile', label: 'Profile', icon: User, count: null },
        { key: 'settings', label: 'Settings', icon: Settings, count: null },
        { key: 'logout', label: 'Logout', icon: LogOut, count: null, tone: 'danger' }
      ]
    }
  ];

  const handleSidebarAction = (key) => {
    resetFeedback();

    if (isDirty) {
      setErrorMessage('Save or discard your changes before leaving the property editor.');
      return;
    }

    if (key === 'buyer_mode') {
      onSwitchToBuyer();
      return;
    }

    if (key === 'seller_mode') {
      setActiveTab('sellers');
      onSwitchToAdmin();
      return;
    }

    if (key === 'logout') {
      handleLogout();
      return;
    }

    if (key === 'crm_leads') {
      if (!window.location.pathname.startsWith('/admin/leads')) {
        window.history.pushState({}, '', '/admin/leads');
      }
    }

    setActiveTab(key);
  };

  const dashboardRequestsPreview = pendingRequests.slice(0, 4);
  const dashboardListingPreview = pendingProjects.slice(0, 4);
  const profileName = user?.displayName || user?.phoneNumber || user?.email || 'Admin User';
  const profileEmail = user?.email || user?.phoneNumber || 'No contact info';

  const viewMeta = {
    home: {
      title: 'Dashboard',
      description: 'Review pending work and monitor the marketplace.'
    },
    ai_assistant: {
      title: 'AI Assistant',
      description: 'Ask project-aware questions using the latest saved Firestore data.'
    },
    properties: {
      title: 'Properties',
      description: 'Find, review, and maintain every property listing.'
    },
    buyers: {
      title: 'Buyer Accounts',
      description: 'Find buyers and inspect their property activity.'
    },
    sellers: {
      title: 'Seller Accounts',
      description: 'Manage approved sellers and enter their workspaces.'

    },
    requests: {
      title: 'Seller Requests',
      description: 'Review and decide pending seller applications.'

    },
    listings: {
      title: 'Property Review Queue',
      description: 'Approve or reject submitted property listings.'

    },
    cashbacks: {
      title: 'Cashback Management',
      description: 'Review claims, approvals, and payout progress.'

    },
    feed: {
      title: 'Feed',
      description: 'Manage the promotional banners shown on Buyer Home.'
    },
    developers: {
      title: 'Featured Developers',
      description: 'Curate the trusted developers shown on Buyer Home.'
    },
    whatsapp: {
      title: 'WhatsApp Leads',
      description: 'Manage your private lifetime lead directory and outreach defaults.'
    },
    whatsapp_inbox: {
      title: 'WhatsApp Inbox',
      description: 'Read and reply to inbound WhatsApp customer conversations.'
    },
    crm_leads: {
      title: 'Lead Management / CRM',
      description: 'Central workspace to qualify buyers, schedule site visits, track follow-ups, and close deals.'
    },
    profile: {
      title: 'Profile',
      description: 'Manage your administrator account details.'
    },
    settings: {
      title: 'Settings',
      description: 'Configure shared catalogs and workspace preferences.'
    }
  };

  const currentMeta = viewMeta[activeTab] || viewMeta.home;
  const selectAdminDestination = (key) => {
    handleSidebarAction(key);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="admin-shell">
      {isAndroidLayout && (
        <header className={`admin-mobile-top-app-bar m3-mobile-top-app-bar ${activeTab === 'home' ? 'admin-home-mobile-bar' : ''}`}>
          <button type="button" className="m3-icon-button" onClick={() => setMobileDrawerOpen(true)} aria-label="Open admin navigation">
            <Menu size={24} />
          </button>
          <div className="admin-mobile-context-title" title={editingProperty?.name || viewingProperty?.name || currentMeta.title}>
            {editingProperty?.name || viewingProperty?.name || currentMeta.title}
          </div>
          {activeTab === 'home' && (
            <button type="button" className="m3-icon-button admin-mobile-notification" onClick={() => setActiveTab('requests')} aria-label="Open pending notifications">
              <Bell size={20} />
              {(pendingSellerRequests + pendingProjects.length) > 0 && <b>{pendingSellerRequests + pendingProjects.length}</b>}
            </button>
          )}
          <ProfileDropdown
            user={user}
            onThemeToggle={onThemeToggle}
            isDarkMode={isDarkMode}
            permissions={permissions}
            currentView={currentView}
            onViewChange={onViewChange}
            onCustomerSupport={onCustomerSupport}
            onBackToAdmin={onBackToAdmin}
            selectedSeller={selectedSeller}
            hideChevron
          />
        </header>
      )}
      {isAndroidLayout && mobileDrawerOpen && (
        <div className="admin-mobile-drawer-scrim" role="presentation" onClick={() => setMobileDrawerOpen(false)}>
          <aside className="admin-mobile-drawer" role="dialog" aria-modal="true" aria-label="Admin navigation" onClick={(event) => event.stopPropagation()}>
            <div className="admin-mobile-drawer-head">
              <div><span>Zinoo</span><strong>Admin workspace</strong></div>
              <button type="button" className="m3-icon-button" onClick={() => setMobileDrawerOpen(false)} aria-label="Close navigation"><X size={24} /></button>
            </div>
            <nav>
              {sidebarGroups.map((group) => (
                <div key={group.label} className="admin-mobile-drawer-group">
                  <span>{group.label}</span>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button key={item.key} type="button" className={`${activeTab === item.key ? 'active' : ''}${item.tone === 'danger' ? ' danger' : ''}`} onClick={() => selectAdminDestination(item.key)}>
                        <Icon size={20} /><span>{item.label}</span>
                        {typeof item.count === 'number' && <b>{item.count}</b>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
      {!isAndroidLayout && <aside className="admin-sidebar">
        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          {sidebarGroups.map((group) => (
            <div key={group.label} className="admin-sidebar-group">
              <div className="admin-sidebar-group-label">{group.label}</div>
              <div className="admin-sidebar-group-items">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`admin-sidebar-link ${isActive ? 'active' : ''} ${item.tone === 'danger' ? 'danger' : ''}`}
                      onClick={() => handleSidebarAction(item.key)}
                    >
                      <span className="admin-sidebar-link-main">
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </span>
                      {typeof item.count === 'number' && (
                        <span className="admin-sidebar-badge">{item.count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>}

      <section className={`admin-content ${editingProperty ? 'admin-content-property-editor' : ''}`}>
        {activeTab !== 'home' && !(isAndroidLayout && activeTab === 'crm_leads') && <div className={`admin-content-header admin-content-header-compact ${editingProperty ? 'admin-content-header-editor' : ''}`}>
          <div>
            <h1>{activeTab === 'whatsapp' && whatsAppView === 'total-leads' ? 'WhatsApp Leads > Total leads' : currentMeta.title}</h1>
            <p>{activeTab === 'whatsapp' && whatsAppView === 'total-leads' ? 'All WhatsApp leads' : currentMeta.description}</p>
          </div>
        </div>}

        {statusMessage && <div className="app-success" role="status">{statusMessage}</div>}
        {errorMessage && <div className="app-error" role="alert">{errorMessage}</div>}

        {activeTab === 'cashbacks' && <CashbackWorkspace role="admin" cashbacks={cashbacks} />}
        {activeTab === 'feed' && <FeedBannerManager user={user} onSuccess={setStatusMessage} onError={setErrorMessage} />}
        {activeTab === 'developers' && <FeaturedDeveloperManager onSuccess={setStatusMessage} onError={setErrorMessage} />}
        {activeTab === 'whatsapp' && <WhatsAppLeadManager leads={leads} onSuccess={setStatusMessage} onError={setErrorMessage} onViewChange={setWhatsAppView} onOpenCampaign={(id) => { setSelectedWhatsAppCampaignId(id); setActiveTab('whatsapp_inbox'); }} />}
        {activeTab === 'whatsapp_inbox' && <WhatsAppInbox initialCampaignId={selectedWhatsAppCampaignId} onSuccess={setStatusMessage} onError={setErrorMessage} />}
        {activeTab === 'crm_leads' && <LeadManagementWorkspace leads={leads} projects={projects} user={user} onSuccess={setStatusMessage} onError={setErrorMessage} />}
        {activeTab === 'ai_assistant' && <AdminAIAssistant projects={projects} contextProjectId={aiProjectContext} onContextChange={setAiProjectContext} />}

        {activeTab === 'home' && (
          <div className="admin-panel-stack admin-executive-dashboard">
            <header className="admin-executive-header">
              <div>
                <span><Sun size={14} /> Operations overview</span>
                <h1>Dashboard</h1>
                <p>{pendingSellerRequests + pendingProjects.length > 0 ? `${pendingSellerRequests + pendingProjects.length} item${pendingSellerRequests + pendingProjects.length === 1 ? '' : 's'} need review.` : 'No seller or property approvals are waiting.'}</p>
              </div>
            </header>

            <section className="admin-operation-card admin-approval-center">
              <div className="admin-operation-heading">
                <div><span>Approval Center</span><h2>Seller Requests</h2></div>
                <b>{pendingSellerRequests} Pending</b>
              </div>
              {dashboardRequestsPreview.length === 0 ? (
                <div className="admin-approval-healthy">
                  <span><CheckCircle /> Everything is up to date.</span>
                  <p>There are no seller verification requests waiting.</p>
                </div>
              ) : (
                <div className="admin-approval-list">
                  {dashboardRequestsPreview.map((request) => (
                    <div key={request.id}>
                      <span className="admin-approval-avatar">{getName(request).charAt(0).toUpperCase()}</span>
                      <div><strong>{getName(request)}</strong><small>Pending verification</small></div>
                      <button type="button" onClick={() => setActiveTab('requests')}>Review <ChevronRight /></button>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" className="admin-open-queue" onClick={() => setActiveTab('requests')}>
                Open Approval Queue <ArrowRight />
              </button>
              <button type="button" className="admin-property-review-link" onClick={() => setActiveTab('listings')}>
                {dashboardListingPreview.length} propert{dashboardListingPreview.length === 1 ? 'y' : 'ies'} awaiting review <ChevronRight />
              </button>
            </section>

            <section className="admin-executive-metrics" aria-label="Operational summary">
              <article className="admin-executive-metric featured blue">
                <div className="admin-metric-icon"><Store /></div>
                <div><span>Approved Sellers</span><strong><AnimatedMetric value={sellers.length} /></strong></div>
                <small>Seller access granted</small>
              </article>
              <article className="admin-executive-metric indigo">
                <div className="admin-metric-icon"><Users /></div>
                <div><span>Buyers</span><strong><AnimatedMetric value={buyers.length} /></strong></div>
                <small>Total accounts</small>
              </article>
              <article className="admin-executive-metric green">
                <div className="admin-metric-icon"><ShieldCheck /></div>
                <div><span>Live Properties</span><strong><AnimatedMetric value={activeProjectList.length} /></strong></div>
                <small>Published listings</small>
              </article>
              <article className="admin-executive-metric orange">
                <div className="admin-metric-icon"><Clock3 /></div>
                <div><span>Needs Review</span><strong><AnimatedMetric value={pendingSellerRequests + pendingProjects.length} /></strong></div>
                <small>Sellers and properties</small>
              </article>
            </section>

            <section className="admin-operation-card admin-activity-card">
              <div className="admin-operation-heading"><div><span>Live Overview</span><h2>Today&apos;s Activity</h2></div></div>
              <div className="admin-activity-list">
                <div><span className="indigo"><Users /></span><strong>{buyers.length} buyer accounts</strong><small>Current</small></div>
                <div><span className="orange"><UserCheck /></span><strong>{pendingSellerRequests} seller applications</strong><small>Pending</small></div>
                <div><span className="green"><Building /></span><strong>{activeProjectList.length} properties published</strong><small>Live</small></div>
                <div><span className="purple"><ClipboardList /></span><strong>{pendingProjects.length} listings in review</strong><small>Now</small></div>
              </div>
            </section>

            <section className="admin-quick-actions" aria-label="Quick actions">
              <h2>Quick Actions</h2>
              <div>
                <button type="button" onClick={() => setActiveTab('properties')}><Plus /> Add Property</button>
                <button type="button" onClick={() => setActiveTab('requests')}><UserCheck /> Review Seller Applications</button>
                <button type="button" onClick={() => setActiveTab('cashbacks')}><BarChart3 /> Reports</button>
                <button type="button" onClick={() => setActiveTab('feed')}><Megaphone /> Broadcast</button>
              </div>
            </section>
          </div>
        )}

        {viewingProperty && activeTab !== 'properties' && (
          <AdminPropertyDetails
            property={viewingProperty}
            seller={sellers.find((item) => item.id === (viewingProperty.sellerId || viewingProperty.sellerUid || viewingProperty.ownerId))}
            onBack={closePropertyDetails}
            onOpenEditor={openMasterPropertyEditor}
            onApprove={handleApproveProject}
            onReject={requestPropertyRejection}
            workingKey={workingKey}
          />
        )}

        {activeTab === 'properties' && (
          <div className="admin-panel-stack">
            {viewingProperty && (
              <AdminPropertyDetails
                property={viewingProperty}
                seller={sellers.find((item) => item.id === (viewingProperty.sellerId || viewingProperty.sellerUid || viewingProperty.ownerId))}
                onBack={closePropertyDetails}
                onOpenEditor={openMasterPropertyEditor}
                onApprove={handleApproveProject}
                onReject={requestPropertyRejection}
                workingKey={workingKey}
              />
            )}
            {/* View Property Mode */}
            {false && viewingProperty && (
              <div className="admin-panel-section admin-property-details-view">
                <div className="admin-section-header">
                  <button type="button" className="btn-secondary" onClick={() => setViewingProperty(null)}>
                    <ArrowLeft size={16} /> Back to List
                  </button>
                  <div className="admin-actions-row">
                    <button type="button" className="btn-primary" onClick={() => openMasterPropertyEditor(viewingProperty.id)}>
                      <Edit size={16} /> Edit Property
                    </button>
                  </div>
                </div>

                <div className="property-details-header">
                  <h1>{viewingProperty.name || 'Untitled Property'}</h1>
                  <p className="property-subtitle">Project ID: {viewingProperty.projectId || viewingProperty.id || 'N/A'}</p>
                </div>

                <div className="property-details-grid">
                  <section className="details-card">
                    <h3>Property Overview</h3>
                    <div className="details-content">
                      <p><strong>Description:</strong> {viewingProperty.description || 'No description provided.'}</p>
                      <p><strong>Developer/Seller:</strong> {viewingProperty.developerName || viewingProperty.developer || 'N/A'}</p>
                      <p><strong>Contact:</strong> {viewingProperty.contactNumber || 'N/A'}</p>
                      <p><strong>Listing Status:</strong> <span className={`badge badge-info`}>{viewingProperty.status || 'draft'}</span></p>
                    </div>
                  </section>

                  <section className="details-card">
                    <h3>Location Information</h3>
                    <div className="details-content">
                      <p><strong>Address:</strong> {viewingProperty.completeAddress || 'N/A'}</p>
                      <p><strong>City:</strong> {viewingProperty.city || 'N/A'}, <strong>Locality:</strong> {viewingProperty.locality || 'N/A'}</p>
                      <p><strong>Landmark:</strong> {viewingProperty.landmark || 'N/A'}</p>
                      <p><strong>Coordinates:</strong> {viewingProperty.latitude || '0'}, {viewingProperty.longitude || '0'}</p>
                      <p><strong>Location Status:</strong> <span className={`badge ${viewingProperty.locationStatus === 'verified' ? 'badge-success' : 'badge-warning'}`}>{viewingProperty.locationStatus || 'missing'}</span></p>
                    </div>
                  </section>

                  <section className="details-card">
                    <h3>Plot & Pricing</h3>
                    <div className="details-content">
                      <p><strong>Min Plot Area:</strong> {viewingProperty.minimumPlotArea || viewingProperty.plotAreaMinSqFt || 'N/A'} {viewingProperty.plotAreaUnit || 'sq.ft.'}</p>
                      <p><strong>Max Plot Area:</strong> {viewingProperty.maximumPlotArea || viewingProperty.plotAreaMaxSqFt || 'N/A'} {viewingProperty.plotAreaUnit || 'sq.ft.'}</p>
                      <p><strong>Starting Price:</strong> ₹{viewingProperty.startingPrice || viewingProperty.priceFrom || 'N/A'}</p>
                      <p><strong>Max Price:</strong> ₹{viewingProperty.maximumPrice || 'N/A'}</p>
                    </div>
                  </section>

                  <section className="details-card">
                    <h3>Legal & Approvals</h3>
                    <div className="details-content">
                      <p><strong>RERA Status:</strong> {viewingProperty.reraStatus || 'N/A'} {viewingProperty.reraNumber ? `(No: ${viewingProperty.reraNumber})` : ''}</p>
                      <p><strong>NA Status:</strong> {viewingProperty.naStatus || 'N/A'}</p>
                      <p><strong>Title Status:</strong> {viewingProperty.titleStatus || 'N/A'}</p>
                      <p><strong>Legal Notes:</strong> {viewingProperty.legalNotes || 'None'}</p>
                    </div>
                  </section>

                  <section className="details-card">
                    <h3>Amenities</h3>
                    <div className="details-content">
                      <div className="amenities-list-vertical">
                        <p><strong>Road Access:</strong> {viewingProperty.roadAccess ? 'Yes' : 'No'}</p>
                        <p><strong>Electricity:</strong> {viewingProperty.electricity ? 'Yes' : 'No'}</p>
                        <p><strong>Water Supply:</strong> {viewingProperty.waterSupply ? 'Yes' : 'No'}</p>
                        <p><strong>Drainage:</strong> {viewingProperty.drainage ? 'Yes' : 'No'}</p>
                        <p><strong>Street Lights:</strong> {viewingProperty.streetLights ? 'Yes' : 'No'}</p>
                        <p><strong>Compound/Boundary:</strong> {viewingProperty.compoundBoundary || viewingProperty.layoutPolygon ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </section>

                  <section className="details-card">
                    <h3>Site Visit & Media</h3>
                    <div className="details-content">
                      <p><strong>Site Visit Available:</strong> {viewingProperty.siteVisitAvailable ? 'Yes' : 'No'}</p>
                      <p><strong>Site Visit Contact:</strong> {viewingProperty.siteVisitContactNumber || 'N/A'}</p>
                      <p><strong>Media Files:</strong> {((viewingProperty.images?.length || 0) + (viewingProperty.thumbnail ? 1 : 0))} image(s)</p>
                    </div>
                  </section>
                </div>

                {/* Audit & Error Logs */}
                <div className="property-logs-section">
                  <div className="logs-column">
                    <h3>Active Errors ({viewingProperty.errors?.length || 0})</h3>
                    {viewingProperty.errors?.length > 0 ? (
                      <div className="errors-history-list">
                        {viewingProperty.errors.map(err => (
                          <div key={err.id} className="error-log-card">
                            <div className="error-log-head">
                              <span className={`badge badge-danger severity-${err.severity}`}>{err.severity.toUpperCase()}</span>
                              <strong>{err.title}</strong>
                            </div>
                            <p>{err.description}</p>
                            <small>Detected: {new Date(err.detectedAt).toLocaleString()}</small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-logs">No validation errors detected on this property.</p>
                    )}
                  </div>

                  <div className="logs-column">
                    <h3>Audit Trail / Edit History</h3>
                    {viewingProperty.auditLog?.length > 0 ? (
                      <div className="audit-history-list">
                        {viewingProperty.auditLog.map(audit => (
                          <div key={audit.id} className="audit-log-card">
                            <p>{audit.change}</p>
                            <div className="audit-log-meta">
                              <span>By: {audit.adminName}</span>
                              <span>{new Date(audit.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-logs">No edit history recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Edit Property Mode */}
            {editingProperty && (
              <PropertyDisplayEditor mode="edit" role="admin" sellers={editorSellers} user={user} property={editingProperty} amenityOptions={amenityOptions}
                onChange={(nextProperty) => { setEditingProperty(nextProperty); setIsDirty(true); }} onSubmit={(event) => { event.preventDefault(); return handleSaveProperty(editingProperty); }} onCancel={discardPropertyChanges} onReset={() => setEditingProperty(projects.find((item) => item.id === editingProperty.id) || editingProperty)} autoDetectHighway isDirty={isDirty} onDirtyChange={setIsDirty} submitError={errorMessage} />
            )}
            {/* List Mode */}
            {!viewingProperty && !editingProperty && (
              <>
                {propertiesMetrics.sellerMissing > 0 && (
                  <div className="app-error" role="alert">Action required: Some properties are not associated with a valid seller.</div>
                )}
                <section className="admin-property-list" aria-label="Property management list">
                  <div className="admin-property-list-search-row">
                    <SearchBar
                      className="admin-property-list-search"
                      placeholder="Search by property name, project ID..."
                      value={propertiesSearchQuery}
                      onChange={(e) => { setPropertiesSearchQuery(e.target.value); setCurrentPage(1); }}
                      trailingWidget={propertiesSearchQuery ? (
                        <button type="button" className="clear-search-btn" aria-label="Clear property search" onClick={() => setPropertiesSearchQuery('')}>
                          <X size={16} />
                        </button>
                      ) : null}
                    />
                  </div>

                  <div className="admin-property-list-summary">
                    <strong>{filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found</strong>
                    <label className="admin-property-sort">
                      <span>Sort:</span>
                      <select value={sortField} onChange={(event) => {
                        const nextField = event.target.value;
                        setSortField(nextField);
                        setSortDirection(nextField === 'name' ? 'asc' : 'desc');
                        setCurrentPage(1);
                      }} aria-label="Sort properties">
                        <option value="createdAt">Recently Added</option>
                        <option value="updatedAt">Recently Updated</option>
                        <option value="name">Name A–Z</option>
                      </select>
                      <ChevronDown size={16} aria-hidden="true" />
                    </label>
                  </div>

                  <div className="admin-property-card-list">
                  {filteredProperties.length === 0 ? (
                    <div className="admin-empty-state-card">
                      <AlertCircle size={32} />
                      {propertiesSearchQuery ? (
                        <>
                          <h4>No matching properties found</h4>
                          <p>No properties match your search.</p>
                          <button type="button" className="btn-secondary" onClick={() => setPropertiesSearchQuery('')}>
                            Clear Search
                          </button>
                        </>
                      ) : (
                        <>
                          <h4>No properties added yet</h4>
                          <p>Start by creating some properties on the seller side first.</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="admin-property-cards">
                        {paginatedProperties.map((property) => {
                          const mainImg = property.thumbnail || property.heroImage || property.coverImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=240&q=80';
                          const addedAt = property.createdAt || property.updatedAt;
                          const status = getProjectStatus(property);
                          const statusLabel = status === PROPERTY_STATUS.PENDING ? 'Pending Review' : status.replace(/_/g, ' ');
                          const propertySeller = sellers.find((seller) => seller.id === (property.sellerId || property.sellerUid || property.ownerId));
                          const propertyPhone = property.contactNumber || property.siteVisitContactNumber || property.siteVisitContact || property.whatsappNumber || propertySeller?.phoneNumber || propertySeller?.phone;
                          const propertyDocuments = normalizeProjectDocuments(property);
                          const documentNames = propertyDocuments.map((document) => document.displayName || document.originalFileName || document.fileName || getProjectDocumentLabel(document.type));
                          const documentSummary = documentNames.length > 2 ? `${documentNames.slice(0, 2).join(', ')} +${documentNames.length - 2} more` : documentNames.join(', ');
                          const highlightOffer = property.highlightBadge || property.display?.highlightBadge;
                          return (
                            <article key={property.id} className={`admin-property-list-card ${property.hasErrors ? 'has-errors' : ''} ${propertyActionsMenu?.id === property.id ? 'has-open-menu' : ''}`}>
                              <button type="button" className="admin-property-card-main" onClick={() => openPropertyDetails(property, 'properties')} aria-label={`View ${property.name || 'property'}`}>
                                <img src={mainImg} alt="" className="admin-property-card-thumbnail" />
                                <span className="admin-property-card-copy">
                                  <strong>{property.name || 'Untitled Project'}{property.display?.verified?.showNameBadge && <ShieldCheck className="property-name-verified-badge" aria-label="Verified property" />}</strong>
                                  <span className="admin-property-card-id">ID: {property.projectId || property.id || 'N/A'}</span>
                                  <span className="admin-property-card-location"><MapPin size={14} aria-hidden="true" /> {[property.village, property.area, property.city].filter(Boolean).join(', ') || 'Location unavailable'}</span>
                                  <span className="admin-property-card-seller">Seller: {propertySeller?.businessName || propertySeller?.displayName || propertySeller?.name || property.developerName || 'Unassigned'}</span>
                                  <span className="admin-property-card-badges">
                                    <span className={`admin-property-pill status-${status}`}>{statusLabel}</span>
                                    {property.locationStatus === 'verified' && <span className="admin-property-pill is-success">Verified</span>}
                                    {property.hasErrors
                                      ? <span className="admin-property-pill is-error">{property.errors?.length || 1} {property.errors?.length === 1 ? 'Error' : 'Errors'}</span>
                                      : <span className="admin-property-pill is-success">Healthy</span>}
                                    {!property.sellerAssociationValid && <span className="admin-property-pill is-error">Seller Missing</span>}
                                  </span>
                                  <span className="admin-property-card-date"><Clock3 size={14} aria-hidden="true" /> Added on {formatAdminDate(addedAt)}</span>
                                </span>
                                <span className="admin-property-card-extra">
                                  <span className="admin-property-card-extra-row">
                                    <Phone size={15} aria-hidden="true" />
                                    <span><small>Mobile</small><strong title={propertyPhone || 'No mobile number added'}>{propertyPhone || 'Not added'}</strong></span>
                                  </span>
                                  <span className="admin-property-card-extra-row admin-property-card-offer-row">
                                    <Sparkles size={15} aria-hidden="true" />
                                    <span><small>Offer strip</small>{highlightOffer && highlightOffer !== 'NONE' ? <PropertyHighlightBadge badgeType={highlightOffer} /> : <strong>No offer strip</strong>}</span>
                                  </span>
                                  <span className="admin-property-card-extra-row">
                                    <FileText size={15} aria-hidden="true" />
                                    <span><small>Documents</small><strong title={documentSummary || 'No documents added'}>{documentSummary || 'None added'}</strong></span>
                                  </span>
                                  <span className="admin-property-card-extra-row">
                                    <MapPin size={15} aria-hidden="true" />
                                    <span><small>Zone</small><strong>{getLandZoneLabel(property)}</strong></span>
                                  </span>
                                </span>
                              </button>
                              <div className="admin-property-card-actions">
                                <button
                                      type="button"
                                      className="admin-property-card-overflow admin-overflow-trigger"
                                      aria-label={`More actions for ${property.name || 'property'}`}
                                      aria-haspopup="menu"
                                      aria-expanded={propertyActionsMenu?.id === property.id}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        const rect = event.currentTarget.getBoundingClientRect();
                                        setPropertyActionsMenu((current) => current?.id === property.id ? null : {
                                          id: property.id,
                                          top: rect.bottom + 6,
                                          right: Math.max(8, window.innerWidth - rect.right)
                                        });
                                      }}
                                    >
                                      <MoreVertical size={20} aria-hidden="true" />
                                    </button>
                                    {propertyActionsMenu?.id === property.id && (
                                      <div
                                        className="admin-overflow-menu"
                                        role="menu"
                                        ref={propertyActionsMenuRef}
                                        style={{ top: propertyActionsMenu.top, right: propertyActionsMenu.right }}
                                      >
                                        <button type="button" role="menuitem" onClick={() => { setPropertyActionsMenu(null); openPropertyDetails(property, 'properties'); }}>
                                          <Eye size={15} /> View
                                        </button>
                                        <button
                                          type="button"
                                          role="menuitem"
                                          disabled={workingKey === `toggle-property-name-badge-${property.id}`}
                                          onClick={async () => {
                                            await togglePropertyNameBadge(property);
                                            setPropertyActionsMenu(null);
                                          }}
                                        >
                                          <ShieldCheck size={15} /> {property.display?.verified?.showNameBadge ?? property.showVerifiedNameBadge ? 'Hide name badge' : 'Show name badge'}
                                        </button>
                                        {status === PROPERTY_STATUS.PENDING && (
                                          <button type="button" role="menuitem" disabled={!getPropertyGovernance(property, { sellerAssociationValid: property.sellerAssociationValid }).approvalEligible || workingKey === `approve-project-${property.id}`} onClick={async () => { await handleApproveProject(property); setPropertyActionsMenu(null); }}>
                                            {workingKey === `approve-project-${property.id}` ? <><LoaderCircle className="button-spinner" size={15} /> Approving…</> : <><CheckCircle size={15} /> Approve</>}
                                          </button>
                                        )}
                                        {[PROPERTY_STATUS.APPROVED, PROPERTY_STATUS.INACTIVE].includes(status) && (
                                          <button type="button" role="menuitem" disabled={workingKey === `active-project-${property.id}`} onClick={async () => { await handleListingStatus(property, PROPERTY_STATUS.ACTIVE); setPropertyActionsMenu(null); }}>{workingKey === `active-project-${property.id}` ? <><LoaderCircle className="button-spinner" size={15} /> Activating…</> : <><Activity size={15} /> Activate</>}</button>
                                        )}
                                        {status === PROPERTY_STATUS.ACTIVE && (
                                          <button type="button" role="menuitem" onClick={() => { setPropertyActionsMenu(null); handleListingStatus(property, PROPERTY_STATUS.INACTIVE); }}><Clock3 size={15} /> Deactivate</button>
                                        )}
                                        <button type="button" role="menuitem" onClick={() => {
                                          setPropertyActionsMenu(null);
                                          openMasterPropertyEditor(property.id);
                                        }}>
                                          <Edit size={15} /> {property.sellerAssociationValid ? 'Edit' : 'Assign Seller'}
                                        </button>
                                        <button
                                          type="button"
                                          role="menuitem"
                                          disabled={![PROPERTY_STATUS.APPROVED, PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.INACTIVE].includes(status)}
                                          onClick={() => {
                                            setPropertyActionsMenu(null);
                                            handleListingStatus(property, PROPERTY_STATUS.SOLD);
                                          }}
                                        >
                                          <CheckCircle size={15} /> Mark Sold
                                        </button>
                                        {property.locationStatus !== 'verified' && (
                                          <button type="button" role="menuitem" onClick={() => {
                                            setPropertyActionsMenu(null);
                                            openMasterPropertyEditor(property.id);
                                          }}>
                                            <AlertTriangle size={15} /> Fix Location
                                          </button>
                                        )}
                                        <button type="button" role="menuitem" onClick={() => {
                                          setPropertyActionsMenu(null);
                                          if (property.latitude && property.longitude) {
                                            window.open(`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`, '_blank');
                                          } else {
                                            alert('No valid map coordinates saved for this property.');
                                          }
                                        }}>
                                          <MapPin size={15} /> Map
                                        </button>
                                        {canDeleteProperties && (
                                          <button type="button" role="menuitem" className="danger" onClick={() => {
                                            setPropertyActionsMenu(null);
                                            setDeletePropertyError('');
                                            setPropertyPendingDeletion(property);
                                          }}>
                                            <Trash2 size={15} /> Delete
                                          </button>
                                        )}
                                      </div>
                                    )}
                              </div>
                            </article>
                          );
                        })}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="admin-pagination-row">
                          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(curr => curr - 1)}>
                            <ArrowLeft size={14} /> Previous
                          </button>
                          <span>Page {currentPage} of {totalPages}</span>
                          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(curr => curr + 1)}>
                            Next <ArrowRight size={14} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {activeTab === 'buyers' && (
          <div className="admin-panel-section admin-buyers-section">
            {selectedBuyerProfile ? (() => {
              const interestedIds = new Set(leads.filter((lead) => lead.createdBy === selectedBuyerProfile.id).map((lead) => lead.projectId).filter(Boolean));
              const interestedProperties = projects.filter((property) => interestedIds.has(property.id));
              return (
                <div className="admin-account-profile">
                  <div className="admin-section-header">
                    <button type="button" className="btn-secondary" onClick={() => setSelectedBuyerProfile(null)}><ArrowLeft size={16} /> Back to Buyers</button>
                  </div>
                  <div className="admin-account-profile-header">
                    <span className="admin-account-avatar">{getInitials(selectedBuyerProfile)}</span>
                    <div><span className="admin-panel-kicker">Buyer Profile</span><h2>{getBuyerName(selectedBuyerProfile)}</h2><p>{selectedBuyerProfile.phoneNumber || selectedBuyerProfile.phone || 'N/A'}</p></div>
                  </div>
                  <div className="admin-profile-section-title"><div><h3>Interested Properties</h3><p>Properties connected to this buyer through enquiries and visits.</p></div><span>{interestedProperties.length}</span></div>
                  <div className="admin-related-properties-grid">
                    {interestedProperties.length ? interestedProperties.map((property) => (
                      <article key={property.id} className="admin-related-property-card">
                        <img src={property.thumbnailUrl || property.thumbnail || property.heroImage || property.coverImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'} alt="" />
                        <div><span className={`badge badge-status-${String(property.status || 'draft').toLowerCase()}`}>{property.status || 'Draft'}</span><h4>{property.name || 'Untitled Property'}</h4><p>{[property.locality, property.city].filter(Boolean).join(', ') || 'Location not provided'}</p><strong>₹{property.startingPrice || property.priceFrom || 'N/A'}</strong><button type="button" className="btn-primary" onClick={() => openPropertyDetails(property, 'buyers')}>View Details</button></div>
                      </article>
                    )) : <div className="admin-empty-state-card"><Building size={30} /><h4>No interested properties</h4><p>This buyer has no property enquiries yet.</p></div>}
                  </div>
                </div>
              );
            })() : <>
              <div className="admin-properties-toolbar admin-buyer-toolbar">
                <SearchBar value={buyerSearchQuery} onChange={(event) => setBuyerSearchQuery(event.target.value)} placeholder="Search buyer, phone, email or ID" />
                <label className="admin-buyer-sort">
                  <span>Sort</span>
                  <select value={buyerSortOrder} onChange={(event) => setBuyerSortOrder(event.target.value)} aria-label="Sort buyers">
                    <option value="recent">Recently signed in</option>
                    <option value="oldest">Oldest sign-in</option>
                    <option value="name">Name A–Z</option>
                  </select>
                </label>
              </div>
            {isAndroidLayout ? (
              <div className="admin-mobile-buyer-list" role="list" aria-label="Buyer accounts">
                {visibleBuyers.length === 0 ? <div className="admin-mobile-buyer-empty"><strong>No buyers found</strong><span>Try another search.</span></div> : visibleBuyers.map((buyer) => (
                  <button key={buyer.id} type="button" className="admin-mobile-buyer-row" role="listitem" onClick={() => setSelectedBuyerProfile(buyer)} aria-label={`Open ${getBuyerName(buyer)} details`}>
                    <span className="admin-mobile-buyer-avatar" aria-hidden="true">{getInitials(buyer)}</span>
                    <div className="admin-mobile-buyer-copy">
                      <strong>{getBuyerName(buyer)}</strong>
                      <span>{buyer.phoneNumber || buyer.phone || 'N/A'} · {buyer.firstSignedInAt ? `First signed in ${formatAdminDateTime(buyer.firstSignedInAt)}` : 'No sign-in recorded'}</span>
                    </div>
                    <ChevronRight size={17} className="admin-mobile-buyer-chevron" aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : <div className="table-container">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>First sign-in</th>
                    <th>Last sign-in</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBuyers.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No buyer accounts found.</td>
                    </tr>
                  ) : (
                    visibleBuyers.map((buyer) => (
                      <tr key={buyer.id}>
                        <td><strong>{getBuyerName(buyer)}</strong></td>
                        <td>{buyer.phoneNumber || buyer.phone || 'N/A'}</td>
                        <td>{buyer.firstSignedInAt ? formatAdminDateTime(buyer.firstSignedInAt) : 'Not recorded yet'}</td>
                        <td>{buyer.lastSignedInAt ? formatAdminDateTime(buyer.lastSignedInAt) : 'Not recorded yet'}</td>
                        <td><button type="button" className="btn-secondary seller-inline-button" onClick={() => setSelectedBuyerProfile(buyer)}><Eye size={14} /> View Profile</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>}</>}
          </div>
        )}

        {activeTab === 'sellers' && (
          <div className="admin-panel-section">
            {!selectedSellerProfile && <div className="admin-properties-toolbar"><SearchBar value={sellerSearchQuery} onChange={(event) => setSellerSearchQuery(event.target.value)} placeholder="Search seller, business, phone, email or ID" /></div>}
            {selectedSellerProfile ? (() => {
              const sellerProperties = projects.filter((property) => (property.ownerId || property.sellerUid || property.sellerId) === selectedSellerProfile.id);
              const pendingApprovals = sellerProperties.filter((property) => ['pending', 'pending_review'].includes(String(property.status || property.approvalStatus || property.reviewStatus || '').toLowerCase())).length;
              return (
                <div className="admin-account-profile">
                  <div className="admin-section-header">
                    <button type="button" className="btn-secondary" onClick={() => setSelectedSellerProfile(null)}><ArrowLeft size={16} /> Back to Sellers</button>
                  </div>
                  <div className="admin-account-profile-header">
                    <UserAvatar profile={selectedSellerProfile} fallbackLabel="Seller" className="admin-account-avatar" useSellerDefault />
                    <div><span className="admin-panel-kicker">Seller Profile</span><h2>{selectedSellerProfile.businessName || getName(selectedSellerProfile)}</h2><p>{selectedSellerProfile.email || 'No email'} · {selectedSellerProfile.phoneNumber || selectedSellerProfile.phone || 'No phone'}</p></div>
                  </div>
                  <div className="admin-mobile-seller-facts"><div><span>Approval state</span><strong>Approved</strong></div><div><span>Pending properties</span><strong>{pendingApprovals}</strong></div></div>
                  <button type="button" className="btn-primary admin-mobile-seller-workspace" onClick={() => openSellerWorkspace(selectedSellerProfile)}><Users size={16} /> Go to Seller Side</button>
                  <div className="admin-profile-section-title"><div><h3>Properties</h3><p>All properties associated with this seller.</p></div><span>{sellerProperties.length}</span></div>
                  <div className="admin-related-properties-grid">
                    {sellerProperties.length ? sellerProperties.map((property) => (
                      <article key={property.id} className="admin-related-property-card">
                        <img src={property.thumbnailUrl || property.thumbnail || property.heroImage || property.coverImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'} alt="" />
                        <div><span className={`badge badge-status-${String(property.status || 'draft').toLowerCase()}`}>{property.status || 'Draft'}</span><h4>{property.name || 'Untitled Property'}</h4><p>{[property.locality, property.city].filter(Boolean).join(', ') || 'Location not provided'}</p><strong>₹{property.startingPrice || property.priceFrom || 'N/A'}</strong><button type="button" className="btn-primary" onClick={() => openPropertyDetails(property, 'sellers')}>View Details</button></div>
                      </article>
                    )) : <div className="admin-empty-state-card"><Building size={30} /><h4>No properties</h4><p>This seller does not have any associated properties.</p></div>}
                  </div>
                </div>
              );
            })() : isAndroidLayout ? (
              <div className="admin-mobile-seller-list" role="list">
                {visibleSellers.length === 0 ? <div className="admin-mobile-seller-empty">No approved sellers match this search.</div> : visibleSellers.map((seller) => {
                  const propertyCount = sellerProjectCounts.get(seller.id) || 0;
                  return (
                    <button type="button" role="listitem" className="admin-mobile-seller-row" key={seller.id} onClick={() => setSelectedSellerProfile(seller)}>
                      <UserAvatar profile={seller} fallbackLabel="Seller" className="admin-mobile-seller-avatar" useSellerDefault />
                      <span className="admin-mobile-seller-copy">
                        <strong>{seller.businessName || seller.displayName || seller.name || 'Unknown'}</strong>
                        <small>{seller.phoneNumber || seller.phone || 'Phone unavailable'}</small>
                      </span>
                      <span className="admin-mobile-seller-meta"><b>Approved</b><small>{propertyCount} {propertyCount === 1 ? 'Property' : 'Properties'}</small></span>
                      <ChevronRight size={20} />
                    </button>
                  );
                })}
              </div>
            ) : <div className="table-container">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Seller Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Business Name</th>
                    <th>Properties</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSellers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No approved sellers found.</td>
                    </tr>
                  ) : (
                    visibleSellers.map((seller) => {
                      const sellerProjects = projects.filter((project) => [project.ownerId, project.sellerId, project.sellerUid].includes(seller.id));
                      return (
                        <tr key={seller.id}>
                          <td><strong>{seller.displayName || seller.name || seller.businessName || 'Unknown'}</strong></td>
                          <td>{seller.email || 'N/A'}</td>
                          <td>{seller.phoneNumber || seller.phone || 'N/A'}</td>
                          <td>{seller.businessName || 'N/A'}</td>
                          <td>{sellerProjects.length}</td>
                          <td>
                            <span className="badge badge-success">Approved</span>
                          </td>
                          <td>
                            <button type="button" className="btn-secondary seller-inline-button" onClick={() => setSelectedSellerProfile(seller)}>
                              <Eye size={14} /> View seller
                            </button>
                            <button type="button" className="btn-secondary seller-inline-button" onClick={() => openSellerWorkspace(seller)}>
                              <Users size={14} /> Go to Seller Side
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>}

            {pendingSellerRequests > 0 && (
              <div className="admin-inline-note">
                <ClipboardList size={16} />
                <span>{pendingSellerRequests} seller request{pendingSellerRequests === 1 ? '' : 's'} still pending in Firestore.</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="admin-panel-section">
            {selectedSellerRequest ? <AdminSellerReview application={selectedSellerRequest} properties={projects} workingKey={workingKey} onBack={() => setSelectedSellerRequest(null)} onApprove={handleApproveSellerRequest} onReject={requestSellerRejection} onOpenProperty={(property) => openPropertyDetails(property, 'requests')} /> : isAndroidLayout ? (
              <div className="admin-mobile-review-list" role="list" aria-label="Pending seller requests">
                {pendingRequests.length === 0 ? (
                  <div className="admin-empty-state-card"><CheckCircle size={30} /><h4>No pending requests</h4><p>All seller applications have been reviewed.</p></div>
                ) : pendingRequests.map((request) => (
                  <article key={request.id} className="admin-mobile-review-card" role="listitem">
                    <header><div><h3>{getName(request)}</h3><p>{request.businessName || 'Business name not provided'}</p></div><span className="badge badge-warning">Pending</span></header>
                    <div className="admin-mobile-review-meta">
                      <span><small>Phone</small><strong>{request.contactPhone || request.userPhone || 'N/A'}</strong></span>
                      <span><small>Email</small><strong>{request.userEmail || request.contactEmail || 'No email'}</strong></span>
                    </div>
                    <div className="admin-mobile-review-actions">
                      <button type="button" className="btn-primary" onClick={() => setSelectedSellerRequest(request)}><Eye size={16} /> Review seller</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : <div className="table-container">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Business</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending seller requests.</td>
                    </tr>
                  ) : (
                    pendingRequests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <strong>{getName(request)}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{request.userEmail || request.contactEmail || 'No email'}</div>
                        </td>
                        <td>{request.businessName || 'N/A'}</td>
                        <td>{request.contactPhone || request.userPhone || 'N/A'}</td>
                        <td><span className="badge badge-warning">Pending</span></td>
                        <td>
                          <button type="button" className="btn-primary seller-inline-button" onClick={() => setSelectedSellerRequest(request)}><Eye size={14} /> Review seller</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>}
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="admin-panel-stack">
            <div className="admin-panel-section">
              {isAndroidLayout ? (
                <div className="admin-mobile-review-list" role="list" aria-label="Properties awaiting review">
                  {pendingProjects.length === 0 ? (
                    <div className="admin-empty-state-card"><CheckCircle size={30} /><h4>No properties waiting</h4><p>All submitted listings have been reviewed.</p></div>
                  ) : pendingProjects.map((project) => {
                    const seller = sellers.find((item) => item.id === project.ownerId);
                    return <article key={project.id} className="admin-mobile-review-card" role="listitem">
                      <header><div><h3>{project.name || 'Untitled project'}</h3><p>{getProjectOwnerName(project, sellers)}</p></div><span className="badge badge-warning">Pending</span></header>
                      <div className="admin-mobile-review-meta">
                        <span><small>Village</small><strong>{project.village || 'N/A'}</strong></span>
                        <span><small>Land zone</small><strong>{getLandZoneLabel(project)}</strong></span>
                        <span><small>NA status</small><strong>{getNaStatusLabel(project)}</strong></span>
                        <span><small>Documents</small><strong>{normalizeProjectDocuments(project).length} uploaded</strong></span>
                      </div>
                      <div className="admin-mobile-review-actions">
                        <button type="button" className="btn-primary" disabled={workingKey === `approve-project-${project.id}`} onClick={() => handleApproveProject({ ...project, sellerAssociationValid: Boolean((project.sellerId || project.sellerUid || project.ownerId) && sellers.some((entry) => entry.id === (project.sellerId || project.sellerUid || project.ownerId))) })}>{workingKey === `approve-project-${project.id}` ? <><LoaderCircle className="button-spinner" size={16} /> Approving…</> : <><ShieldCheck size={16} /> Approve</>}</button>
                        <button type="button" className="btn-secondary danger" disabled={workingKey === `reject-project-${project.id}`} onClick={() => requestPropertyRejection(project)}><ShieldX size={16} /> Reject</button>
                      </div>
                      {seller && <button type="button" className="btn-secondary" onClick={() => openSellerWorkspace(seller)}><Store size={16} /> Open seller workspace</button>}
                    </article>;
                  })}
                </div>
              ) : <div className="table-container">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Projected by</th>
                      <th>Village</th>
                      <th>Land Zone</th>
                      <th>NA Status</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingProjects.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No property listings are waiting for approval.</td>
                      </tr>
                    ) : (
                      pendingProjects.map((project) => {
                        const seller = sellers.find((item) => item.id === project.ownerId);

                        return (
                          <tr key={project.id}>
                            <td>
                              <strong>{project.name}</strong>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{project.area || 'Area not provided'}</div>
                              {renderDocumentReview(project)}
                            </td>
                            <td>{getProjectOwnerName(project, sellers)}</td>
                            <td>{project.village || 'N/A'}</td>
                            <td>{getLandZoneLabel(project)}</td>
                            <td>{getNaStatusLabel(project)}</td>
                            <td><span className="badge badge-warning">Pending Review</span></td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  className="btn-primary seller-inline-button"
                                  disabled={workingKey === `approve-project-${project.id}`}
                                  onClick={() => handleApproveProject({ ...project, sellerAssociationValid: Boolean((project.sellerId || project.sellerUid || project.ownerId) && sellers.some((seller) => seller.id === (project.sellerId || project.sellerUid || project.ownerId))) })}
                                >
                                  {workingKey === `approve-project-${project.id}` ? <><LoaderCircle className="button-spinner" size={14} /> Approving…</> : <><ShieldCheck size={14} /> Approve</>}
                                </button>
                                <button
                                  type="button"
                                  className="btn-secondary seller-inline-button danger"
                                  disabled={workingKey === `reject-project-${project.id}`}
                                  onClick={() => requestPropertyRejection(project)}
                                >
                                  <ShieldX size={14} /> Reject
                                </button>
                                {seller && (
                                  <button
                                    type="button"
                                    className="btn-secondary seller-inline-button"
                                    onClick={() => openSellerWorkspace(seller)}
                                  >
                                    <Store size={14} /> Open Seller Side
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>}
            </div>
            <div className="admin-panel-section">
              <div className="admin-panel-section-head">
                <div>
                  <span className="admin-panel-kicker">Active</span>
                  <h3>Active projects</h3>
                </div>
                <span>{activeProjectList.length}</span>
              </div>
              {isAndroidLayout ? (
                <div className="admin-mobile-review-list admin-mobile-active-projects" role="list" aria-label="Active projects">
                  {activeProjectList.map((project) => (
                    <article key={project.id} className="admin-mobile-review-card" role="listitem">
                      <header><div><h3>{project.name || 'Unnamed project'}</h3><p>{[project.village, project.area].filter(Boolean).join(', ') || 'Location not provided'}</p></div><span className="badge badge-success">Active</span></header>
                      <div className="admin-mobile-review-meta">
                        <span><small>Seller</small><strong>{getProjectOwnerName(project, sellers)}</strong></span>
                        <span><small>Land</small><strong>{getLandZoneLabel(project)}</strong></span>
                        <span><small>NA status</small><strong>{getNaStatusLabel(project)}</strong></span>
                        <span><small>Documents</small><strong>{normalizeProjectDocuments(project).length} uploaded</strong></span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : <div className="table-container">
                <table className="dash-table">
                  <thead><tr><th>Project</th><th>Projected by</th><th>Location</th><th>Land Zone</th><th>NA Status</th><th>Status</th></tr></thead>
                  <tbody>
                    {activeProjectList.map((project) => (
                      <tr key={project.id}>
                        <td><strong>{project.name || 'Unnamed project'}</strong>{renderDocumentReview(project)}</td>
                        <td>{getProjectOwnerName(project, sellers)}</td>
                        <td>{[project.village, project.area].filter(Boolean).join(', ') || 'Location not provided'}</td>
                        <td>{getLandZoneLabel(project)}</td>
                        <td>{getNaStatusLabel(project)}</td>
                        <td><span className="badge badge-success">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <section className="admin-panel-section admin-profile-panel">
            <div className="admin-profile-card">
              <span className="admin-panel-kicker">Admin Account</span>
              <h3>{profileName}</h3>
              <p>{profileEmail}</p>
              <div className="admin-profile-actions">
                <button type="button" className="btn-primary" onClick={() => setShowProfileModal(true)}>
                  <User size={16} /> Edit profile
                </button>
                <button type="button" className="btn-secondary" onClick={() => setActiveTab('settings')}>
                  <Settings size={16} /> Open settings
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="admin-settings-panel">
            <AmenityCatalogManager onSuccess={setStatusMessage} onError={(catalogError) => setErrorMessage(catalogError?.message || 'Unable to update amenities.')} />
            <div className="admin-settings-card">
              <div>
                <span className="admin-panel-kicker">Appearance</span>
                <h3>Workspace preferences</h3>
                <p>Use the existing theme toggle to switch the admin interface between light and dark mode.</p>
              </div>
              <button type="button" className="btn-secondary" onClick={onThemeToggle}>
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </button>
            </div>

            <div className="admin-settings-card">
              <div>
                <span className="admin-panel-kicker">Support</span>
                <h3>Need help?</h3>
                <p>Open your mail client with the existing support address for admin-side questions.</p>
              </div>
              <button type="button" className="btn-secondary" onClick={handleSupport}>
                Contact support
              </button>
            </div>
          </section>
        )}
      </section>

      {showProfileModal && user && (
        <EditProfileModal
          user={user}
          title="Edit Admin Profile"
          successMessage="Admin profile updated successfully!"
          onClose={() => setShowProfileModal(false)}
        />
      )}
      <InAppDocumentViewer document={previewModal} onClose={() => setPreviewModal(null)} />
      <DeletePropertyModal
        property={propertyPendingDeletion}
        deleting={deletingProperty}
        error={deletePropertyError}
        onCancel={() => {
          if (!deletingProperty) {
            setPropertyPendingDeletion(null);
            setDeletePropertyError('');
          }
        }}
        onConfirm={handleDeleteProperty}
      />
      <PropertyRejectionModal
        property={propertyPendingRejection}
        rejecting={Boolean(propertyPendingRejection && workingKey === `reject-project-${propertyPendingRejection.id}`)}
        error={propertyRejectionError}
        onCancel={() => { if (!workingKey.startsWith('reject-project-')) { setPropertyPendingRejection(null); setPropertyRejectionError(''); } }}
        onConfirm={(reason) => handleRejectProject(propertyPendingRejection.id, reason)}
      />
      <PropertyRejectionModal
        seller={sellerPendingRejection}
        rejecting={Boolean(sellerPendingRejection && workingKey === `reject-request-${sellerPendingRejection.id}`)}
        error={sellerRejectionError}
        onCancel={() => { if (!workingKey.startsWith('reject-request-')) { setSellerPendingRejection(null); setSellerRejectionError(''); } }}
        onConfirm={(reason) => handleRejectSellerRequest(sellerPendingRejection, reason)}
      />
    </div>
  );
}

export default AdminPanel;


