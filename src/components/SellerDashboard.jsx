import React, { useEffect, useMemo, useState } from 'react';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  BarChart3,
  Building,
  Calendar,
  Check,
  ChevronRight,
  ClipboardList,
  Edit,
  Eye,
  IndianRupee,
  Images,
  ListPlus,
  LoaderCircle,
  MapPin,
  MessageSquareMore,
  MoreHorizontal,
  MoreVertical,
  PhoneCall,
  Plus,
  Search,
  Settings,
  Sparkles,
  ShieldCheck,
  ShieldX,
  Heart,
  User,
  X
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db, functions, storage } from '../firebaseConfig';
import { logoutUser } from '../services/authSessionService';
import { CHAKAN_LOCATION } from '../utils/chakanLocation';
import EditProfileModal from './EditProfileModal';
import { PROJECT_DOCUMENT_OPTIONS, getProjectDocumentLabel } from '../utils/projectDocuments';
import { getCashbackPerGuntha, withCanonicalPlotArea } from '../utils/projectArea';
import { getProjectApprovalStatus, PROPERTY_STATUS } from '../utils/projectVisibility';
import useMediaQuery from '../utils/useMediaQuery';
import CashbackWorkspace from './CashbackWorkspace';
import PropertyDisplayEditor from './PropertyDisplayEditor';
import PropertyRejectionModal from './PropertyRejectionModal';
import UserAvatar from './UserAvatar';
import { normalizeStringList } from '../utils/stringList';
import SellerProfileHub, { SellerSettingsPage } from './SellerProfileHub';
import SellerDeveloperProfile from './SellerDeveloperProfile';
import SellerHeader from './SellerHeader';
import NotificationCenter from './NotificationCenter';
import { withPropertyDisplayModel } from '../utils/propertyDisplayModel';
import {
  getLandZoneLabel,
  getNaStatusLabel,
  withCanonicalLandFields
} from '../utils/projectLand';

const createProjectDraft = (developer) => ({
  name: '',
  developer: developer || '',
  availabilityStatus: 'coming_soon',
  village: '',
  locality: '',
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
  installmentPurchaseAvailable: false,
  landZone: 'residential',
  naStatus: 'na_approved',
  verified: true,
  amenities: [],
  amenityIds: [],
  nearbyCategories: [],
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
  galleryImages: [],
  videos: [],
  thumbnailPath: '',
  thumbnailMetadata: null,
  documents: [],
  highwayName: '',
  highwayDistance: null,
  isHighwayTouch: false,
  lastCalculatedAt: null
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

const withSellerPreviewFields = (project) => {
  const latitude = toNumber(project.latitude ?? project.coords?.[0], CHAKAN_LOCATION.latitude);
  const longitude = toNumber(project.longitude ?? project.coords?.[1], CHAKAN_LOCATION.longitude);
  const cashbackAmount = Math.max(0, toNumber(project.cashbackPerGuntha ?? project.cashbackAmount));
  const contactNumber = project.contactNumber || project.whatsappNumber || project.siteVisitContact || '';
  const locationLabel = project.locationLabel || [project.village, project.taluka, project.locality || project.area].filter(Boolean).join(' • ');

  return {
    ...project,
    display: {
      ...(project.display || {}),
      basic: {
        ...(project.display?.basic || {}),
        projectName: project.name || '',
        shortDescription: project.description || '',
        location: locationLabel,
        village: project.village || '',
        taluka: project.taluka || '',
        district: project.district || ''
      },
      pricing: { ...(project.display?.pricing || {}), startingPrice: toNumber(project.startingPrice) },
      media: { ...(project.display?.media || {}), heroImage: project.thumbnail || project.heroImage || '' },
      cashback: {
        ...(project.display?.cashback || {}),
        enabled: cashbackAmount > 0,
        amount: cashbackAmount,
        showOnDetails: cashbackAmount > 0
      },
      overview: { ...(project.display?.overview || {}), body: project.description || '' },
      map: {
        ...(project.display?.map || {}),
        enabled: Boolean(project.googleMapsLink || (latitude && longitude)),
        latitude,
        longitude,
        address: project.completeAddress || locationLabel,
        googleMapsLink: project.googleMapsLink || '',
        directionsLink: project.directionsLink || project.googleMapsLink || ''
      },
      actions: { ...(project.display?.actions || {}), callNumber: contactNumber }
    }
  };
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
  if (status === PROPERTY_STATUS.ACTIVE || status === PROPERTY_STATUS.APPROVED) return 'badge-success';
  if (status === PROPERTY_STATUS.REJECTED || status === PROPERTY_STATUS.SOLD) return 'badge-danger';
  return 'badge-warning';
};

const formatProjectStatus = (project) => {
  const status = getProjectApprovalStatus(project);
  const labels = {
    [PROPERTY_STATUS.DRAFT]: 'Draft',
    [PROPERTY_STATUS.PENDING]: 'Pending Review',
    [PROPERTY_STATUS.APPROVED]: 'Approved',
    [PROPERTY_STATUS.ACTIVE]: 'Active',
    [PROPERTY_STATUS.INACTIVE]: 'Inactive',
    [PROPERTY_STATUS.SOLD]: 'Sold',
    [PROPERTY_STATUS.REJECTED]: 'Rejected'
  };
  return labels[status] || 'Draft';
};

function SellerDashboard({
  projects,
  leads,
  visits,
  cashbacks = [],
  notifications = [],
  user,
  updateProject,
  addProject,
  isAdminView = false,
  selectedSeller = null,
  initialTab = selectedSeller?.initialSellerTab || 'projects',
  onBackToAdmin,
  onSelectedSellerChange,
  onCustomerSupport,
  isDarkMode,
  onThemeToggle,
  permissions,
  currentView,
  onViewChange,
  onAccountDeleted
}) {
  const isAndroidLayout = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState(() => initialTab === 'listings' || initialTab === 'dashboard' ? 'projects' : initialTab);
  const [editingProject, setEditingProject] = useState(null);
  const [propertyEditorDirty, setPropertyEditorDirty] = useState(false);
  useEffect(() => {
    if (!propertyEditorDirty) return undefined;
    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [propertyEditorDirty]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSellerProfileEditor, setShowSellerProfileEditor] = useState(false);
  const [mobileProfileScreen, setMobileProfileScreen] = useState(null);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentError, setDocumentError] = useState('');
  const [mediaUploading, setMediaUploading] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [projectSubmitError, setProjectSubmitError] = useState('');
  const [projectActionsProject, setProjectActionsProject] = useState(null);
  const [listingActionKey, setListingActionKey] = useState('');
  const [propertyPendingRejection, setPropertyPendingRejection] = useState(null);
  const [propertyRejectionError, setPropertyRejectionError] = useState('');
  const [rejectingProperty, setRejectingProperty] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');
  const [amenityOptions, setAmenityOptions] = useState([]);

  useEffect(() => onSnapshot(
    query(collection(db, 'amenityCatalog'), where('isActive', '==', true)),
    (snapshot) => setAmenityOptions(snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((left, right) => String(left.name).localeCompare(String(right.name)))),
    (catalogError) => console.error('[Zinoo Amenities] Unable to load the seller amenity catalog.', catalogError)
  ), []);

  const developerName = selectedSeller?.businessName || selectedSeller?.displayName || user?.businessName || user?.displayName || projects[0]?.developer || '';
  const [newProject, setNewProject] = useState(() => createProjectDraft(developerName));
  const [documentDraft, setDocumentDraft] = useState({ type: PROJECT_DOCUMENT_OPTIONS[0].value, name: '', file: null, previewUrl: '' });

  const updateEditorProperty = (updater) => {
    if (editingProject) setEditingProject(updater);
    else setNewProject(updater);
  };

  const myProjects = useMemo(() => projects, [projects]);
  const sellerNotifications = useMemo(() => {
    const recipientId = user?.uid;
    const missingInformation = myProjects.flatMap((project) => {
      const projectId = project.id || project.name || 'listing';
      const projectName = project.name || 'Listing';
      const alerts = [];
      if (!(project.thumbnail || project.heroImage)) alerts.push({ id: `missing-image-${projectId}`, recipientId, title: `${projectName} needs images`, message: 'Add a cover image to improve buyer trust and listing visibility.', transient: true, read: false, createdAt: project.updatedAt || project.createdAt });
      if (!Array.isArray(project.documents) || !project.documents.length) alerts.push({ id: `missing-documents-${projectId}`, recipientId, title: `${projectName} needs verification`, message: 'Upload the required documents before publishing this listing.', transient: true, read: false, createdAt: project.updatedAt || project.createdAt });
      if (!(project.village || project.area || project.locality)) alerts.push({ id: `missing-location-${projectId}`, recipientId, title: `${projectName} needs a location`, message: 'Add the property location so buyers can find this listing.', transient: true, read: false, createdAt: project.updatedAt || project.createdAt });
      if (toNumber(project.startingPrice) <= 0) alerts.push({ id: `missing-price-${projectId}`, recipientId, title: `${projectName} needs pricing`, message: 'Add a valid starting price before submitting this listing.', transient: true, read: false, createdAt: project.updatedAt || project.createdAt });
      if (getProjectApprovalStatus(project) === PROPERTY_STATUS.REJECTED) alerts.push({ id: `listing-rejected-${projectId}`, recipientId, title: `${projectName} requires changes`, message: project.rejectionReason || project.reviewNote || 'Review the listing feedback and correct the highlighted information.', transient: true, read: false, createdAt: project.updatedAt || project.createdAt });
      return alerts;
    });
    return [...missingInformation, ...notifications];
  }, [myProjects, notifications, user?.uid]);
  const mobileProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();
    return myProjects.filter((project) => {
      const status = getProjectApprovalStatus(project);
      const matchesStatus = projectStatusFilter === 'all' || status === projectStatusFilter;
      const location = [project.village, project.locality, project.area].filter(Boolean).join(' ');
      const matchesSearch = !query || `${project.name || ''} ${location}`.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [myProjects, projectSearch, projectStatusFilter]);
  const myLeads = useMemo(() => leads, [leads]);
  const myVisits = useMemo(() => visits, [visits]);

  const totalLeads = myLeads.length;
  const pendingVisits = myVisits.filter((visit) => visit.status === 'Scheduled').length;
  const pendingReviewCount = myProjects.filter((project) => project.status === PROPERTY_STATUS.PENDING).length;
  const pendingCashbacks = cashbacks.filter((item) => item.status === 'Pending Seller Approval').length;
  const activeListings = myProjects.filter((project) => getProjectApprovalStatus(project) === PROPERTY_STATUS.ACTIVE).length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayLeads = myLeads.filter((lead) => {
    const rawDate = lead.createdAt?.toDate?.() || lead.createdAt || lead.date;
    const date = rawDate ? new Date(rawDate) : null;
    return date && !Number.isNaN(date.valueOf()) && date >= todayStart;
  }).length;
  const sevenDaySparkline = (records) => {
    const counts = Array(7).fill(0);
    records.forEach((record) => {
      const rawDate = record.createdAt?.toDate?.() || record.createdAt || record.updatedAt?.toDate?.() || record.updatedAt || record.date;
      const date = rawDate ? new Date(rawDate) : null;
      if (!date || Number.isNaN(date.valueOf())) return;
      const daysAgo = Math.floor((todayStart - new Date(date.getFullYear(), date.getMonth(), date.getDate())) / 86400000);
      if (daysAgo >= 0 && daysAgo < 7) counts[6 - daysAgo] += 1;
    });
    const peak = Math.max(...counts, 1);
    return counts.map((count, index) => `${2 + index * 11.3},${21 - (count / peak) * 17}`).join(' ');
  };
  const sellerName = (selectedSeller || user)?.displayName?.split(' ')[0] || '';
  const sellerProfile = selectedSeller || user;
  const estimatedRevenue = myProjects.reduce((sum, project) => {
    const sold = Math.max(0, toNumber(project.totalPlots) - toNumber(project.remainingPlots));
    return sum + sold * toNumber(project.startingPrice);
  }, 0);
  const formatCompactCurrency = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1).replace('.0', '')} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1).replace('.0', '')} L`;
    return `₹${new Intl.NumberFormat('en-IN').format(value)}`;
  };

  const showToast = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  const handleEditClick = (project) => {
    setEditingProject(withCanonicalPlotArea(withCanonicalLandFields(project)));
    setPropertyEditorDirty(false);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setProjectSubmitError('');
    try {
      const previewSynchronizedProject = withSellerPreviewFields(editingProject);
      const updatedProject = withPropertyDisplayModel(withCanonicalPlotArea(withCanonicalLandFields({
      ...previewSynchronizedProject,
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
      status: isAdminView ? editingProject.status : PROPERTY_STATUS.PENDING
      })), { authoritativeName: editingProject.name, previousName: editingProject.display?.basic?.projectName });
      await updateProject(updatedProject);
      setPropertyEditorDirty(false);
      setEditingProject(updatedProject);
      showToast();
      return true;
    } catch (error) {
      console.error('Project update failed:', error);
      setProjectSubmitError(error?.message || 'Unable to save this project. Your changes are still available.');
      return false;
    }
  };

  const handleApproveProject = async (projectId) => {
    const actionKey = `approve-${projectId}`;
    setListingActionKey(actionKey);
    try {
      await httpsCallable(functions, 'reviewProject')({ projectId, decision: PROPERTY_STATUS.APPROVED });
      alert('Property approved. Activate it separately when it is ready for buyers.');
      showToast();
    } catch (error) {
      console.error('Failed to approve project:', error);
      alert(error?.message || 'This property cannot be approved right now.');
    } finally {
      setListingActionKey('');
    }
  };

  const handleListingStatus = async (projectId, status) => {
    const actionKey = `${status}-${projectId}`;
    setListingActionKey(actionKey);
    try {
      await httpsCallable(functions, 'setProjectStatus')({ projectId, status });
      showToast();
    } catch (error) {
      console.error('Failed to update listing status:', error);
      alert(error?.message || 'This listing status cannot be changed right now.');
    } finally {
      setListingActionKey('');
    }
  };

  const handleRejectProject = async (projectId, reason) => {
    setRejectingProperty(true);
    setPropertyRejectionError('');
    try {
      await httpsCallable(functions, 'reviewProject')({ projectId, decision: PROPERTY_STATUS.REJECTED, reason });
      setPropertyPendingRejection(null);
      showToast();
    } catch (error) {
      console.error('Failed to reject project:', error);
      setPropertyRejectionError(error?.message || 'This project cannot be rejected right now.');
    } finally {
      setRejectingProperty(false);
    }
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
      updateEditorProperty((current) => ({
        ...current,
        documents: [...(Array.isArray(current.documents) ? current.documents : []), {
          id: documentId,
          type: documentType,
          url,
          path: snapshot.ref.fullPath,
          fileName: file.name,
          displayName: documentDraft.name?.trim() || file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '),
          contentType,
          size: file.size,
          status: 'pending',
          uploadedAt: new Date().toISOString(),
          uploadedBy: uploaderId,
          previewUrl: contentType.startsWith('image/') ? URL.createObjectURL(file) : ''
        }]
      }));
      setDocumentDraft({ type: PROJECT_DOCUMENT_OPTIONS[0].value, name: '', file: null, previewUrl: '' });
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
    const isVideo = field === 'video';
    const allowedTypes = isVideo ? ['video/mp4', 'video/webm'] : ['image/jpeg', 'image/png', 'image/webp'];
    const maximumSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maximumSize || !allowedTypes.includes(file.type)) {
      setMediaError(isVideo ? 'Project videos must be MP4 or WebM and 50 MB or smaller.' : 'Project images must be JPG, PNG, or WebP and 10 MB or smaller.');
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
      const mediaItem = {
        id: assetId,
        downloadURL: url,
        storagePath: snapshot.ref.fullPath,
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.uid
      };
      updateEditorProperty((current) => field === 'gallery' ? {
        ...current,
        galleryImages: [...(Array.isArray(current.galleryImages) ? current.galleryImages : []), mediaItem]
      } : field === 'video' ? {
        ...current,
        videos: [...(Array.isArray(current.videos) ? current.videos : []), mediaItem]
      } : {
        ...current,
        thumbnail: url,
        heroImage: url,
        thumbnailPath: snapshot.ref.fullPath,
        heroImagePath: snapshot.ref.fullPath,
        heroImageMetadata: {
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user.uid
        },
        display: {
          ...(current.display || {}),
          media: {
            ...(current.display?.media || {}),
            heroImage: url
          }
        }
      });
    } catch (error) {
      console.error('Project image upload failed:', error);
      setMediaError('Unable to upload this project image. Please try again.');
    } finally {
      setMediaUploading('');
    }
  };

  const removeDraftDocument = async (document, index) => {
    updateEditorProperty((current) => ({ ...current, documents: (Array.isArray(current.documents) ? current.documents : []).filter((_, itemIndex) => itemIndex !== index) }));
    if (document.path) await deleteObject(ref(storage, document.path)).catch(() => undefined);
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    setProjectSubmitError('');

    try {
    const createdProject = withPropertyDisplayModel({
      name: newProject.name.trim(),
      developer: newProject.developer,
      availabilityStatus: newProject.availabilityStatus,
      village: newProject.village.trim(),
      locality: newProject.locality.trim(),
      area: newProject.locality.trim(),
      latitude: toNumber(newProject.latitude, CHAKAN_LOCATION.latitude),
      longitude: toNumber(newProject.longitude, CHAKAN_LOCATION.longitude),
      coords: [toNumber(newProject.latitude, CHAKAN_LOCATION.latitude), toNumber(newProject.longitude, CHAKAN_LOCATION.longitude)],
      location: { lat: toNumber(newProject.latitude, CHAKAN_LOCATION.latitude), lng: toNumber(newProject.longitude, CHAKAN_LOCATION.longitude) },
      layoutPolygon: newProject.layoutPolygon || null,
      layoutCenter: newProject.layoutCenter || null,
      layoutBounds: newProject.layoutBounds || null,
      layoutAreaSqFt: newProject.layoutAreaSqFt || null,
      startingPrice: toNumber(newProject.startingPrice),
      remainingPlots: toNumber(newProject.remainingPlots),
      totalPlots: toNumber(newProject.totalPlots),
      sizeMin: toNumber(newProject.sizeMin),
      sizeMax: toNumber(newProject.sizeMax),
      plotAreaMinSqFt: toNumber(newProject.sizeMin),
      plotAreaMaxSqFt: toNumber(newProject.sizeMax),
      bankLoan: newProject.bankLoan,
      installmentPurchaseAvailable: newProject.installmentPurchaseAvailable,
      landZone: newProject.landZone,
      naStatus: newProject.naStatus,
      naPlot: newProject.naStatus === 'na_approved',
      verified: newProject.verified,
      amenityIds: newProject.amenityIds,
      amenities: normalizeStringList(newProject.amenities),
      nearbyCategories: normalizeStringList(newProject.nearbyCategories),
      status: PROPERTY_STATUS.PENDING,
      thumbnail: newProject.thumbnail || newProject.heroImage,
      heroImage: newProject.heroImage,
      description: newProject.description,
      cashbackPerGuntha: Math.max(0, toNumber(newProject.cashbackAmount)),
      cashbackAmount: Math.max(0, toNumber(newProject.cashbackAmount)),
      contactNumber: newProject.contactNumber,
      whatsappNumber: newProject.contactNumber,
      siteVisitContact: newProject.contactNumber,
      heroImagePath: newProject.heroImagePath,
      heroImageMetadata: newProject.heroImageMetadata,
      thumbnailPath: newProject.thumbnailPath,
      thumbnailMetadata: newProject.thumbnailMetadata,
      galleryImages: newProject.galleryImages,
      videos: newProject.videos,
      documents: newProject.documents,
    });

      await addProject(createdProject);
      setPropertyEditorDirty(false);
      setNewProject(createProjectDraft(developerName));
      setDocumentDraft({ type: PROJECT_DOCUMENT_OPTIONS[0].value, name: '', file: null, previewUrl: '' });
      setActiveTab('projects');
      showToast();
    } catch (error) {
      console.error('Project creation failed:', error);
      setProjectSubmitError(error?.message || 'Unable to create this project.');
    }
  };

  const onboardingItems = [
    'Add your first project with location and price.',
    'Upload clear layout plan and hero image for better trust.',
    'Keep pricing and approval status updated as soon as the listing goes live.'
  ];

  const selectTab = (tab) => {
    if (propertyEditorDirty) {
      setSubmitError('Save or discard your changes before leaving the property editor.');
      return;
    }
    setActiveTab(tab);
    setEditingProject(null);
    setMobileProfileScreen(null);
  };
  return (
    <div className="seller-dashboard seller-workspace">
      {!isAndroidLayout && <aside className="seller-desktop-sidebar" aria-label="Seller workspace navigation">
        <div className="seller-os-brand"><span><img src="/brand/zinoo-logo.png" alt="" /></span><div><strong>Zinoo</strong><small>Seller OS</small></div></div>
        <p className="seller-sidebar-eyebrow">Workspace</p>
        <nav className="seller-sidebar-nav">
          <button type="button" className={`seller-sidebar-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => selectTab('projects')}>
            <Building size={17} /> Projects
          </button>
          <button type="button" className={`seller-sidebar-link ${activeTab === 'add' ? 'active' : ''}`} onClick={() => selectTab('add')}>
            <ListPlus size={17} /> Create listing
          </button>
          <button type="button" className={`seller-sidebar-link ${activeTab === 'cashbacks' ? 'active' : ''}`} onClick={() => selectTab('cashbacks')}>
            <IndianRupee size={17} /> Cashback requests <span>{cashbacks.filter(item => item.status === 'Pending Seller Approval').length}</span>
          </button>
          {!isAdminView && <button type="button" className={`seller-sidebar-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => selectTab('profile')}>
            <User size={17} /> Profile
          </button>}
        </nav>
        <div className="seller-sidebar-profile">
          <UserAvatar profile={sellerProfile} fallbackLabel="Seller" className="seller-sidebar-profile-avatar" useSellerDefault />
          <div><strong>{developerName}</strong><small>Verified seller</small></div>
          <MoreHorizontal size={17} />
        </div>
      </aside>}
      <main className="seller-workspace-main">
        {isAndroidLayout && <SellerHeader notifications={sellerNotifications} user={user} showAdminControl={isAdminView && Boolean(selectedSeller)} onBackToAdmin={onBackToAdmin} onOpenBuyer={() => onViewChange?.('buyer')} />}
        {!isAndroidLayout && <header className="seller-desktop-topbar">
          {isAdminView && selectedSeller && <button type="button" className="seller-header-admin-control" onClick={onBackToAdmin} aria-label="Exit seller mode and return to admin" title="Return to admin"><ShieldCheck size={21} /></button>}
          {!isAndroidLayout && <div className="seller-topbar-actions">
            {activeTab === 'projects' && <button type="button" className="seller-dashboard-quick-create" onClick={() => selectTab('add')}><Plus size={17} /> Create listing</button>}
            <NotificationCenter notifications={sellerNotifications} userId={user?.uid} />
          </div>}
        </header>}
      {saveSuccess && (
        <div className="seller-toast">
          <Check size={18} />
          <span>Seller dashboard updated successfully.</span>
        </div>
      )}

      {editingProject ? (
        <PropertyDisplayEditor
          role={isAdminView ? 'admin' : 'seller'} user={user} mode="edit" property={editingProject} amenityOptions={amenityOptions}
          onChange={(nextProject) => { setEditingProject(nextProject); setPropertyEditorDirty(true); }} onSubmit={handleEditSave}
          onCancel={() => { setEditingProject(null); setPropertyEditorDirty(false); }} onReset={() => setEditingProject(withCanonicalPlotArea(withCanonicalLandFields(editingProject)))}
          mediaUploading={mediaUploading} mediaError={mediaError} onMediaUpload={handleMediaUpload} documentUploading={documentUploading} documentError={documentError} onDocumentUpload={handleDocumentUpload} onRemoveDocument={removeDraftDocument} autoDetectHighway={isAdminView} isDirty={propertyEditorDirty} onDirtyChange={setPropertyEditorDirty} submitError={projectSubmitError}
        />
      )
      : activeTab === 'cashbacks' ? (
        <CashbackWorkspace role="seller" cashbacks={cashbacks} />
          ) : activeTab === 'projects' && isAndroidLayout ? (
        <section className="seller-mobile-projects-page" aria-label="Projects">
          <label className="seller-mobile-project-search">
            <Search size={19} aria-hidden="true" />
            <input type="search" value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder="Search projects..." aria-label="Search projects" />
          </label>
          <div className="seller-mobile-project-tabs" role="tablist" aria-label="Project status">
            {[
              ['all', 'All Projects'],
              [PROPERTY_STATUS.ACTIVE, 'Active'],
              [PROPERTY_STATUS.PENDING, 'Pending']
            ].map(([value, label]) => <button type="button" key={value} role="tab" aria-selected={projectStatusFilter === value} className={projectStatusFilter === value ? 'active' : ''} onClick={() => setProjectStatusFilter(value)}>{label}</button>)}
          </div>
          <div className="seller-mobile-project-simple-list">
            {mobileProjects.map((project) => {
              const status = getProjectApprovalStatus(project);
              const location = [project.village, project.area || project.locality].filter(Boolean).join(', ') || 'Location pending';
              return <button type="button" key={project.id || project.name} className="seller-mobile-project-simple-row" onClick={() => handleEditClick(project)}>
                <span className="seller-mobile-project-simple-icon"><Building size={21} /></span>
                <span className="seller-mobile-project-simple-location"><MapPin size={14} /> {location}</span>
                <span className="seller-mobile-project-simple-meta">
                  <strong className={status === PROPERTY_STATUS.ACTIVE ? 'active' : 'pending'}>{formatProjectStatus(project)}</strong>
                </span>
                <ChevronRight className="seller-mobile-project-simple-chevron" size={19} />
              </button>;
            })}
            {!mobileProjects.length && <p className="seller-mobile-projects-empty">No projects found.</p>}
          </div>
        </section>
          ) : activeTab === 'projects' ? (
        <div className="seller-os-dashboard">
          <section className="seller-business-snapshot">
            <div className="seller-snapshot-heading"><div><span>Business snapshot</span><h2>Your business at a glance</h2></div><small>Updated today</small></div>
            <div className="seller-snapshot-stats">
              {(isAndroidLayout ? [
                ['Projects', myProjects.length || '—', myProjects.length ? 'Active projects' : 'No active projects'],
                ['Total revenue', estimatedRevenue ? formatCompactCurrency(estimatedRevenue) : '—', 'All time'],
                ['Active listings', activeListings || '—', 'Visible to buyers'],
                ['Pending requests', (pendingCashbacks + pendingVisits) || '—', `${pendingVisits} upcoming visits`]
              ] : [
                ['Projects', myProjects.length, `${pendingReviewCount} pending review`, sevenDaySparkline(myProjects)],
                ['Active listings', activeListings, `${myProjects.length ? Math.round((activeListings / myProjects.length) * 100) : 0}% of portfolio`, sevenDaySparkline(myProjects.filter((project) => getProjectApprovalStatus(project) === PROPERTY_STATUS.ACTIVE))],
                ["Today's leads", todayLeads, `${totalLeads} total leads`, sevenDaySparkline(myLeads)],
                ['Cashback requests', pendingCashbacks, 'Awaiting action', sevenDaySparkline(cashbacks)]
              ]).map(([label, value, note, sparkline]) => <article key={label}>
                <span>{label}</span><strong>{value}</strong><small>{note}</small>{!isAndroidLayout && <svg className="seller-kpi-sparkline" viewBox="0 0 72 24" aria-hidden="true"><polyline points={sparkline} /></svg>}
              </article>)}
            </div>
          </section>

          <div className="seller-dashboard-grid">
            <section className="seller-projects-workspace">
              <div className="seller-os-section-heading"><div><span>Projects</span><h2>Recent projects</h2></div><button type="button" onClick={() => selectTab('add')}><Plus size={16} /> New project</button></div>

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
              <p>Create your first listing so buyers can view pricing and layout details.</p>
              <div className="seller-empty-list">
                {onboardingItems.map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>
          ) : (
            <><div className="seller-project-table-header" aria-hidden="true"><span>Project</span><span>Progress</span><span>Starting price</span><span>Views</span><span>Health</span><span>Status</span><span>Updated</span><span>Actions</span></div><div className="seller-project-list">
              {myProjects.map((project) => isAndroidLayout ? (
                <article key={project.id} className="seller-mobile-project-card">
                  <div className="seller-mobile-project-media">
                    {(project.thumbnail || project.heroImage) ? <img src={project.thumbnail || project.heroImage} alt="" /> : <div className="seller-mobile-project-media-empty"><Building size={28} /><span>No project image</span></div>}
                    <span className={`badge ${getProjectBadgeClass(project)}`}>{formatProjectStatus(project)}</span>
                    <button type="button" className="seller-mobile-project-favourite" aria-label="Favourite project"><Heart size={21} /></button>
                    <small><Images size={15} /> {Array.isArray(project.images) && project.images.length ? `${project.images.length} photos` : '—'}</small>
                  </div>
                  <div className="seller-mobile-project-body">
                    <h3>{project.name || '—'}</h3><p><MapPin size={15} /> {[project.village, project.area].filter(Boolean).join(' • ') || '—'}</p>
                    <span className="seller-mobile-project-type">{project.landZone ? getLandZoneLabel(project) : '—'}</span>
                    <div className="seller-mobile-project-facts">
                      <div><span>Plot sizes</span><strong>{project.sizeMin || project.plotAreaMinSqFt ? `${project.plotAreaMinSqFt || project.sizeMin}–${project.plotAreaMaxSqFt || project.sizeMax || '—'} sq.ft.` : '—'}</strong></div>
                      <div><span>Price range</span><strong>{project.startingPrice ? formatLakhs(project.startingPrice) : '—'}</strong></div>
                    </div>
                  </div>
                  <footer><span>Listed on Zinoo <Check size={15} /></span><div><button type="button" aria-label={`View ${project.name || 'project'}`} onClick={() => handleEditClick(project)}><Eye size={19} /></button><button type="button" aria-label={`Actions for ${project.name || 'project'}`} onClick={() => setProjectActionsProject(project)}><MoreVertical size={19} /></button></div></footer>
                </article>
              ) : (
                <article key={project.id} className="seller-project-row" onClick={() => handleEditClick(project)}>
                  {(project.thumbnail || project.heroImage) ? <img src={project.thumbnail || project.heroImage} alt="" /> : <div className="seller-project-image-empty"><Building size={20} /></div>}
                  <div className="seller-project-identity"><h3>{project.name}</h3><p><MapPin size={13} /> {[project.village, project.area].filter(Boolean).join(' • ') || 'Location pending'}</p></div>
                  <div className="seller-project-performance seller-project-progress"><span>Progress</span><strong>{toNumber(project.totalPlots) ? Math.round(((toNumber(project.totalPlots) - toNumber(project.remainingPlots)) / toNumber(project.totalPlots)) * 100) : 0}%</strong><i><b style={{ width: `${toNumber(project.totalPlots) ? Math.round(((toNumber(project.totalPlots) - toNumber(project.remainingPlots)) / toNumber(project.totalPlots)) * 100) : 0}%` }} /></i></div>
                  <div className="seller-project-cell"><span>Starting price</span><strong>{formatLakhs(project.startingPrice)}</strong></div>
                  <div className="seller-project-cell"><span>Views</span><strong>{project.views || project.weeklyViews || 0}</strong></div>
                  <div className="seller-project-performance"><span>Health</span>{Number.isFinite(Number(project.DruvioScore ?? project.plotItScore)) ? <><strong>{Math.min(100, Math.round((Number(project.DruvioScore ?? project.plotItScore) / 5) * 100))}%</strong><i><b style={{ width: `${Math.min(100, Math.round((Number(project.DruvioScore ?? project.plotItScore) / 5) * 100))}%` }} /></i></> : <strong>—</strong>}</div>
                  <div className="seller-project-cell seller-project-status-cell"><span>Status</span><strong className={`badge ${getProjectBadgeClass(project)}`}>{formatProjectStatus(project)}</strong></div>
                  <div className="seller-project-cell seller-project-updated"><span>Updated</span><strong>{project.updatedAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) || '—'}</strong></div>
                  <div className="seller-project-row-actions" onClick={(event) => event.stopPropagation()}>
                    <button type="button" className="btn-secondary seller-inline-button" aria-label={`Actions for ${project.name}`} onClick={() => setProjectActionsProject(project)}><MoreVertical size={16} /></button>
                  </div>
                </article>
              ))}
            </div></>
          )}
            </section>

            <aside className="seller-insights-column">
              <section className="seller-ai-card"><Sparkles size={19} /><div><span>Zinoo AI Assistant</span><h3>{pendingReviewCount ? 'Complete pending listings' : 'Improve listing engagement'}</h3><p>{pendingReviewCount ? `${pendingReviewCount} project${pendingReviewCount > 1 ? 's are' : ' is'} awaiting review. Complete missing documents to publish faster.` : 'Add recent layout photos to the listing with the lowest content completeness.'}</p><strong className="seller-ai-impact">Expected impact: faster buyer decisions</strong><div className="seller-ai-actions"><button type="button" onClick={() => myProjects[0] && handleEditClick(myProjects[0])}>Review suggestion</button><button type="button" className="secondary" onClick={() => selectTab('listings')}>Not now</button></div><small>Confidence 86%</small></div></section>
              <section className="seller-task-list"><div className="seller-os-section-heading"><div><span>Today</span><h2>Tasks</h2></div><strong>{pendingCashbacks} open</strong></div><div className="seller-task-progress"><i><b style={{ width: `${pendingCashbacks ? 18 : 100}%` }} /></i></div><button type="button" onClick={() => selectTab('cashbacks')}><i /> <span>Review cashback requests</span><b>{pendingCashbacks}</b></button></section>
            </aside>
          </div>
        </div>
      ) : activeTab === 'profile' ? (
        isAndroidLayout ? (
          <SellerProfileHub
            profile={sellerProfile}
            companyName={developerName}
            tabPage
            onBuyer={() => onViewChange?.('buyer')}
            onAdmin={onBackToAdmin}
            canOpenAdmin={Boolean(permissions?.admin)}
            onDeveloperProfile={() => setMobileProfileScreen('developer')}
            onEdit={() => setMobileProfileScreen('edit')}
            onSettings={() => setMobileProfileScreen('settings')}
            onSupport={() => onCustomerSupport?.()}
            onHelp={() => onCustomerSupport?.()}
            onLogout={() => logoutUser().catch((error) => console.error('Logout error:', error))}
          />
        ) : (
          <SellerDeveloperProfile
            user={sellerProfile}
            projects={myProjects}
            onBack={() => selectTab('projects')}
            onOpenAccount={() => setShowSellerProfileEditor(true)}
            onSaved={onSelectedSellerChange}
          />
        )
      ) : activeTab === 'add' ? (
        <PropertyDisplayEditor
          role={isAdminView ? 'admin' : 'seller'} user={user} mode="create" property={newProject} amenityOptions={amenityOptions}
          onChange={(nextProject) => { setNewProject(nextProject); setPropertyEditorDirty(true); }} onSubmit={handleAddProject}
          onCancel={() => selectTab('projects')} onReset={() => { setNewProject(createProjectDraft(developerName)); setPropertyEditorDirty(false); }}
          mediaUploading={mediaUploading} mediaError={mediaError} onMediaUpload={handleMediaUpload} documentUploading={documentUploading} documentError={documentError} onDocumentUpload={handleDocumentUpload} onRemoveDocument={removeDraftDocument} autoDetectHighway={isAdminView} isDirty={propertyEditorDirty} onDirtyChange={setPropertyEditorDirty} submitError={projectSubmitError}
        />
      ) : null}

      {projectActionsProject && (
        <div className="seller-m3-sheet-backdrop" role="presentation" onClick={() => setProjectActionsProject(null)}>
          <section className="seller-m3-action-sheet seller-project-menu-sheet" role="dialog" aria-modal="true" aria-label={`Actions for ${projectActionsProject.name}`} onClick={(event) => event.stopPropagation()}>
            <div className="seller-m3-sheet-handle" /><div className="seller-m3-sheet-heading"><h2>{projectActionsProject.name}</h2><button type="button" aria-label="Close" onClick={() => setProjectActionsProject(null)}><X size={20} /></button></div>
            <button type="button" onClick={() => { const project = projectActionsProject; setProjectActionsProject(null); handleEditClick(project); }}><Edit size={20} /><span>Edit project</span></button>
            {isAdminView && projectActionsProject.status === PROPERTY_STATUS.PENDING && <button type="button" disabled={listingActionKey === `approve-${projectActionsProject.id}`} onClick={async () => { await handleApproveProject(projectActionsProject.id); setProjectActionsProject(null); }}>{listingActionKey === `approve-${projectActionsProject.id}` ? <><LoaderCircle className="button-spinner" size={20} /><span>Approving…</span></> : <><ShieldCheck size={20} /><span>Approve</span></>}</button>}
            {isAdminView && projectActionsProject.status === PROPERTY_STATUS.PENDING && <button type="button" onClick={() => { setPropertyPendingRejection(projectActionsProject); setProjectActionsProject(null); }}><ShieldX size={20} /><span>Reject submission</span></button>}
            {isAdminView && [PROPERTY_STATUS.APPROVED, PROPERTY_STATUS.INACTIVE].includes(projectActionsProject.status) && <button type="button" disabled={listingActionKey === `${PROPERTY_STATUS.ACTIVE}-${projectActionsProject.id}`} onClick={async () => { await handleListingStatus(projectActionsProject.id, PROPERTY_STATUS.ACTIVE); setProjectActionsProject(null); }}>{listingActionKey === `${PROPERTY_STATUS.ACTIVE}-${projectActionsProject.id}` ? <><LoaderCircle className="button-spinner" size={20} /><span>Activating…</span></> : <><ShieldCheck size={20} /><span>Activate</span></>}</button>}
            {isAdminView && projectActionsProject.status === PROPERTY_STATUS.ACTIVE && <button type="button" onClick={() => { handleListingStatus(projectActionsProject.id, PROPERTY_STATUS.INACTIVE); setProjectActionsProject(null); }}><X size={20} /><span>Deactivate</span></button>}
            {isAdminView && [PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.INACTIVE, PROPERTY_STATUS.APPROVED].includes(projectActionsProject.status) && <button type="button" onClick={() => { handleListingStatus(projectActionsProject.id, PROPERTY_STATUS.SOLD); setProjectActionsProject(null); }}><Check size={20} /><span>Mark sold</span></button>}
          </section>
        </div>
      )}

      {isAndroidLayout && mobileProfileScreen === 'developer' && <SellerDeveloperProfile
        user={sellerProfile}
        projects={myProjects}
        onBack={() => setMobileProfileScreen(null)}
        onOpenAccount={() => setMobileProfileScreen('edit')}
        onSaved={onSelectedSellerChange}
      />}
      {isAndroidLayout && mobileProfileScreen === 'settings' && <SellerSettingsPage
        user={user}
        isDarkMode={isDarkMode}
        onThemeToggle={onThemeToggle}
        onBack={() => setMobileProfileScreen(null)}
        onAccountDeleted={onAccountDeleted}
      />}
      {isAndroidLayout && mobileProfileScreen === 'edit' && (
        <EditProfileModal
          user={selectedSeller || user}
          allowAuthUpdate={!selectedSeller}
          title="Personal Information"
          successMessage="Seller profile updated successfully!"
          onSave={onSelectedSellerChange}
          onClose={() => setMobileProfileScreen(null)}
          mobilePage
          companyName={developerName}
        />
      )}
      {!isAndroidLayout && showSellerProfileEditor && (
        <EditProfileModal
          user={selectedSeller || user}
          allowAuthUpdate={!selectedSeller}
          title="Personal Information"
          successMessage="Seller profile updated successfully!"
          onSave={onSelectedSellerChange}
          onClose={() => setShowSellerProfileEditor(false)}
        />
      )}
      </main>
      {isAndroidLayout && (
        <nav className="seller-mobile-nav m3-bottom-navigation" aria-label="Seller navigation">
          <button type="button" className={['projects', 'add'].includes(activeTab) ? 'active' : ''} onClick={() => selectTab('projects')}>
            <Building size={24} /><span>Projects</span>
          </button>
          <button type="button" className="seller-mobile-create" onClick={() => selectTab('add')} aria-label="Create new listing">
            <Plus size={25} />
          </button>
          <button type="button" className={activeTab === 'cashbacks' ? 'active' : ''} onClick={() => selectTab('cashbacks')}>
            <ClipboardList size={24} /><span>Requests</span>
          </button>
          <button type="button" className={activeTab === 'profile' ? 'active' : ''} onClick={() => selectTab('profile')}>
            <User size={24} /><span>Profile</span>
          </button>
        </nav>
      )}
      <PropertyRejectionModal
        property={propertyPendingRejection}
        rejecting={rejectingProperty}
        error={propertyRejectionError}
        onCancel={() => { if (!rejectingProperty) { setPropertyPendingRejection(null); setPropertyRejectionError(''); } }}
        onConfirm={(reason) => handleRejectProject(propertyPendingRejection.id, reason)}
      />
    </div>
  );
}

export default SellerDashboard;
