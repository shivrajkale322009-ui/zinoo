import React, { useEffect, useMemo, useRef, useState } from 'react';
import { signOut } from 'firebase/auth';
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
  Search,
  Filter,
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
  X
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
import { auth, db, functions } from '../firebaseConfig';
import { isApprovedSellerAccount, normalizePermissions } from '../utils/permissions';
import { isProjectPublishable, PROPERTY_STATUS, PROPERTY_STATUSES } from '../utils/projectVisibility';
import { getLandZoneLabel, getNaStatusLabel, LAND_ZONE_OPTIONS, NA_STATUS_OPTIONS } from '../utils/projectLand';
import { getProjectDocumentLabel, normalizeProjectDocuments } from '../utils/projectDocuments';
import { validateProperty, validatePropertyLocation } from '../utils/adminPropertyUtils';
import ProjectLocationPicker from './ProjectLocationPicker';
import PropertyMediaDocumentsManager, { InAppDocumentViewer } from './PropertyMediaDocumentsManager';
import AdminPropertyDetails from './AdminPropertyDetails';
import useMediaQuery from '../utils/useMediaQuery';
import CashbackWorkspace from './CashbackWorkspace';
import FeedBannerManager from './FeedBannerManager';
import PropertyDisplayEditor from './PropertyDisplayEditor';
import { withPropertyDisplayModel } from '../utils/propertyDisplayModel';

const getName = (account) => account?.displayName || account?.name || account?.businessName || account?.userName || account?.email || 'Unknown';

const getProjectOwnerName = (project, sellers) => {
  const owner = sellers.find((item) => item.id === project.ownerId);
  return owner ? getName(owner) : (project.developer || 'Unknown seller');
};

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
  initialTab = 'home'
}) {
  const isAndroidLayout = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sellerRequests, setSellerRequests] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
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
  const [editingProperty, setEditingProperty] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({ legal: true, amenities: true, media: true, siteVisit: true });

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

  // File input refs (for programmatic click)
  const coverFileInputRef = useRef(null);
  const layoutFileInputRef = useRef(null);
  const zoneCertFileInputRef = useRef(null);
  const brochureFileInputRef = useRef(null);

  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setActiveTab(initialTab === 'seller_selection' ? 'sellers' : initialTab);
  }, [initialTab]);

  useEffect(() => {
    const path = 'sellerRequests';
    const filters = 'unfiltered';
    console.info('[Druvio Firestore] Admin listener starting', { path, filters, uid: auth.currentUser?.uid });
    onListenerDebug?.(path, { status: 'connecting', path, filters });
    const unsubscribe = onSnapshot(
      collection(db, 'sellerRequests'),
      (snapshot) => {
        const lastSnapshotTime = new Date().toISOString();
        console.info('[Druvio Firestore] Admin snapshot received', { path, filters, documentCount: snapshot.size, lastSnapshotTime });
        const requests = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        setSellerRequests(requests);
        onListenerDebug?.(path, { status: 'connected', path, filters, documentCount: snapshot.size, lastSnapshotTime });
      },
      (error) => {
        const detail = { code: error?.code || 'unknown', message: error?.message || String(error) };
        console.error('[Druvio Firestore] Admin listener failed', { path, filters, uid: auth.currentUser?.uid, ...detail, error });
        onListenerDebug?.(path, { status: 'error', path, filters, error: detail });
        setErrorMessage(`Firestore ${path} sync failed [${detail.code}]: ${detail.message}`);
      }
    );
    return () => unsubscribe();
  }, [onListenerDebug]);

  useEffect(() => {
    const path = 'users';
    const filters = 'unfiltered (Admin Buyer Accounts)';
    console.info('[Druvio Firestore] Admin listener starting', { path, filters, uid: auth.currentUser?.uid });
    onListenerDebug?.(path, { status: 'connecting', path, filters });
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const lastSnapshotTime = new Date().toISOString();
        console.info('[Druvio Firestore] Admin snapshot received', { path, filters, documentCount: snapshot.size, lastSnapshotTime });
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
        setBuyers(buyerList);
        onListenerDebug?.(path, { status: 'connected', path, filters, documentCount: snapshot.size, lastSnapshotTime });
      },
      (error) => {
        const detail = { code: error?.code || 'unknown', message: error?.message || String(error) };
        console.error('[Druvio Firestore] Admin listener failed', { path, filters, uid: auth.currentUser?.uid, ...detail, error });
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
      const createdTime = p.createdAt ? new Date(p.createdAt).getTime() : 0;
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
        const createdTime = p.createdAt ? new Date(p.createdAt).getTime() : 0;
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
      if (sortField === 'updatedAt') {
        valA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        valB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
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
    const displayReadyData = withPropertyDisplayModel(updatedData);
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
    const original = projects.find(p => p.id === displayReadyData.id) || {};

    if (original.name !== updatedData.name) changes.push(`Name changed: "${original.name || ''}" -> "${updatedData.name || ''}"`);
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
      console.info('[Druvio Admin Save] Started', {
        projectId: updatedData.id,
        sellerChanged: originalSellerId !== nextSellerId,
        coordinates: {
          latitude: updatedData.latitude,
          longitude: updatedData.longitude
        }
      });
      if (originalSellerId !== nextSellerId) {
        const assignmentResult = await httpsCallable(functions, 'assignProjectSeller')({ projectId: updatedData.id, sellerId: nextSellerId });
        console.info('[Druvio Admin Save] Seller assignment completed', assignmentResult.data);
      }
      await updateProject(updatedRecord);
      console.info('[Druvio Admin Save] Project update completed', { projectId: updatedData.id });
      setStatusMessage("Property details updated and revalidated successfully.");
      setIsDirty(false);
      setEditingProperty(null);
    } catch (err) {
      console.error('[Druvio Admin Save] Failed', {
        projectId: updatedData.id,
        code: err?.code,
        message: err?.message
      });
      setErrorMessage("Failed to save property changes: " + err.message);
    }
  };

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
    () => sellerRequests.filter((request) => request.status === 'pending').length,
    [sellerRequests]
  );
  const sortedBuyers = useMemo(
    () => [...buyers].sort((left, right) => getName(left).localeCompare(getName(right))),
    [buyers]
  );
  const sortedSellers = useMemo(
    () => [...sellers].sort((left, right) => getName(left).localeCompare(getName(right))),
    [sellers]
  );
  const pendingRequests = useMemo(
    () => sellerRequests
      .filter((request) => request.status === 'pending')
      .sort((left, right) => getName(left).localeCompare(getName(right))),
    [sellerRequests]
  );

  const resetFeedback = () => {
    setStatusMessage('');
    setErrorMessage('');
  };

  const handleApproveSellerRequest = async (request) => {
    const actionKey = `approve-request-${request.id}`;
    setWorkingKey(actionKey);
    resetFeedback();

    try {
      await httpsCallable(functions, 'reviewSellerRequest')({
        requestId: request.id,
        decision: 'approved'
      });

      setStatusMessage(`${getName(request)} has been approved as a seller.`);
    } catch (error) {
      console.error('Failed to approve seller request:', error);
      setErrorMessage(error?.message || 'Unable to approve the seller request right now.');
    } finally {
      setWorkingKey('');
    }
  };

  const handleRejectSellerRequest = async (request) => {
    const actionKey = `reject-request-${request.id}`;
    setWorkingKey(actionKey);
    resetFeedback();

    try {
      await httpsCallable(functions, 'reviewSellerRequest')({
        requestId: request.id,
        decision: 'rejected'
      });

      setStatusMessage(`${getName(request)} has been marked as rejected.`);
    } catch (error) {
      console.error('Failed to reject seller request:', error);
      setErrorMessage(error?.message || 'Unable to reject the seller request right now.');
    } finally {
      setWorkingKey('');
    }
  };

  const handleApproveProject = async (project) => {
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

  const handleListingStatus = async (projectId, status) => {
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

  const handleRejectProject = async (projectId) => {
    const actionKey = `reject-project-${projectId}`;
    setWorkingKey(actionKey);
    resetFeedback();

    try {
      await httpsCallable(functions, 'reviewProject')({
        projectId,
        decision: PROPERTY_STATUS.REJECTED
      });
      setStatusMessage('Property listing rejected successfully.');
    } catch (error) {
      console.error('Failed to reject property:', error);
      setErrorMessage('Unable to reject this property right now.');
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
            <button type="button" onClick={() => setPreviewModal(document)} aria-label={`Preview ${getProjectDocumentLabel(document.type)}`}><Eye size={14} /></button>
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
    setIsDirty(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closePropertyDetails = () => {
    setViewingProperty(null);
    setActiveTab(propertyDetailsOrigin);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      setErrorMessage('Unable to log out right now.');
    }
  };

  const handleSupport = () => {
    window.open('mailto:support@druvio.com?subject=Admin Support Request', '_blank');
  };

  const sidebarGroups = [
    {
      label: 'Main',
      items: [
        { key: 'home', label: 'Dashboard', icon: LayoutDashboard, count: null },
        { key: 'properties', label: 'Properties', icon: Building, count: propertiesMetrics.withErrors > 0 ? propertiesMetrics.withErrors : null },
        { key: 'buyers', label: 'Buyers', icon: Users, count: buyers.length },
        { key: 'sellers', label: 'Sellers', icon: Store, count: sellers.length },
        { key: 'requests', label: 'Seller Requests', icon: ClipboardList, count: pendingSellerRequests },
        { key: 'listings', label: 'Property Reviews', icon: Building, count: pendingProjects.length },
        { key: 'cashbacks', label: 'Cashback Management', icon: IndianRupee, count: cashbacks.filter(item => item.status === 'Pending Admin Review').length }
      ]
    },
    {
      label: 'Content Management',
      items: [
        { key: 'feed', label: 'Feed', icon: Images, count: null }
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

    setActiveTab(key);
  };

  const dashboardRequestsPreview = pendingRequests.slice(0, 4);
  const dashboardListingPreview = pendingProjects.slice(0, 4);
  const profileName = user?.displayName || user?.phoneNumber || user?.email || 'Admin User';
  const profileEmail = user?.email || user?.phoneNumber || 'No contact info';

  const viewMeta = {
    home: {
      title: 'Dashboard',
    },
    properties: {
      title: 'Properties',
    },
    buyers: {
      title: 'Buyer Accounts',
    },
    sellers: {
      title: 'Seller Accounts',

    },
    requests: {
      title: 'Seller Requests',

    },
    listings: {
      title: 'Property Review Queue',

    },
    cashbacks: {
      title: 'Cashback Management',

    },
    feed: {
      title: 'Feed',
      description: 'Manage the promotional banners shown on Buyer Home.'
    },
    profile: {
      title: 'Profile',
    },
    settings: {
      title: 'Settings',
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
        <header className="admin-mobile-top-app-bar m3-mobile-top-app-bar">
          <button type="button" className="m3-icon-button" onClick={() => setMobileDrawerOpen(true)} aria-label="Open admin navigation">
            <Menu size={24} />
          </button>
          <div><span>Admin</span><strong>{currentMeta.title}</strong></div>
          <button type="button" className="m3-icon-button" onClick={() => setShowProfileModal(true)} aria-label="Open profile">
            <User size={24} />
          </button>
        </header>
      )}
      {isAndroidLayout && mobileDrawerOpen && (
        <div className="admin-mobile-drawer-scrim" role="presentation" onClick={() => setMobileDrawerOpen(false)}>
          <aside className="admin-mobile-drawer" role="dialog" aria-modal="true" aria-label="Admin navigation" onClick={(event) => event.stopPropagation()}>
            <div className="admin-mobile-drawer-head">
              <div><span>Druvio</span><strong>Admin workspace</strong></div>
              <button type="button" className="m3-icon-button" onClick={() => setMobileDrawerOpen(false)} aria-label="Close navigation"><X size={24} /></button>
            </div>
            <nav>
              {sidebarGroups.flatMap((group) => group.items).map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.key} type="button" className={activeTab === item.key ? 'active' : ''} onClick={() => selectAdminDestination(item.key)}>
                    <Icon size={22} /><span>{item.label}</span>
                    {typeof item.count === 'number' && <b>{item.count}</b>}
                  </button>
                );
              })}
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

      <section className="admin-content">
        <div className="admin-content-header">
          <div>
            <h2>{currentMeta.title}</h2>
            <p>{currentMeta.description}</p>
          </div>
        </div>

        {statusMessage && <div className="app-success" role="status">{statusMessage}</div>}
        {errorMessage && <div className="app-error" role="alert">{errorMessage}</div>}

        {activeTab === 'cashbacks' && <CashbackWorkspace role="admin" cashbacks={cashbacks} />}
        {activeTab === 'feed' && <FeedBannerManager user={user} onSuccess={setStatusMessage} onError={setErrorMessage} />}

        {activeTab === 'home' && (
          <div className="admin-panel-stack">
            <div className="admin-metric-grid">
              <article className="admin-metric-card">
                <span>Active sellers</span>
                <strong>{sellers.length}</strong>
              </article>
              <article className="admin-metric-card">
                <span>Buyer accounts</span>
                <strong>{buyers.length}</strong>
              </article>
              <article className="admin-metric-card">
                <span>Approved properties</span>
                <strong>{activeProjectList.length}</strong>
              </article>
              <article className="admin-metric-card">
                <span>Pending requests</span>
                <strong>{pendingSellerRequests}</strong>
              </article>
              <article className="admin-metric-card">
                <span>Pending listings</span>
                <strong>{pendingProjects.length}</strong>
              </article>
            </div>

            <div className="admin-dashboard-grid">
              <section className="admin-panel-section">
                <div className="admin-panel-section-head">
                  <div>
                    <span className="admin-panel-kicker">Approval Queue</span>
                    <h3>Seller requests</h3>
                  </div>
                  <button type="button" className="btn-secondary" onClick={() => setActiveTab('requests')}>
                    Open queue
                  </button>
                </div>

                {dashboardRequestsPreview.length === 0 ? (
                  <div className="admin-empty-state">No pending seller requests right now.</div>
                ) : (
                  <div className="admin-list-preview">
                    {dashboardRequestsPreview.map((request) => (
                      <div key={request.id} className="admin-list-preview-row">
                        <div>
                          <strong>{getName(request)}</strong>
                          <span>{request.businessName || 'Business not provided'}</span>
                        </div>
                        <button type="button" className="btn-secondary seller-inline-button" onClick={() => setActiveTab('requests')}>
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="admin-panel-section">
                <div className="admin-panel-section-head">
                  <div>
                    <span className="admin-panel-kicker">Property Queue</span>
                    <h3>Listings under review</h3>
                  </div>
                  <button type="button" className="btn-secondary" onClick={() => setActiveTab('listings')}>
                    Open reviews
                  </button>
                </div>

                {dashboardListingPreview.length === 0 ? (
                  <div className="admin-empty-state">No property listings are waiting for approval.</div>
                ) : (
                  <div className="admin-list-preview">
                    {dashboardListingPreview.map((project) => (
                      <div key={project.id} className="admin-list-preview-row">
                        <div>
                          <strong>{project.name}</strong>
                          <span>{getProjectOwnerName(project, sellers)}</span>
                        </div>
                        <button type="button" className="btn-secondary seller-inline-button" onClick={() => setActiveTab('listings')}>
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {viewingProperty && activeTab !== 'properties' && (
          <AdminPropertyDetails
            property={viewingProperty}
            seller={sellers.find((item) => item.id === (viewingProperty.sellerId || viewingProperty.sellerUid || viewingProperty.ownerId))}
            onBack={closePropertyDetails}
            onOpenEditor={openMasterPropertyEditor}
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
                    <button type="button" className="btn-primary" onClick={() => { setEditingProperty(viewingProperty); setViewingProperty(null); }}>
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
                      <p><strong>Total Plots:</strong> {viewingProperty.totalPlots || 'N/A'} (Available: {viewingProperty.availablePlots || viewingProperty.remainingPlots || 'N/A'})</p>
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
            {editingProperty && (() => {
              // Calculate dynamic validations
              const val = validateProperty(editingProperty);
              const completion = (() => {
                let fields = ['name', 'startingPrice', 'landZone', 'naStatus', 'latitude', 'longitude', 'completeAddress', 'totalPlots'];
                let filled = fields.filter(f => {
                  const v = editingProperty[f] ?? (f === 'startingPrice' ? editingProperty.priceFrom : null);
                  return v !== undefined && v !== null && String(v).trim() !== '' && v !== 0;
                });
                return Math.round((filled.length / fields.length) * 100);
              })();

              // Check section validity for collapsible sections
              const isLegalCollapsed = collapsedSections.legal && !val.errors.some(e => e.type === 'missing_legal_information');
              const isAmenitiesCollapsed = collapsedSections.amenities && !val.errors.some(e => e.type === 'incomplete_contact');
              const isMediaCollapsed = collapsedSections.media && !val.errors.some(e => e.type === 'missing_cover_image' || e.type === 'media_error');
              const isSiteVisitCollapsed = collapsedSections.siteVisit && !val.errors.some(e => e.type === 'incomplete_contact');

              const triggerScrollTo = (selector) => {
                const el = document.querySelector(selector);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                  // If it's collapsed, expand it
                  if (selector.includes('legal')) setCollapsedSections(prev => ({ ...prev, legal: false }));
                  if (selector.includes('amenities')) setCollapsedSections(prev => ({ ...prev, amenities: false }));
                  if (selector.includes('media')) setCollapsedSections(prev => ({ ...prev, media: false }));
                  if (selector.includes('sitevisit')) setCollapsedSections(prev => ({ ...prev, siteVisit: false }));
                }
              };

              // Maps a section ID to its relevant validation error types.
              // Returns true if the section has no errors, false if it has at least one.
              const isSectionValid = (sectionId) => {
                const sectionErrorTypes = {
                  basic: ['missing_name', 'invalid_property_status'],
                  pricing: ['missing_price'],
                  location: ['exact_location_missing', 'invalid_coordinates', 'marker_not_confirmed'],
                  legal: ['missing_legal_information'],
                  amenities: [],
                  media: ['missing_cover_image', 'media_error'],
                  siteVisit: ['incomplete_contact'],
                  contact: ['incomplete_contact'],
                };
                const relevantTypes = sectionErrorTypes[sectionId] || [];
                if (relevantTypes.length === 0) return true;
                return !val.errors.some(e => relevantTypes.includes(e.type));
              };

              return (
                <div className="admin-property-edit-workspace">
                  {/* Sticky Header */}
                  <header className="property-edit-header">
                    <div className="header-left">
                      <button type="button" className="back-to-properties-btn" onClick={() => {
                        if (isDirty && !window.confirm("You have unsaved changes. Leaving this page will discard your recent edits. Are you sure you want to leave?")) return;
                        setEditingProperty(null);
                        setIsDirty(false);
                      }}>
                        &larr; Properties
                      </button>
                      <div className="title-area">
                        <h1>Edit Property</h1>
                        <span className="project-sub-meta">
                          <strong>{editingProperty.name || 'Unnamed Property'}</strong> &middot; ID: {editingProperty.projectId || editingProperty.id || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="header-badges">
                      <span className={`badge-status badge-status-${String(editingProperty.status || 'draft').toLowerCase()}`}>
                        {editingProperty.status || 'Draft'}
                      </span>
                      <span className={`badge-location location-status-${val.locationStatus}`}>
                        {val.locationStatus === 'verified' ? 'Location Verified' : 'Location Missing'}
                      </span>
                      <span className="badge-completion">
                        {completion}% Complete
                      </span>
                    </div>
                  </header>

                  <div className="property-edit-body-content">
                    {/* Completion and Error Summary Card */}
                    <div className="completion-error-summary-card">
                      <div className="summary-radial-info">
                        <h3>Property Completion: {completion}%</h3>
                        <div className="summary-meters-row">
                          <span className="summary-badge-indicator">
                            <strong>{val.errors.length}</strong> Error(s)
                          </span>
                          <span className="summary-badge-indicator warning">
                            <strong>{completion < 80 ? 1 : 0}</strong> Warning(s)
                          </span>
                        </div>
                      </div>
                      {val.errors.length > 0 && (
                        <div className="required-attention-issues">
                          <h4>Required Attention:</h4>
                          <ul>
                            {val.errors.map(err => {
                              let targetSelector = '.form-section-basic';
                              if (err.type.includes('location') || err.type.includes('coordinates') || err.type.includes('marker')) {
                                targetSelector = '.form-section-location';
                              } else if (err.type.includes('price')) {
                                targetSelector = '.form-section-pricing';
                              } else if (err.type.includes('cover') || err.type.includes('media')) {
                                targetSelector = '.form-section-media';
                              } else if (err.type.includes('legal')) {
                                targetSelector = '.form-section-legal';
                              }
                              return (
                                <li key={err.id} className={`severity-${err.severity}`}>
                                  <span>&bull; {err.description}</span>
                                  <button type="button" className="jump-to-fix-btn" onClick={() => triggerScrollTo(targetSelector)}>
                                    Fix Issue &rarr;
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSaveProperty(editingProperty); }} className="admin-redesigned-form-body">
                      <PropertyDisplayEditor
                        property={editingProperty}
                        onChange={(nextProperty) => {
                          setEditingProperty(nextProperty);
                          setIsDirty(true);
                        }}
                      />
                      {/* Basic Info Section */}
                      <section className="form-section form-section-basic">
                        <h2 className="section-title">Basic Information</h2>
                        <p className="section-description">Core details regarding the plotting property name, developer, and overall status.</p>

                        <div className="form-grid-3">
                          <label className="admin-field">
                            <span className="form-label">Property Name *</span>
                            <input type="text" className="form-control" required value={editingProperty.name || ''} onChange={e => { setEditingProperty({ ...editingProperty, name: e.target.value }); setIsDirty(true); }} />
                          </label>
                          <label className="admin-field">
                            <span className="form-label">Project ID *</span>
                            <input type="text" className="form-control" required value={editingProperty.projectId || editingProperty.id || ''} onChange={e => { setEditingProperty({ ...editingProperty, projectId: e.target.value }); setIsDirty(true); }} />
                          </label>
                          <label className="admin-field">
                            <span className="form-label">Listing Status</span>
                            <select className="form-control" value={editingProperty.status || PROPERTY_STATUS.DRAFT} disabled title="Use the review and listing actions to change status.">
                              {PROPERTY_STATUSES.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
                            </select>
                          </label>

                          <label className="admin-field">
                            <span className="form-label">Seller Association</span>
                            <select className="form-control" value={editingProperty.sellerId || editingProperty.sellerUid || editingProperty.ownerId || ''} onChange={(event) => { const sellerId = event.target.value; setEditingProperty({ ...editingProperty, sellerId, sellerUid: sellerId, ownerId: sellerId }); setIsDirty(true); }}>
                              <option value="">Select a valid seller</option>
                              {sortedSellers.map((seller) => <option key={seller.id} value={seller.id}>{getName(seller)}</option>)}
                            </select>
                          </label>

                          <label className="admin-field">
                            <span className="form-label">Developer or Seller Name</span>
                            <input type="text" className="form-control" value={editingProperty.developerName || editingProperty.developer || ''} onChange={e => { setEditingProperty({ ...editingProperty, developerName: e.target.value, developer: e.target.value }); setIsDirty(true); }} />
                          </label>
                          <label className="admin-field">
                            <span className="form-label">Contact Number</span>
                            <input type="text" className="form-control" value={editingProperty.contactNumber || ''} onChange={e => { setEditingProperty({ ...editingProperty, contactNumber: e.target.value }); setIsDirty(true); }} />
                          </label>
                          <label className="admin-field">
                            <span className="form-label">Land Zone</span>
                            <select className="form-control" value={editingProperty.landZone || ''} onChange={e => { setEditingProperty({ ...editingProperty, landZone: e.target.value }); setIsDirty(true); }}>
                              <option value="">Select Land Zone</option>
                              {LAND_ZONE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          </label>
                        </div>

                        <div className="form-grid-1" style={{ marginTop: '20px' }}>
                          <label className="admin-field">
                            <span className="form-label">Detailed Description</span>
                            <textarea className="form-control" rows={4} value={editingProperty.description || ''} onChange={e => { setEditingProperty({ ...editingProperty, description: e.target.value }); setIsDirty(true); }} />
                          </label>
                        </div>
                      </section>

                      {/* Location & Map Section */}
                      <section className="form-section form-section-location">
                        <h2 className="section-title">Location & Exact Map Position</h2>
                        <p className="section-description">Provide localized structural address points and verify the exact satellites coordinates.</p>

                        <div className="form-grid-3">
                          <label className="admin-field">
                            <span className="form-label">State</span>
                            <input type="text" className="form-control" value={editingProperty.state || ''} onChange={e => { setEditingProperty({ ...editingProperty, state: e.target.value }); setIsDirty(true); }} />
                          </label>
                          <label className="admin-field">
                            <span className="form-label">District</span>
                            <input type="text" className="form-control" value={editingProperty.district || ''} onChange={e => { setEditingProperty({ ...editingProperty, district: e.target.value }); setIsDirty(true); }} />
                          </label>
                          <label className="admin-field">
                            <span className="form-label">City</span>
                            <input type="text" className="form-control" value={editingProperty.city || ''} onChange={e => { setEditingProperty({ ...editingProperty, city: e.target.value }); setIsDirty(true); }} />
                          </label>

                          <label className="admin-field">
                            <span className="form-label">Area</span>
                            <input type="text" className="form-control" value={editingProperty.area || ''} onChange={e => { setEditingProperty({ ...editingProperty, area: e.target.value }); setIsDirty(true); }} />
                          </label>
                          <label className="admin-field">
                            <span className="form-label">Locality</span>
                            <input type="text" className="form-control" value={editingProperty.locality || ''} onChange={e => { setEditingProperty({ ...editingProperty, locality: e.target.value }); setIsDirty(true); }} />
                          </label>
                          <label className="admin-field">
                            <span className="form-label">Landmark</span>
                            <input type="text" className="form-control" value={editingProperty.landmark || ''} onChange={e => { setEditingProperty({ ...editingProperty, landmark: e.target.value }); setIsDirty(true); }} />
                          </label>
                        </div>

                        <div className="form-grid-2-1" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '20px' }}>
                          <label className="admin-field">
                            <span className="form-label">Complete Address</span>
                            <input type="text" className="form-control" value={editingProperty.completeAddress || ''} onChange={e => { setEditingProperty({ ...editingProperty, completeAddress: e.target.value }); setIsDirty(true); }} />
                          </label>
                          <label className="admin-field">
                            <span className="form-label">Postal Code</span>
                            <input type="text" className="form-control" value={editingProperty.postalCode || ''} onChange={e => { setEditingProperty({ ...editingProperty, postalCode: e.target.value }); setIsDirty(true); }} />
                          </label>
                        </div>

                        <div className="coordinates-confirm-box" style={{ marginTop: '24px' }}>
                          <h3>Map Coordinates Validation</h3>

                          {/* Exact Map Location Alert Banner */}
                          {val.locationStatus !== 'verified' ? (
                            <div className="exact-location-alert red-banner">
                              <AlertCircle size={20} />
                              <div>
                                <h4>Exact location required</h4>
                                <p>This property does not have a confirmed exact map marker. Place the marker at the project entrance and confirm the location.</p>
                              </div>
                            </div>
                          ) : (
                            <div className="exact-location-alert green-banner">
                              <CheckCircle size={20} />
                              <div>
                                <h4>Exact location confirmed</h4>
                                <p>Latitude: {editingProperty.latitude} &middot; Longitude: {editingProperty.longitude}</p>
                              </div>
                            </div>
                          )}

                          <div className="form-grid-3" style={{ margin: '16px 0' }}>
                            <label className="admin-field">
                              <span className="form-label">Latitude</span>
                              <input type="number" step="0.000001" className="form-control" value={editingProperty.latitude || ''} onChange={e => { setEditingProperty({ ...editingProperty, latitude: parseFloat(e.target.value) || 0 }); setIsDirty(true); }} />
                            </label>
                            <label className="admin-field">
                              <span className="form-label">Longitude</span>
                              <input type="number" step="0.000001" className="form-control" value={editingProperty.longitude || ''} onChange={e => { setEditingProperty({ ...editingProperty, longitude: parseFloat(e.target.value) || 0 }); setIsDirty(true); }} />
                            </label>
                            <label className="checkbox-field-wrapper" style={{ alignSelf: 'end', height: '44px' }}>
                              <input type="checkbox" checked={editingProperty.mapMarkerConfirmed || false} onChange={e => { setEditingProperty({ ...editingProperty, mapMarkerConfirmed: e.target.checked }); setIsDirty(true); }} />
                              <span>Confirm Exact Marker Location</span>
                            </label>
                          </div>

                          <div className="map-picker-container-admin" style={{ height: '420px', border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden' }}>
                            <ProjectLocationPicker
                              latitude={editingProperty.latitude}
                              longitude={editingProperty.longitude}
                              layoutPolygon={editingProperty.layoutPolygon}
                              onChange={({ latitude, longitude }) => {
                                setEditingProperty(curr => ({ ...curr, latitude, longitude, mapMarkerConfirmed: true }));
                                setIsDirty(true);
                              }}
                              onLayoutChange={(geometry) => {
                                setEditingProperty(curr => ({ ...curr, ...geometry }));
                                setIsDirty(true);
                              }}
                            />
                          </div>
                          <span className="field-help" style={{ marginTop: '8px', display: 'block' }}>
                            Place the marker at the exact project entrance and draw the project boundary where available.
                          </span>
                        </div>
                      </section>

                      {/* Plot & Inventory Section */}
                      <section className="form-section form-section-plots">
                        <h2 className="section-title">Plot & Inventory Details</h2>
                        <p className="section-description">Enter the dimension limits, units, plot numbers, and inventory totals.</p>

                        <div className="form-grid-3">
                          <label className="admin-field">
                            <span className="form-label">Total Number of Plots</span>
                            <input type="number" className="form-control" value={editingProperty.totalPlots || ''} onChange={e => { setEditingProperty({ ...editingProperty, totalPlots: parseInt(e.target.value) || 0 }); setIsDirty(true); }} />
                          </label>
                          <label className="admin-field">
                            <span className="form-label">Available Plots</span>
                            <input type="number" className="form-control" value={editingProperty.availablePlots || editingProperty.remainingPlots || ''} onChange={e => { setEditingProperty({ ...editingProperty, availablePlots: parseInt(e.target.value) || 0, remainingPlots: parseInt(e.target.value) || 0 }); setIsDirty(true); }} />
                          </label>
                          <label className="admin-field">
                            <span className="form-label">Development Stage</span>
                            <input type="text" className="form-control" placeholder="e.g. Under Construction" value={editingProperty.developmentStage || ''} onChange={e => { setEditingProperty({ ...editingProperty, developmentStage: e.target.value }); setIsDirty(true); }} />
                          </label>
                        </div>
                      </section>

                      {/* Pricing Section */}
                      <section className="form-section form-section-pricing">
                        <h2 className="section-title">Pricing & Financials</h2>
                        <p className="section-description">Specify project cost limitations, sq.ft. rates, and booking deposits.</p>

                        <div className="form-grid-3">
                          <label className="admin-field">
                            <span className="form-label">Starting Price *</span>
                            <div className="input-with-prefix">
                              <span className="prefix">₹</span>
                              <input type="number" className="form-control" required value={editingProperty.startingPrice || editingProperty.priceFrom || ''} onChange={e => { setEditingProperty({ ...editingProperty, startingPrice: parseFloat(e.target.value) || 0, priceFrom: parseFloat(e.target.value) || 0 }); setIsDirty(true); }} />
                            </div>
                          </label>
                          <label className="admin-field">
                            <span className="form-label">Price Per Sq. Ft.</span>
                            <div className="input-with-prefix">
                              <span className="prefix">₹</span>
                              <input type="number" className="form-control" value={editingProperty.pricePerSqFt || ''} onChange={e => { setEditingProperty({ ...editingProperty, pricePerSqFt: parseFloat(e.target.value) || 0 }); setIsDirty(true); }} />
                            </div>
                          </label>
                          <label className="admin-field">
                            <span className="form-label">Booking Amount</span>
                            <div className="input-with-prefix">
                              <span className="prefix">₹</span>
                              <input type="number" className="form-control" value={editingProperty.bookingAmount || ''} onChange={e => { setEditingProperty({ ...editingProperty, bookingAmount: parseFloat(e.target.value) || 0 }); setIsDirty(true); }} />
                            </div>
                          </label>
                          <label className="admin-field">
                            <span className="form-label">Cashback Amount Per Guntha</span>
                            <div className="input-with-prefix">
                              <span className="prefix">₹</span>
                              <input type="number" className="form-control" value={editingProperty.cashbackPerGuntha || editingProperty.cashbackAmount || ''} onChange={e => { setEditingProperty({ ...editingProperty, cashbackPerGuntha: parseFloat(e.target.value) || 0 }); setIsDirty(true); }} />
                            </div>
                          </label>
                        </div>
                      </section>

                      {/* Legal and Approvals - Collapsible */}
                      <section className={`form-section form-section-legal ${isLegalCollapsed ? 'collapsed' : ''}`}>
                        <div className="section-collapsible-header" onClick={() => setCollapsedSections(prev => ({ ...prev, legal: !prev.legal }))}>
                          <div>
                            <h2 className="section-title">
                              Legal & Approvals
                              {!isSectionValid('legal', editingProperty) && <span className="red-dot" title="Has unresolved errors">&bull;</span>}
                            </h2>
                            <p className="section-description">RERA registrations, local authority approvals, and structural notes.</p>
                          </div>
                          <span className="expand-indicator-chevron">{isLegalCollapsed ? 'Expand +' : 'Collapse -'}</span>
                        </div>

                        {!isLegalCollapsed && (
                          <div className="collapsible-content-body" style={{ marginTop: '20px' }}>
                            <div className="form-grid-3">
                              <label className="admin-field">
                                <span className="form-label">RERA Status</span>
                                <select className="form-control" value={editingProperty.reraStatus || ''} onChange={e => { setEditingProperty({ ...editingProperty, reraStatus: e.target.value }); setIsDirty(true); }}>
                                  <option value="">Select RERA Status</option>
                                  <option value="verified">Verified</option>
                                  <option value="pending">Pending</option>
                                  <option value="not_applicable">Not Applicable</option>
                                </select>
                              </label>
                              {editingProperty.reraStatus === 'verified' && (
                                <label className="admin-field">
                                  <span className="form-label">RERA Registration Number</span>
                                  <input type="text" className="form-control" value={editingProperty.reraNumber || ''} onChange={e => { setEditingProperty({ ...editingProperty, reraNumber: e.target.value }); setIsDirty(true); }} />
                                </label>
                              )}
                              <label className="admin-field">
                                <span className="form-label">NA Status</span>
                                <select className="form-control" value={editingProperty.naStatus || ''} onChange={e => { setEditingProperty({ ...editingProperty, naStatus: e.target.value }); setIsDirty(true); }}>
                                  <option value="">Select NA Status</option>
                                  {NA_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                              </label>

                              <label className="admin-field">
                                <span className="form-label">Title Status</span>
                                <input type="text" className="form-control" value={editingProperty.titleStatus || ''} onChange={e => { setEditingProperty({ ...editingProperty, titleStatus: e.target.value }); setIsDirty(true); }} />
                              </label>
                              <label className="admin-field">
                                <span className="form-label">PMRDA Approval Status</span>
                                <select className="form-control" value={editingProperty.pmrdaApproved ? 'yes' : 'no'} onChange={e => { setEditingProperty({ ...editingProperty, pmrdaApproved: e.target.value === 'yes' }); setIsDirty(true); }}>
                                  <option value="no">Not Confirmed</option>
                                  <option value="yes">Approved</option>
                                </select>
                              </label>
                              <label className="admin-field">
                                <span className="form-label">Collector Approval Status</span>
                                <select className="form-control" value={editingProperty.collectorApproved ? 'yes' : 'no'} onChange={e => { setEditingProperty({ ...editingProperty, collectorApproved: e.target.value === 'yes' }); setIsDirty(true); }}>
                                  <option value="no">Not Confirmed</option>
                                  <option value="yes">Approved</option>
                                </select>
                              </label>
                            </div>
                            <div className="form-grid-1" style={{ marginTop: '20px' }}>
                              <label className="admin-field">
                                <span className="form-label">Legal Notes</span>
                                <textarea className="form-control" rows={3} value={editingProperty.legalNotes || ''} onChange={e => { setEditingProperty({ ...editingProperty, legalNotes: e.target.value }); setIsDirty(true); }} />
                              </label>
                            </div>
                          </div>
                        )}
                      </section>

                      {/* Amenities - Collapsible */}
                      <section className={`form-section form-section-amenities ${isAmenitiesCollapsed ? 'collapsed' : ''}`}>
                        <div className="section-collapsible-header" onClick={() => setCollapsedSections(prev => ({ ...prev, amenities: !prev.amenities }))}>
                          <div>
                            <h2 className="section-title">Amenities & Infrastructure</h2>
                            <p className="section-description">Indicate what utilities and internal setups are live at the project.</p>
                          </div>
                          <span className="expand-indicator-chevron">{isAmenitiesCollapsed ? 'Expand +' : 'Collapse -'}</span>
                        </div>

                        {!isAmenitiesCollapsed && (
                          <div className="collapsible-content-body" style={{ marginTop: '20px' }}>
                            <div className="amenities-selection-cards-grid">
                              {[
                                { key: 'roadAccess', title: 'Road Access', desc: 'Internal concrete or asphalt road access' },
                                { key: 'electricity', title: 'Electricity', desc: 'Active high tension or standard electrical poles' },
                                { key: 'waterSupply', title: 'Water Supply', desc: 'Direct borewell or municipal drinking supply' },
                                { key: 'drainage', title: 'Drainage', desc: 'Stormwater channels and underground drainage lines' },
                                { key: 'streetLights', title: 'Street Lights', desc: 'Solar or LED electrical street illuminators' },
                                { key: 'compoundBoundary', title: 'Compound Boundary', desc: 'Precast or brick compound perimeter wall' }
                              ].map(amenity => (
                                <label key={amenity.key} className={`amenity-card-selector ${editingProperty[amenity.key] ? 'selected' : ''}`}>
                                  <input type="checkbox" checked={editingProperty[amenity.key] || false} onChange={e => { setEditingProperty({ ...editingProperty, [amenity.key]: e.target.checked }); setIsDirty(true); }} />
                                  <div className="card-selector-details">
                                    <strong>{amenity.title}</strong>
                                    <span>{amenity.desc}</span>
                                  </div>
                                </label>
                              ))}
                            </div>
                            <div className="form-grid-1" style={{ marginTop: '20px' }}>
                              <label className="admin-field">
                                <span className="form-label">Nearby Facilities & Details</span>
                                <input type="text" className="form-control" placeholder="e.g. School (2km), Hospital (5km)" value={editingProperty.nearbyFacilities || ''} onChange={e => { setEditingProperty({ ...editingProperty, nearbyFacilities: e.target.value }); setIsDirty(true); }} />
                              </label>
                            </div>
                          </div>
                        )}
                      </section>

                      {/* Media - Collapsible */}
                      <section className={`form-section form-section-media ${isMediaCollapsed ? 'collapsed' : ''}`}>
                        <div className="section-collapsible-header" onClick={() => setCollapsedSections(prev => ({ ...prev, media: !prev.media }))}>
                          <div>
                            <h2 className="section-title">Media & Documents</h2>
                            <p className="section-description">Cover image gallery, blueprint blueprints, brochures, and video promotions.</p>
                          </div>
                          <span className="expand-indicator-chevron">{isMediaCollapsed ? 'Expand +' : 'Collapse -'}</span>
                        </div>

                        {!isMediaCollapsed && (
                          <div className="collapsible-content-body" style={{ marginTop: '20px' }}>
                            <PropertyMediaDocumentsManager
                              property={editingProperty}
                              user={user}
                              onChange={(nextProperty) => {
                                setEditingProperty(nextProperty);
                                setIsDirty(true);
                              }}
                            />
                          </div>
                        )}
                      </section>

                      {/* Site Visit - Collapsible */}
                      <section className={`form-section form-section-sitevisit ${isSiteVisitCollapsed ? 'collapsed' : ''}`}>
                        <div className="section-collapsible-header" onClick={() => setCollapsedSections(prev => ({ ...prev, siteVisit: !prev.siteVisit }))}>
                          <div>
                            <h2 className="section-title">Site Visit Information</h2>
                            <p className="section-description">Site visit contact coordinators and availability details.</p>
                          </div>
                          <span className="expand-indicator-chevron">{isSiteVisitCollapsed ? 'Expand +' : 'Collapse -'}</span>
                        </div>

                        {!isSiteVisitCollapsed && (
                          <div className="collapsible-content-body" style={{ marginTop: '20px' }}>
                            <div className="form-grid-3">
                              <label className="checkbox-field-wrapper" style={{ height: '44px', display: 'flex', alignItems: 'center' }}>
                                <input type="checkbox" checked={editingProperty.siteVisitAvailable || false} onChange={e => { setEditingProperty({ ...editingProperty, siteVisitAvailable: e.target.checked }); setIsDirty(true); }} />
                                <span>Site Visit Available</span>
                              </label>
                              {editingProperty.siteVisitAvailable && (
                                <label className="admin-field">
                                  <span className="form-label">Site Visit Contact Phone</span>
                                  <input type="text" className="form-control" placeholder="Optional" value={editingProperty.siteVisitContactNumber || ''} onChange={e => { setEditingProperty({ ...editingProperty, siteVisitContactNumber: e.target.value }); setIsDirty(true); }} />
                                </label>
                              )}
                            </div>
                          </div>
                        )}
                      </section>

                      {/* Audit History & Systems - Collapsible */}
                      <section className={`form-section form-section-audit ${collapsedSections.audit ? 'collapsed' : ''}`}>
                        <div className="section-collapsible-header" onClick={() => setCollapsedSections(prev => ({ ...prev, audit: !prev.audit }))}>
                          <div>
                            <h2 className="section-title">Audit History & System Metadata</h2>
                            <p className="section-description">Timeline log of historical changes, errors captured, and detected dates.</p>
                          </div>
                          <span className="expand-indicator-chevron">{collapsedSections.audit ? 'Expand +' : 'Collapse -'}</span>
                        </div>

                        {!collapsedSections.audit && (
                          <div className="collapsible-content-body" style={{ marginTop: '20px' }}>
                            <div className="property-logs-section" style={{ gridTemplateColumns: '1fr', border: 'none', paddingTop: 0 }}>
                              <div className="logs-column">
                                <h3>Audit Logs</h3>
                                {editingProperty.auditLog?.length > 0 ? (
                                  <div className="audit-history-list">
                                    {editingProperty.auditLog.map(audit => (
                                      <div key={audit.id} className="audit-log-card" style={{ background: '#f8fafc' }}>
                                        <p>{audit.change}</p>
                                        <div className="audit-log-meta">
                                          <span>By: {audit.adminName}</span>
                                          <span>{new Date(audit.timestamp).toLocaleString()}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="no-logs">No change history recorded.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </section>
                    </form>
                  </div>

                  {/* Sticky Save Action Bar */}
                  <footer className="sticky-action-bar-bottom">
                    <div className="left-meta">
                      {isDirty ? (
                        <span className="unsaved-warning-span">
                          <AlertTriangle size={16} /> Unsaved changes pending
                        </span>
                      ) : (
                        <span className="saved-clean-span">All changes saved</span>
                      )}
                    </div>
                    <div className="right-buttons">
                      <button type="button" className="btn-secondary" onClick={() => {
                        if (isDirty && !window.confirm("You have unsaved changes. Leaving this page will discard your recent edits. Are you sure you want to leave?")) return;
                        setEditingProperty(null);
                        setIsDirty(false);
                      }}>
                        Cancel
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => {
                        const draftData = { ...editingProperty, status: 'draft' };
                        handleSaveProperty(draftData);
                      }}>
                        Save Draft
                      </button>
                      <button type="button" className="btn-primary" onClick={() => handleSaveProperty(editingProperty)}>
                        Save Changes
                      </button>
                    </div>
                  </footer>
                </div>
              );
            })()}

            {/* List Mode */}
            {!viewingProperty && !editingProperty && (
              <>
                {propertiesMetrics.sellerMissing > 0 && (
                  <div className="app-error" role="alert">Action required: Some properties are not associated with a valid seller.</div>
                )}
                {/* Metric Summary Cards */}
                <div className="admin-metric-grid admin-properties-metrics-grid">
                  <article className={`admin-metric-card ${propertiesFilterTab === 'all' ? 'active-metric' : ''}`} onClick={() => setPropertiesFilterTab('all')}>
                    <span>Total Properties</span>
                    <strong>{propertiesMetrics.total}</strong>
                  </article>
                  <article className={`admin-metric-card ${propertiesFilterTab === 'active' ? 'active-metric' : ''}`} onClick={() => setPropertiesFilterTab('active')}>
                    <span>Active Properties</span>
                    <strong>{propertiesMetrics.active}</strong>
                  </article>
                  <article className={`admin-metric-card ${propertiesFilterTab === 'draft' ? 'active-metric' : ''}`} onClick={() => setPropertiesFilterTab('draft')}>
                    <span>Draft Properties</span>
                    <strong>{propertiesMetrics.draft}</strong>
                  </article>
                  <article className={`admin-metric-card ${propertiesFilterTab === 'errors' ? 'active-metric' : ''}`} onClick={() => setPropertiesFilterTab('errors')}>
                    <span>Properties with Errors</span>
                    <strong className="text-error">{propertiesMetrics.withErrors}</strong>
                  </article>
                  <article className={`admin-metric-card ${propertiesFilterTab === 'missing_location' ? 'active-metric' : ''}`} onClick={() => setPropertiesFilterTab('missing_location')}>
                    <span>Missing Location</span>
                    <strong className="text-warning">{propertiesMetrics.missingLocation}</strong>
                  </article>
                  <article className={`admin-metric-card ${propertiesFilterTab === 'recent' ? 'active-metric' : ''}`} onClick={() => setPropertiesFilterTab('recent')}>
                    <span>Recently Added</span>
                    <strong>{propertiesMetrics.recentlyAdded}</strong>
                  </article>
                </div>

                {/* Filters and Search Workspace */}
                <div className="admin-properties-controls">
                  <div className="admin-search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search by property name, project ID, developer, city, locality, or landmark"
                      value={propertiesSearchQuery}
                      onChange={(e) => { setPropertiesSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                    {propertiesSearchQuery && (
                      <button type="button" className="clear-search-btn" onClick={() => setPropertiesSearchQuery('')}>
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Tab Filters */}
                  <div className="admin-filter-tabs">
                    {[
                      { key: 'all', label: 'All Properties' },
                      { key: PROPERTY_STATUS.ACTIVE, label: 'Active' },
                      { key: PROPERTY_STATUS.PENDING, label: 'Pending Review' },
                      { key: 'draft', label: 'Draft' },
                      { key: PROPERTY_STATUS.INACTIVE, label: 'Inactive' },
                      { key: 'errors', label: 'With Errors' },
                      { key: 'missing_location', label: 'Missing Location' },
                      { key: 'recent', label: 'Recently Added' }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        type="button"
                        className={`filter-tab-btn ${propertiesFilterTab === tab.key ? 'active' : ''}`}
                        onClick={() => { setPropertiesFilterTab(tab.key); setCurrentPage(1); }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Advanced Filters dropdowns */}
                  <div className="admin-advanced-filters-grid">
                    <label className="admin-field">
                      <span>City</span>
                      <select value={propertiesCityFilter} onChange={e => { setPropertiesCityFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="">All Cities</option>
                        {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>

                    <label className="admin-field">
                      <span>Locality</span>
                      <select value={propertiesLocalityFilter} onChange={e => { setPropertiesLocalityFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="">All Localities</option>
                        {uniqueLocalities.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </label>

                    <label className="admin-field">
                      <span>Developer</span>
                      <select value={propertiesDeveloperFilter} onChange={e => { setPropertiesDeveloperFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="">All Developers</option>
                        {uniqueDevelopers.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </label>

                    <label className="admin-field">
                      <span>Error Type</span>
                      <select value={propertiesErrorTypeFilter} onChange={e => { setPropertiesErrorTypeFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="">All Errors</option>
                        <option value="exact_location_missing">Exact Map Location Missing</option>
                        <option value="invalid_coordinates">Invalid Coordinates</option>
                        <option value="marker_not_confirmed">Marker Not Confirmed</option>
                        <option value="missing_name">Missing Name</option>
                        <option value="missing_price">Missing Price</option>
                        <option value="missing_cover_image">Missing Cover Image</option>
                        <option value="missing_legal_information">Missing Required Legal Information</option>
                        <option value="incomplete_contact">Incomplete Contact Info</option>
                      </select>
                    </label>

                    <label className="admin-field">
                      <span>Location Status</span>
                      <select value={propertiesLocationStatusFilter} onChange={e => { setPropertiesLocationStatusFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="">All Statuses</option>
                        <option value="verified">Verified</option>
                        <option value="missing">Location Missing</option>
                        <option value="invalid">Invalid Coordinates</option>
                        <option value="not_confirmed">Marker Not Confirmed</option>
                        <option value="needs_review">Needs Review</option>
                      </select>
                    </label>
                  </div>
                </div>

                {/* Table View */}
                <div className="table-container admin-properties-table-container">
                  {filteredProperties.length === 0 ? (
                    <div className="admin-empty-state-card">
                      <AlertCircle size={32} />
                      {propertiesSearchQuery || propertiesCityFilter || propertiesLocalityFilter || propertiesDeveloperFilter || propertiesErrorTypeFilter || propertiesLocationStatusFilter ? (
                        <>
                          <h4>No matching properties found</h4>
                          <p>No properties match your active filters or search terms.</p>
                          <button type="button" className="btn-secondary" onClick={() => {
                            setPropertiesSearchQuery('');
                            setPropertiesCityFilter('');
                            setPropertiesLocalityFilter('');
                            setPropertiesDeveloperFilter('');
                            setPropertiesErrorTypeFilter('');
                            setPropertiesLocationStatusFilter('');
                            setPropertiesFilterTab('all');
                          }}>
                            Clear Filters
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
                      <table className="dash-table admin-properties-table">
                        <thead>
                          <tr>
                            <th>Cover</th>
                            <th onClick={() => { setSortField('name'); setSortDirection(curr => curr === 'asc' ? 'desc' : 'asc'); }}>Property Name & ID</th>
                            <th>Location</th>
                            <th>Developer</th>
                            <th>Status</th>
                            <th>Map Location Status</th>
                            <th>Error Status</th>
                            <th onClick={() => { setSortField('updatedAt'); setSortDirection(curr => curr === 'asc' ? 'desc' : 'asc'); }}>Last Updated</th>
                            <th>Admin Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedProperties.map((property) => {
                            const mainImg = property.thumbnail || property.heroImage || property.coverImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=120&q=80';
                            return (
                              <tr key={property.id} className={property.hasErrors ? 'row-has-errors' : ''}>
                                <td>
                                  <img src={mainImg} alt="" className="table-row-thumbnail" />
                                </td>
                                <td>
                                  <strong className="primary-property-name">{property.name || 'Untitled Project'}</strong>
                                  <div className="secondary-project-id">ID: {property.projectId || property.id || 'N/A'}</div>
                                  {!property.sellerAssociationValid && <><span className="badge badge-danger">Seller Missing</span><div className="text-error">Seller association missing. This property cannot be approved.</div></>}
                                </td>
                                <td>
                                  {[property.village, property.area, property.city].filter(Boolean).join(', ') || 'N/A'}
                                </td>
                                <td>{property.developerName || property.developer || 'N/A'}</td>
                                <td>
                                  <span className={`badge badge-status-${String(property.status || 'draft').toLowerCase()}`}>
                                    {property.status || 'Draft'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge location-status-${property.locationStatus || 'missing'}`}>
                                    {property.locationStatus === 'verified' ? 'Verified' :
                                      property.locationStatus === 'missing' ? 'Location Missing' :
                                        property.locationStatus === 'invalid' ? 'Invalid Coordinates' :
                                          property.locationStatus === 'not_confirmed' ? 'Marker Not Confirmed' :
                                            'Needs Review'}
                                  </span>
                                </td>
                                <td>
                                  {property.hasErrors ? (
                                    <span className="badge badge-danger badge-error-info">
                                      <AlertTriangle size={12} /> {property.errors?.length || 1} Error(s)
                                    </span>
                                  ) : (
                                    <span className="badge badge-success">
                                      <CheckCircle size={12} /> Healthy
                                    </span>
                                  )}
                                  {property.status === PROPERTY_STATUS.ACTIVE && property.locationStatus !== 'verified' && (
                                    <div className="text-warning">Active property is missing valid map coordinates and will not appear on the buyer map.</div>
                                  )}
                                </td>
                                <td>
                                  {property.updatedAt ? new Date(property.updatedAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td>
                                  <div className="table-actions-cell">
                                    <button type="button" className="btn-table-action" onClick={() => openPropertyDetails(property, 'properties')}>
                                      View
                                    </button>
                                    <button type="button" className="btn-table-action action-edit-btn" onClick={() => setEditingProperty(property)}>
                                      {property.sellerAssociationValid ? 'Edit' : 'Assign Seller'}
                                    </button>
                                    {property.status === PROPERTY_STATUS.PENDING && (
                                      <button type="button" className="btn-table-action" disabled={!property.sellerAssociationValid || workingKey === `approve-project-${property.id}`} onClick={() => handleApproveProject(property)}>
                                        Approve
                                      </button>
                                    )}
                                    {[PROPERTY_STATUS.APPROVED, PROPERTY_STATUS.INACTIVE].includes(property.status) && (
                                      <button type="button" className="btn-table-action" onClick={() => handleListingStatus(property.id, PROPERTY_STATUS.ACTIVE)}>Activate</button>
                                    )}
                                    {property.status === PROPERTY_STATUS.ACTIVE && (
                                      <button type="button" className="btn-table-action" onClick={() => handleListingStatus(property.id, PROPERTY_STATUS.INACTIVE)}>Deactivate</button>
                                    )}
                                    {[PROPERTY_STATUS.APPROVED, PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.INACTIVE].includes(property.status) && (
                                      <button type="button" className="btn-table-action" onClick={() => handleListingStatus(property.id, PROPERTY_STATUS.SOLD)}>Mark Sold</button>
                                    )}
                                    <button type="button" className="btn-table-action" onClick={() => {
                                      if (property.latitude && property.longitude) {
                                        window.open(`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`, '_blank');
                                      } else {
                                        alert('No valid map coordinates saved for this property.');
                                      }
                                    }}>
                                      Map
                                    </button>
                                    {property.locationStatus !== 'verified' && (
                                      <button type="button" className="btn-table-action action-fix-btn" onClick={() => {
                                        setEditingProperty(property);
                                        setTimeout(() => {
                                          const el = document.querySelector('.form-category-location');
                                          el?.scrollIntoView({ behavior: 'smooth' });
                                        }, 150);
                                      }}>
                                        Fix Location
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

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
              </>
            )}
          </div>
        )}

        {activeTab === 'buyers' && (
          <div className="admin-panel-section">
            {false && selectedBuyerProfile ? (() => {
              const interestedIds = new Set(leads.filter((lead) => lead.createdBy === selectedBuyerProfile.id).map((lead) => lead.projectId).filter(Boolean));
              const interestedProperties = projects.filter((property) => interestedIds.has(property.id));
              return (
                <div className="admin-account-profile">
                  <div className="admin-section-header">
                    <button type="button" className="btn-secondary" onClick={() => setSelectedBuyerProfile(null)}><ArrowLeft size={16} /> Back to Buyers</button>
                  </div>
                  <div className="admin-account-profile-header">
                    <span className="admin-account-avatar">{getName(selectedBuyerProfile).charAt(0).toUpperCase()}</span>
                    <div><span className="admin-panel-kicker">Buyer Profile</span><h2>{getName(selectedBuyerProfile)}</h2><p>{selectedBuyerProfile.email || 'No email'} · {selectedBuyerProfile.phoneNumber || selectedBuyerProfile.phone || 'No phone'}</p></div>
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
            })() : <div className="table-container">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    {false && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {sortedBuyers.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No buyer-only accounts found.</td>
                    </tr>
                  ) : (
                    sortedBuyers.map((buyer) => (
                      <tr key={buyer.id}>
                        <td><strong>{getName(buyer)}</strong></td>
                        <td>{buyer.email || 'N/A'}</td>
                        <td>{buyer.phoneNumber || buyer.phone || 'N/A'}</td>
                        <td><span className="badge badge-info">Buyer</span></td>
                        {false && <td><button type="button" className="btn-secondary seller-inline-button" onClick={() => setSelectedBuyerProfile(buyer)}><Eye size={14} /> View Profile</button></td>}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>}
          </div>
        )}

        {activeTab === 'sellers' && (
          <div className="admin-panel-section">
            {false && selectedSellerProfile ? (() => {
              const sellerProperties = projects.filter((property) => (property.ownerId || property.sellerUid || property.sellerId) === selectedSellerProfile.id);
              return (
                <div className="admin-account-profile">
                  <div className="admin-section-header">
                    <button type="button" className="btn-secondary" onClick={() => setSelectedSellerProfile(null)}><ArrowLeft size={16} /> Back to Sellers</button>
                  </div>
                  <div className="admin-account-profile-header">
                    <span className="admin-account-avatar">{getName(selectedSellerProfile).charAt(0).toUpperCase()}</span>
                    <div><span className="admin-panel-kicker">Seller Profile</span><h2>{getName(selectedSellerProfile)}</h2><p>{selectedSellerProfile.businessName || 'Independent seller'} · {selectedSellerProfile.email || 'No email'} · {selectedSellerProfile.phoneNumber || selectedSellerProfile.phone || 'No phone'}</p></div>
                  </div>
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
            })() : <div className="table-container">
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
                  {sortedSellers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No approved sellers found.</td>
                    </tr>
                  ) : (
                    sortedSellers.map((seller) => {
                      const sellerProjects = projects.filter((project) => project.ownerId === seller.id);
                      return (
                        <tr key={seller.id}>
                          <td><strong>{seller.displayName || seller.name || seller.businessName || 'Unknown'}</strong></td>
                          <td>{seller.email || 'N/A'}</td>
                          <td>{seller.phoneNumber || seller.phone || 'N/A'}</td>
                          <td>{seller.businessName || 'N/A'}</td>
                          <td>{sellerProjects.length}</td>
                          <td>
                            <span className="badge badge-success">Active</span>
                          </td>
                          <td>
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
            <div className="table-container">
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
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn-primary seller-inline-button"
                              disabled={workingKey === `approve-request-${request.id}`}
                              onClick={() => handleApproveSellerRequest(request)}
                            >
                              <ShieldCheck size={14} /> Approve
                            </button>
                            <button
                              type="button"
                              className="btn-secondary seller-inline-button"
                              disabled={workingKey === `reject-request-${request.id}`}
                              onClick={() => handleRejectSellerRequest(request)}
                            >
                              <ShieldX size={14} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="admin-panel-stack">
            <div className="admin-panel-section">
              <div className="table-container">
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
                                  <ShieldCheck size={14} /> Approve
                                </button>
                                <button
                                  type="button"
                                  className="btn-secondary seller-inline-button"
                                  disabled={workingKey === `reject-project-${project.id}`}
                                  onClick={() => handleRejectProject(project.id)}
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
              </div>
            </div>
            <div className="admin-panel-section">
              <div className="admin-panel-section-head">
                <div>
                  <span className="admin-panel-kicker">Active</span>
                  <h3>Active projects</h3>
                </div>
                <span>{activeProjectList.length}</span>
              </div>
              <div className="table-container">
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
              </div>
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
    </div>
  );
}

export default AdminPanel;
