import React, { useContext, useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { httpsCallable } from 'firebase/functions';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import BuyerErrorBoundary from './components/BuyerErrorBoundary';
import { auth, db, functions, firebaseProjectId } from './firebaseConfig';
import {
  canAccessView,
  getDefaultView,
  isApprovedSellerAccount,
  normalizePermissions
} from './utils/permissions';
import { PROPERTY_STATUS } from './utils/projectVisibility';
import ThemeContext from './components/ThemeProvider';
import { readStartupCache, scheduleIdleWork, writeStartupCache } from './utils/startupCache';
import { ensureUserDoc } from './utils/authUser';
import { authTrace, sanitizeAuthDiagnosticMessage } from './utils/authDiagnostics';
import { applyApplicationSeoState } from './utils/seoMetadata';
import { getProjectRoutePath, getProjectRouteSlug } from './utils/projectRoute';
import { trackLead } from './utils/metaPixel';
import { requestNotificationPermissionOnce } from './services/pushNotifications';
import { logoutUser, MANAGED_SELLER_CONTEXT_KEY } from './services/authSessionService';

const BuyerApp = lazy(() => import('./components/BuyerApp'));
const SellerDashboard = lazy(() => import('./components/SellerDashboard'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const LoginScreen = lazy(() => import('./components/LoginScreen'));
const ProfileDropdown = lazy(() => import('./components/ProfileDropdown'));
const NotificationCenter = lazy(() => import('./components/NotificationCenter'));

function LaunchSplash() {
  return <main className="zinoo-launch-splash" aria-label="Zinoo is starting">
    <div className="zinoo-launch-splash-brand">
      <img src="/brand/zinoo-logo.png" alt="Zinoo" />
      <i aria-hidden="true" />
      <p>FIND <span aria-hidden="true">•</span> COMPARE <span aria-hidden="true">•</span> DECIDE</p>
    </div>
  </main>;
}

const collections = ['projects', 'leads', 'visits', 'cashbacks', 'notifications'];
const asBuyerProject = (project, id = project?.projectId) => ({
  ...project,
  id: project?.projectId || id,
  name: project?.projectName || project?.name,
  priceFrom: project?.startingPrice,
  minimumPlotArea: project?.plotAreaMinSqFt,
  maximumPlotArea: project?.plotAreaMaxSqFt,
  thumbnail: project?.primaryImage,
  heroImage: project?.primaryImage,
  contactNumber: project?.publicContactNumber || '',
  images: project?.galleryImages || [],
  documents: (project?.publicDocuments || []).map((document) => ({
    ...document, displayName: document.title, downloadURL: document.url,
    enabled: true, verified: true, showOnDetails: true
  }))
});
let googleRedirectResultPromise = null;
const getGoogleRedirectResultOnce = () => {
  if (!googleRedirectResultPromise) {
    // Authentication completion must not depend on Firestore profile access.
    authTrace('getRedirectResult started', {
      origin: window.location.origin,
      pathname: window.location.pathname,
      authDomain: auth.config.authDomain,
      currentUserPresent: Boolean(auth.currentUser)
    });
    googleRedirectResultPromise = getRedirectResult(auth)
      .then((result) => {
        authTrace('getRedirectResult resolved', {
          redirectResultExists: Boolean(result),
          redirectUserExists: Boolean(result?.user),
          redirectProvider: result?.providerId || result?.user?.providerData?.[0]?.providerId || null,
          currentUserPresent: Boolean(auth.currentUser)
        });
        return result;
      })
      .catch((error) => {
        authTrace('getRedirectResult ERROR', {
          code: error?.code || 'unknown',
          message: sanitizeAuthDiagnosticMessage(error?.message),
          currentUserPresent: Boolean(auth.currentUser)
        });
        throw error;
      });
  }
  return googleRedirectResultPromise;
};
function App() {
  const [launchSplashVisible, setLaunchSplashVisible] = useState(true);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [currentView, setCurrentView] = useState('buyer'); // 'buyer', 'seller', 'admin'
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [error, setError] = useState('');
  const [authReady, setAuthReady] = useState(false);
  const [profileStatus, setProfileStatus] = useState('idle');
  const [profileRetryNonce, setProfileRetryNonce] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingLead, setPendingLead] = useState(null);
  const [publicProjects, setPublicProjects] = useState(() => readStartupCache('public-projects', []));
  const [publicProjectsReady, setPublicProjectsReady] = useState(false);
  const [routePathname, setRoutePathname] = useState(() => window.location.pathname);
  const [routeProject, setRouteProject] = useState(null);
  const [routeProjectStatus, setRouteProjectStatus] = useState('idle');
  const [deletionNotice, setDeletionNotice] = useState('');
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [collectionReady, setCollectionReady] = useState({ projects: false, leads: false, visits: false, cashbacks: false, notifications: false });
  const [data, setData] = useState(() => ({
    projects: readStartupCache('projects', []),
    leads: [], visits: [], cashbacks: [], notifications: []
  }));
  const restoredManagedSellerRef = useRef(false);
  const pendingLeadSubmissionRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLaunchSplashVisible(false), 1250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  const routeSlug = getProjectRouteSlug(routePathname);
  useEffect(() => {
    const onPopState = () => setRoutePathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateProjectRoute = useCallback((project, { replace = false } = {}) => {
    const path = project ? getProjectRoutePath(project) : '/';
    if (!path) return;
    if (window.location.pathname !== path) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
    }
    setRoutePathname(path);
  }, []);

  useEffect(() => {
    if (!routeSlug) {
      setRouteProject(null);
      setRouteProjectStatus('idle');
      return undefined;
    }
    let active = true;
    setRouteProject(null);
    setRouteProjectStatus('loading');
    const unsubscribe = onSnapshot(query(
      collection(db, 'publicProjects'),
      where('slug', '==', routeSlug),
      where('publicVisibility', '==', true),
      where('status', '==', PROPERTY_STATUS.ACTIVE),
      limit(1)
    ), (snapshot) => {
        if (!active) return;
        if (snapshot.empty) {
          setRouteProjectStatus('not-found');
          return;
        }
        setRouteProject(asBuyerProject(snapshot.docs[0].data(), snapshot.docs[0].id));
        setRouteProjectStatus('ready');
      }, (routeError) => {
        console.error('[Zinoo Route] Public project lookup failed.', routeError);
        if (active) setRouteProjectStatus('error');
      });
    return () => { active = false; unsubscribe(); };
  }, [routeSlug]);

  useEffect(() => {
    if (!authReady || !user) return;
    requestNotificationPermissionOnce().catch((permissionError) => {
      if (import.meta.env.DEV) {
        console.error('[Druvio FCM] Notification permission flow failed.', permissionError);
      }
    });
  }, [authReady, user]);

  useEffect(() => {
    if (!authReady || !user || profileStatus !== 'ready' || !pendingLead || pendingLeadSubmissionRef.current) return;
    pendingLeadSubmissionRef.current = true;
    const lead = pendingLead;

    addDoc(collection(db, 'leads'), {
      createdBy: user.uid,
      name: lead.name,
      phone: lead.phone,
      stage: lead.action || 'View Property Details',
      date: new Date().toISOString().split('T')[0],
      project: lead.project || '',
      projectId: lead.projectId || '',
      projectOwnerId: lead.projectOwnerId || '',
      source: 'public-landing',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).then(() => {
      trackLead({
        project: { id: lead.projectId, name: lead.project },
        leadType: 'project_enquiry'
      });
      window.sessionStorage.setItem('flinokPendingPropertyIntent', JSON.stringify(lead));
      setPendingLead(null);
      setShowLogin(false);
    }).catch((leadError) => {
      console.error('Unable to complete pending lead after sign-in', leadError);
      setError('You are signed in, but your enquiry could not be submitted. Please try again.');
    }).finally(() => {
      pendingLeadSubmissionRef.current = false;
    });
  }, [authReady, user, profileStatus, pendingLead]);

  const handleViewChange = useCallback((nextView) => {
    if (!permissions) return;
    const resolvedView = canAccessView(permissions, nextView)
      ? nextView
      : getDefaultView(permissions);

    setCurrentView(resolvedView);
    if (resolvedView !== 'seller') {
      setSelectedSeller(null);
      window.sessionStorage.removeItem(MANAGED_SELLER_CONTEXT_KEY);
    }
  }, [permissions]);

  const handleAccountDeleted = useCallback((message) => {
    setDeletionNotice(message || 'Your account and associated data have been permanently deleted.');
    setUser(null);
    setProfileData(null);
    setPermissions(null);
    setSelectedSeller(null);
    setShowLogin(false);
    window.sessionStorage.removeItem(MANAGED_SELLER_CONTEXT_KEY);
  }, []);

  useEffect(() => {
    if (restoredManagedSellerRef.current || !user || !permissions?.admin || selectedSeller) return;
    restoredManagedSellerRef.current = true;
    const stored = window.sessionStorage.getItem(MANAGED_SELLER_CONTEXT_KEY);
    if (!stored) return;
    let context;
    try { context = JSON.parse(stored); } catch { window.sessionStorage.removeItem(MANAGED_SELLER_CONTEXT_KEY); return; }
    if (!context?.sellerUid || context.enteredByAdminUid !== user.uid) {
      window.sessionStorage.removeItem(MANAGED_SELLER_CONTEXT_KEY);
      return;
    }
    getDoc(doc(db, 'users', context.sellerUid)).then((snapshot) => {
      const seller = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
      if (!isApprovedSellerAccount(seller)) {
        window.sessionStorage.removeItem(MANAGED_SELLER_CONTEXT_KEY);
        return;
      }
      setSelectedSeller({ ...seller, uid: seller.uid || seller.id, initialSellerTab: context.initialSellerTab || 'listings' });
      setCurrentView('seller');
    }).catch(() => window.sessionStorage.removeItem(MANAGED_SELLER_CONTEXT_KEY));
  }, [user, permissions, selectedSeller]);

  useEffect(() => {
    let disposed = false;

    authTrace('page loaded after OAuth / Auth bootstrap started', {
      platform: Capacitor.getPlatform(),
      origin: window.location.origin,
      pathname: window.location.pathname,
      authDomain: auth.config.authDomain,
      currentUserPresent: Boolean(auth.currentUser),
      redirectPending: !Capacitor.isNativePlatform(),
      requestedPersistence: ['localStorage']
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (nextUser) => {
      authTrace('AUTH_STATE_CHANGED', {
        flow: 'session',
        sdk: 'firebase/auth',
        authenticated: Boolean(nextUser),
        uidPresent: Boolean(nextUser?.uid)
      });
      authTrace('authStateChanged', {
        userPresent: Boolean(nextUser),
        uidPresent: Boolean(nextUser?.uid),
        providerIds: nextUser?.providerData?.map((provider) => provider.providerId) || [],
        currentUserPresent: Boolean(auth.currentUser),
        authoritativeAuthState: nextUser ? 'authenticated' : 'unauthenticated'
      });
      if (import.meta.env.DEV) {
        console.info('[Zinoo Auth] Auth state resolved', {
          authenticated: Boolean(nextUser),
          providerIds: nextUser?.providerData?.map((provider) => provider.providerId) || [],
          authLoading: false,
          path: window.location.pathname,
          routeDecision: nextUser ? 'authenticated-app' : 'public-home'
        });
      }
      if (!disposed) setAuthReady(true);
      setUser(nextUser);
      if (!nextUser) {
        setShowLogin(false);
        setProfileData(null);
        setPermissions(null);
        setProfileStatus('idle');
        setCurrentView('buyer');
        setSelectedSeller(null);
        return;
      }
      setProfileData(null);
      setPermissions(null);
      setProfileStatus('provisioning');
      setSelectedSeller(null);
      setError('');
    });

    if (!Capacitor.isNativePlatform()) {
      getGoogleRedirectResultOnce()
        .then((result) => {
          if (disposed) return;
          authTrace('redirect result applied to bootstrap', {
            redirectResultExists: Boolean(result),
            redirectUserExists: Boolean(result?.user),
            currentUserPresent: Boolean(auth.currentUser),
            authority: 'onAuthStateChanged'
          });
          if (import.meta.env.DEV) {
            console.info('[Zinoo Auth] Google redirect result', {
              path: window.location.pathname,
              authenticatedResult: Boolean(result?.user),
              currentUserPresent: Boolean(auth.currentUser),
              providerIds: result?.user?.providerData?.map((provider) => provider.providerId) || [],
              redirectResultExists: Boolean(result?.user),
              routeDecision: result?.user ? 'authenticated-app' : 'auth-state'
            });
          }
        })
        .catch((redirectError) => {
          if (disposed) return;
          console.error('[Zinoo Auth] Google redirect sign-in failed', {
            code: redirectError?.code,
            message: redirectError?.message,
            method: 'redirect',
            phase: 'redirect-result',
            origin: window.location.origin
          });
          setError('Google sign-in could not be completed. Please try again.');
        })
        .finally(() => {
          authTrace('redirect bootstrap settled', {
            currentUserPresent: Boolean(auth.currentUser),
            authority: 'onAuthStateChanged'
          });
          if (import.meta.env.DEV) {
            console.info('[Zinoo Auth] Redirect bootstrap settled', {
              currentUserPresent: Boolean(auth.currentUser),
              finalDecisionOwnedBy: 'onAuthStateChanged'
            });
          }
        });
    }

    return () => {
      disposed = true;
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!authReady || !user) return undefined;
    let disposed = false;
    let unsubscribeProfile = null;
    let profileLoadTimer = null;
    let serverProfileFetch = null;

    const clearProfileLoadTimer = () => {
      if (profileLoadTimer) window.clearTimeout(profileLoadTimer);
      profileLoadTimer = null;
    };
    const failProfile = (message, profileError = null) => {
      if (disposed) return;
      clearProfileLoadTimer();
      if (unsubscribeProfile) unsubscribeProfile();
      unsubscribeProfile = null;
      setProfileData(null);
      setPermissions(null);
      setSelectedSeller(null);
      setProfileStatus('error');
      setError(message);
      if (profileError) console.error('PROFILE SESSION FAILED', profileError);
    };
    const applyProfile = (profile) => {
      if (disposed) return;
      if (!profile.exists()) {
        failProfile('Your Zinoo profile is unavailable. Retry loading it or sign out.');
        return;
      }
      try {
        clearProfileLoadTimer();
        const nextProfileData = profile.data() || {};
        const userPermissions = normalizePermissions(nextProfileData);
        if (import.meta.env.DEV) {
          console.info('[Zinoo Auth] authenticated profile ready', {
            authenticated: true,
            role: userPermissions.admin ? 'admin' : userPermissions.seller ? 'seller' : 'buyer',
            projectId: firebaseProjectId,
            fromCache: profile.metadata?.fromCache ?? false
          });
        }
        setProfileData(nextProfileData);
        setPermissions(userPermissions);
        setCurrentView((current) => canAccessView(userPermissions, current)
          ? current
          : getDefaultView(userPermissions));
        if (!userPermissions.admin && !userPermissions.seller) setSelectedSeller(null);
        setProfileStatus('ready');
        setError('');
      } catch (profileError) {
        failProfile('We could not process your Zinoo profile. Retry loading it or sign out.', profileError);
      }
    };

    const startProfileSession = async () => {
      setProfileData(null);
      setPermissions(null);
      setSelectedSeller(null);
      setProfileStatus('provisioning');
      setError('');
      try {
        await ensureUserDoc(db, user);
      } catch (profileError) {
        authTrace('ensureUserDoc ERROR', {
          userPresent: true,
          uidPresent: Boolean(user.uid),
          code: profileError?.code || 'unknown',
          message: sanitizeAuthDiagnosticMessage(profileError?.message)
        });
        failProfile('You are signed in, but your Zinoo profile could not be prepared. Retry or sign out.', profileError);
        return;
      }
      if (disposed) return;

      setProfileStatus('loading');
      profileLoadTimer = window.setTimeout(() => {
        failProfile('Your Zinoo profile took too long to load. Retry or sign out.');
      }, 12000);
      unsubscribeProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (profile) => {
          if (profile.exists() || !profile.metadata.fromCache) {
            applyProfile(profile);
            return;
          }
          if (!serverProfileFetch) {
            serverProfileFetch = getDocFromServer(doc(db, 'users', user.uid))
              .then(applyProfile)
              .catch((profileError) => failProfile('We could not load your Zinoo profile. Retry or sign out.', profileError));
          }
        },
        (profileError) => failProfile('We could not load your Zinoo profile. Retry or sign out.', profileError)
      );
    };

    void startProfileSession();
    return () => {
      disposed = true;
      clearProfileLoadTimer();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [authReady, user, profileRetryNonce]);

  useEffect(() => {
    if (!authReady || user) return undefined;
    const publicProjectsQuery = query(
      collection(db, 'publicProjects'),
      where('publicVisibility', '==', true),
      where('status', '==', PROPERTY_STATUS.ACTIVE)
    );
    return onSnapshot(publicProjectsQuery, (snapshot) => {
      const projects = snapshot.docs.map((item) => {
        const project = item.data();
        return {
          ...asBuyerProject(project, item.id)
        };
      });
      setPublicProjects(projects);
      setPublicProjectsReady(true);
      writeStartupCache('public-projects', projects);
    }, (publicProjectsError) => {
      console.error('[Zinoo Firestore] public project listener failed', publicProjectsError);
      setPublicProjectsReady(true);
      if (navigator.onLine) setError('Public projects are temporarily unavailable. Please try again.');
    });
  }, [authReady, user]);

  useEffect(() => {
    if (!authReady) return;
    applyApplicationSeoState({
      isPublicPage: Boolean(routeSlug) || (!user && !showLogin),
      project: routeProject,
      projectSlug: routeSlug
    });
  }, [authReady, routeProject, routeSlug, user, showLogin]);

  useEffect(() => {
    authTrace('routing state', {
      authReady,
      userPresent: Boolean(user),
      showLogin,
      profileReady: Boolean(profileData),
      permissionsReady: Boolean(permissions),
      currentUserPresent: Boolean(auth.currentUser),
      finalComponent: !authReady
        ? 'AUTH_LOADING'
        : user
          ? 'AUTHENTICATED_APP'
          : showLogin
            ? 'LOGIN_SCREEN'
            : 'GUEST_BUYER_APP'
    });
  }, [authReady, user, showLogin, profileData, permissions]);

  useEffect(() => {
    if (!authReady || !user || !permissions || auth.currentUser?.uid !== user.uid) return undefined;

    const sourceFor = (name) => {
      const ref = collection(db, name);

      // Admin inspecting an existing seller workspace.
      if (permissions.admin && currentView === 'seller' && selectedSeller) {
        if (name === 'projects') return query(ref, where('ownerId', '==', selectedSeller.id));
        if (name === 'leads' || name === 'visits') return query(ref, where('projectOwnerId', '==', selectedSeller.id));
        return ref;
      }

      // Primary admin view keeps global access.
      if (permissions.admin && currentView === 'admin') return query(ref, limit(500));

      // Buyer mode reuses the existing buyer app with active listings plus the
      // signed-in account's own activity records.
      if (currentView === 'buyer') {
        if (name === 'projects') return query(ref, where('status', '==', PROPERTY_STATUS.ACTIVE));
        if (name === 'notifications') return query(ref, where('recipientId', '==', user.uid));
        return query(ref, where('createdBy', '==', user.uid));
      }

      // Seller view
      if (currentView === 'seller') {
        if (name === 'notifications') return query(ref, where('recipientId', '==', user.uid));
        return query(ref, where(name === 'projects' ? 'ownerId' : 'projectOwnerId', '==', user.uid));
      }

      return ref;
    };

    const queryDescriptionFor = (name) => {
      if (permissions.admin && currentView === 'seller' && selectedSeller) {
        if (name === 'projects') return `where(ownerId == ${selectedSeller.id})`;
        if (name === 'leads' || name === 'visits') return `where(projectOwnerId == ${selectedSeller.id})`;
        return 'unfiltered';
      }
      if (permissions.admin && currentView === 'admin') return 'limit(500)';
      if (currentView === 'buyer') {
        if (name === 'projects') return `where(status == ${PROPERTY_STATUS.ACTIVE})`;
        if (name === 'notifications') return `where(recipientId == ${user.uid})`;
        return `where(createdBy == ${user.uid})`;
      }
      if (currentView === 'seller') {
        if (name === 'notifications') return `where(recipientId == ${user.uid})`;
        return `where(${name === 'projects' ? 'ownerId' : 'projectOwnerId'} == ${user.uid})`;
      }
      return 'unfiltered';
    };

    const unsubscribers = [];
    let disposed = false;
    const startListener = (name) => {
      if (disposed) return;
      const path = name;
      const filters = queryDescriptionFor(name);
      if (import.meta.env.DEV) {
        console.info('[Zinoo Firestore] listener starting', { projectId: firebaseProjectId, path, filters, uid: user.uid });
      }
      let source;
      try {
        source = sourceFor(name);
      } catch (queryError) {
        console.error('[Zinoo Firestore] query construction failed', { path, filters, code: queryError?.code, message: queryError?.message, error: queryError });
        throw queryError;
      }
      const unsubscribe = onSnapshot(source, (snapshot) => {
        const lastSnapshotTime = new Date().toISOString();
        if (import.meta.env.DEV) {
          console.info('[Zinoo Firestore] snapshot received', { path, filters, documentCount: snapshot.size, lastSnapshotTime, fromCache: snapshot.metadata.fromCache });
        }
        const records = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        if (import.meta.env.DEV && name === 'projects') {
          console.info('[Zinoo Documents] Buyer property fetch', {
            firestoreCollection: 'projects',
            propertiesReturned: records.length,
            documentsReturned: records.reduce((count, project) => count + (Array.isArray(project.documents) ? project.documents.length : 0), 0),
            properties: records.map((project) => ({
              propertyId: project.id,
              firestoreDocument: `projects/${project.id}`,
              documentsFound: Array.isArray(project.documents) ? project.documents.length : 0
            }))
          });
        }
        setData((current) => ({ ...current, [name]: records }));
        setCollectionReady((current) => ({ ...current, [name]: true }));
        if (name !== 'projects' || currentView === 'buyer') {
          writeStartupCache(name === 'projects' ? 'projects' : `${user.uid}:${name}`, records);
        }
      }, (firestoreError) => {
        const detail = { code: firestoreError?.code || 'unknown', message: firestoreError?.message || String(firestoreError) };
        console.error('[Zinoo Firestore] listener failed', { projectId: firebaseProjectId, path, filters, uid: user.uid, ...detail, error: firestoreError });
        if (navigator.onLine) setError(`Firestore ${path} sync failed [${detail.code}]: ${detail.message}`);
      });
      unsubscribers.push(unsubscribe);
    };

    startListener('projects');
    const cancelDeferredListeners = scheduleIdleWork(() => {
      collections.filter((name) => name !== 'projects').forEach(startListener);
    }, 1200);

    return () => {
      disposed = true;
      cancelDeferredListeners();
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [authReady, user, permissions, currentView, selectedSeller]);

  const createRecord = async (name, record) => {
    try {
      const normalizedRecord = typeof record?.lastCalculatedAt === 'string'
        ? { ...record, lastCalculatedAt: Timestamp.fromDate(new Date(record.lastCalculatedAt)) }
        : record;
      return await addDoc(collection(db, name), { ...normalizedRecord, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    } catch (saveError) {
      setError('We could not save that change. Please try again.');
      throw saveError;
    }
  };

  const updateRecord = async (name, id, changes) => {
    try {
      const normalizedChanges = typeof changes?.lastCalculatedAt === 'string'
        ? { ...changes, lastCalculatedAt: Timestamp.fromDate(new Date(changes.lastCalculatedAt)) }
        : changes;
      await updateDoc(doc(db, name, id), { ...normalizedChanges, updatedAt: serverTimestamp() });
    } catch (saveError) {
      console.error('[Zinoo Firestore] Update failed', {
        collection: name,
        documentId: id,
        code: saveError?.code,
        message: saveError?.message
      });
      setError('We could not save that change. Please try again.');
      throw saveError;
    }
  };

  const addLead = (lead) => createRecord('leads', lead);
  const updateLead = (lead) => updateRecord('leads', lead.id, lead);
  const addVisit = (visit) => createRecord('visits', visit);
  const addCashback = async (cashback) => {
    const result = await httpsCallable(functions, 'submitCashbackRequest')(cashback);
    return result.data;
  };
  const addProject = async (project) => {
    const adminCreatingForSeller = Boolean(permissions?.admin && currentView === 'seller');
    let authoritativeSeller = selectedSeller;
    if (adminCreatingForSeller) {
      if (!selectedSeller?.id) {
        const ownershipError = new Error('Choose an approved Seller before creating this project.');
        setError(ownershipError.message);
        throw ownershipError;
      }
      const sellerSnapshot = await getDoc(doc(db, 'users', selectedSeller.id));
      authoritativeSeller = sellerSnapshot.exists() ? { id: sellerSnapshot.id, ...sellerSnapshot.data() } : null;
      if (!isApprovedSellerAccount(authoritativeSeller)) {
        const ownershipError = new Error('This Seller is no longer approved to own new projects.');
        setError(ownershipError.message);
        throw ownershipError;
      }
    }
    if (adminCreatingForSeller) {
      const result = await httpsCallable(functions, 'createProjectForSeller')({
        sellerUid: authoritativeSeller.id,
        projectData: project
      });
      return result.data;
    }

    const ownerId = user.uid;
    return createRecord('projects', {
      ...project,
      ownerId,
      sellerUid: ownerId,
      status: 'pending',
      createdBy: user.uid,
      createdByRole: 'seller',
      createdByAdmin: false,
      createdOnBehalfOfSeller: false,
      approvalStatus: 'pending',
      reviewStatus: 'pending',
      isApproved: false,
      isPublished: false,
      reviewedBy: null,
      reviewedAt: null,
      approvedAt: null,
      publishedAt: null
    });
  };
  const updateProject = (project) => updateRecord('projects', project.id, project);
  const updateCashbackStatus = async (id, status) => {
    await updateRecord('cashbacks', id, { status });
    if (status === 'Approved') {
      const claim = data.cashbacks.find((item) => item.id === id);
      const lead = claim && data.leads.find((item) => item.phone === claim.buyerPhone);
      if (lead) await updateLead({ ...lead, stage: 'Purchased' });
    }
  };

  const handleAdminSwitchToBuyer = useCallback(() => {
    handleViewChange('buyer');
  }, [handleViewChange]);

  const handleAdminSwitchToSeller = useCallback(() => {
    handleViewChange('seller');
  }, [handleViewChange]);

  const handleAdminSwitchToAdmin = useCallback(() => {
    handleViewChange('admin');
  }, [handleViewChange]);

  const handleAdminSelectSeller = useCallback((seller, initialSellerTab = 'listings') => {
    if (!isApprovedSellerAccount(seller)) {
      setError('Only approved Seller accounts can own Admin-created projects.');
      return;
    }
    const context = { sellerUid: seller.uid || seller.id, sellerName: seller.displayName || seller.name || '', businessName: seller.businessName || '', enteredByAdminUid: user.uid, initialSellerTab };
    window.sessionStorage.setItem(MANAGED_SELLER_CONTEXT_KEY, JSON.stringify(context));
    setSelectedSeller({ ...seller, uid: seller.uid || seller.id, initialSellerTab, managedSellerContext: context });
    setCurrentView('seller');
  }, [user]);

  const handleBackToAdmin = useCallback(() => {
    handleViewChange('admin');
  }, [handleViewChange]);

  const handleCustomerSupport = useCallback(() => {
    window.sessionStorage.setItem('flinokBuyerDestination', 'support');
    handleViewChange('buyer');
  }, [handleViewChange]);

  const handleSelectedSellerChange = useCallback((changes) => {
    if (selectedSeller) setSelectedSeller((current) => (current ? { ...current, ...changes } : current));
    else setProfileData((current) => (current ? { ...current, ...changes } : current));
  }, [selectedSeller]);

  if (!authReady || launchSplashVisible) return <LaunchSplash />;
  if (!user) {
    const requireAuthentication = (intent = null) => {
      if (intent) window.sessionStorage.setItem('zinooPendingAuthenticatedAction', JSON.stringify(intent));
      setShowLogin(true);
    };
    return (
      <Suspense fallback={null}>
        <main className="live-app view-buyer buyer-experience">
          {!isOnline && <div className="offline-indicator">Offline</div>}
          {error && <div className="app-error" role="alert">{error}</div>}
          <section className="live-app-content">
            <BuyerErrorBoundary>
              <BuyerApp
                projects={publicProjects}
                leads={[]}
                visits={[]}
                cashbacks={[]}
                notifications={[]}
                user={null}
                buyerProfile={null}
                permissions={null}
                currentView="buyer"
                isDarkMode={isDarkMode}
                onThemeToggle={toggleTheme}
                projectsLoading={!publicProjectsReady && publicProjects.length === 0}
                onRequireAuth={requireAuthentication}
                routeProject={routeProject}
                routeStatus={routeProjectStatus}
                routeSlug={routeSlug}
                onProjectRouteChange={navigateProjectRoute}
              />
            </BuyerErrorBoundary>
          </section>
        </main>
        {showLogin && <div className="auth-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target !== event.currentTarget || user) return;
          window.sessionStorage.removeItem('zinooPendingAuthenticatedAction');
          setPendingLead(null);
          setShowLogin(false);
        }}>
          <LoginScreen
            presentation="modal"
            onBackToLanding={!user ? () => {
              window.sessionStorage.removeItem('zinooPendingAuthenticatedAction');
              setPendingLead(null);
              setShowLogin(false);
            } : undefined}
            initialStep={pendingLead ? 'phone' : 'home'}
            initialPhone={pendingLead?.phone || ''}
          />
        </div>}
        <div id="recaptcha-container" aria-hidden="true" />
      </Suspense>
    );
  }
  if (profileStatus === 'error') {
    return (
      <main className="login-screen">
        <section className="login-auth-panel" role="alert">
          <h1>Profile unavailable</h1>
          <p>{error || 'Your Firebase session is active, but your Zinoo profile is unavailable.'}</p>
          <button type="button" className="login-submit" onClick={() => setProfileRetryNonce((value) => value + 1)}>
            Retry profile
          </button>
          <button type="button" className="login-inline-action" onClick={() => logoutUser().catch((signOutError) => {
            console.error('Logout error:', signOutError);
            setError('Unable to sign out. Please try again.');
          })}>
            Sign out
          </button>
        </section>
      </main>
    );
  }
  if (profileStatus !== 'ready' || !profileData || !permissions) return null;

  const profileName = user.displayName || user.phoneNumber || user.email || 'User';
  const authenticatedProfile = {
    ...profileData,
    uid: user.uid,
    email: profileData?.email || user.email || '',
    phoneNumber: profileData?.phoneNumber || profileData?.phone || user.phoneNumber || '',
    displayName: profileData?.displayName || profileData?.name || user.displayName || profileName,
    photoURL: profileData?.photoURL
      || profileData?.profilePhotoURL
      || profileData?.profileImageUrl
      || profileData?.profileImageURL
      || profileData?.profilePicture
      || profileData?.avatarUrl
      || profileData?.avatarURL
      || user.photoURL
      || ''
  };

  const content = currentView === 'admin'
    ? (
      <AdminPanel
        cashbacks={data.cashbacks}
        projects={data.projects}
        updateProject={updateProject}
        user={authenticatedProfile}
        canDeleteProperties={Boolean(permissions?.admin)}
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
        onSwitchToAdmin={handleAdminSwitchToAdmin}
        onSwitchToBuyer={handleAdminSwitchToBuyer}
        onSwitchToSeller={handleAdminSwitchToSeller}
        onSelectSeller={handleAdminSelectSeller}
        permissions={permissions}
        currentView={currentView}
        onViewChange={handleViewChange}
        onCustomerSupport={handleCustomerSupport}
        onBackToAdmin={handleBackToAdmin}
      />
    )
    : currentView === 'seller'
      ? (
        permissions?.admin && !selectedSeller
          ? (
            <AdminPanel
              cashbacks={data.cashbacks}
              projects={data.projects}
              updateProject={updateProject}
              user={authenticatedProfile}
              canDeleteProperties={Boolean(permissions?.admin)}
              initialTab="seller_selection"
              isDarkMode={isDarkMode}
              onThemeToggle={toggleTheme}
              onSwitchToAdmin={handleAdminSwitchToAdmin}
              onSwitchToBuyer={handleAdminSwitchToBuyer}
              onSwitchToSeller={handleAdminSwitchToSeller}
              onSelectSeller={handleAdminSelectSeller}
              permissions={permissions}
              currentView={currentView}
              onViewChange={handleViewChange}
              onCustomerSupport={handleCustomerSupport}
              onBackToAdmin={handleBackToAdmin}
            />
          )
          : (
            <SellerDashboard
              {...data}
              user={authenticatedProfile}
              updateProject={updateProject}
              addProject={addProject}
              isAdminView={Boolean(permissions?.admin && selectedSeller)}
              selectedSeller={selectedSeller}
              onBackToAdmin={handleBackToAdmin}
              onSelectedSellerChange={handleSelectedSellerChange}
              onCustomerSupport={handleCustomerSupport}
              isDarkMode={isDarkMode}
              onThemeToggle={toggleTheme}
              permissions={permissions}
              currentView={currentView}
              onViewChange={handleViewChange}
              onAccountDeleted={handleAccountDeleted}
            />
          )
      )
      : (
        <BuyerErrorBoundary>
          <BuyerApp
            {...data}
            user={authenticatedProfile}
            buyerProfile={profileData}
            addLead={addLead}
            updateLead={updateLead}
            addVisit={addVisit}
            addCashback={addCashback}
            isAdmin={Boolean(permissions?.admin)}
            onThemeToggle={toggleTheme}
            isDarkMode={isDarkMode}
            permissions={permissions}
            currentView={currentView}
            onViewChange={handleViewChange}
            onBackToAdmin={handleBackToAdmin}
            selectedSeller={selectedSeller}
            projectsLoading={!collectionReady.projects && data.projects.length === 0}
            onAccountDeleted={handleAccountDeleted}
            routeProject={routeProject}
            routeStatus={routeProjectStatus}
            routeSlug={routeSlug}
            onProjectRouteChange={navigateProjectRoute}
          />
        </BuyerErrorBoundary>
      );

  const headerViewLabel = permissions?.admin && currentView === 'seller' && selectedSeller
    ? `${selectedSeller.displayName || selectedSeller.name || selectedSeller.businessName || 'seller'}`
    : currentView;

  return (
    <main className={`live-app view-${currentView} ${currentView === 'buyer' ? 'buyer-experience' : 'backoffice-experience'} ${permissions?.admin && currentView === 'seller' && selectedSeller ? 'managed-seller-view' : ''}`}>
      {!isOnline && <div className="offline-indicator">Offline</div>}
      {deletionNotice && (
        <div className="account-deletion-toast modal-success" role="status" aria-live="polite">
          <span>{deletionNotice}</span>
          <button type="button" className="close-toast-btn" onClick={() => setDeletionNotice('')} aria-label="Close message">✕</button>
        </div>
      )}
      {currentView !== 'buyer' && currentView !== 'seller' && <Suspense fallback={null}><NotificationCenter notifications={data.notifications} userId={user.uid} isAdmin={Boolean(permissions?.admin)} /></Suspense>}
      {currentView !== 'buyer' && currentView !== 'seller' && (
        <header className="live-app-header">
          <div className="brand-lockup"><img src="/brand/zinoo-logo.png" alt="Zinoo"/><span>{headerViewLabel}</span></div>
          <Suspense fallback={<div className="startup-profile-skeleton" aria-hidden="true" />}><ProfileDropdown
            user={authenticatedProfile}
            onThemeToggle={toggleTheme}
            isDarkMode={isDarkMode}
            permissions={permissions}
            currentView={currentView}
            onViewChange={handleViewChange}
            onCustomerSupport={handleCustomerSupport}
            onBackToAdmin={handleBackToAdmin}
            selectedSeller={selectedSeller}
            onAccountDeleted={handleAccountDeleted}
          /></Suspense>
        </header>
      )}
      {error && <div className="app-error" role="alert">{error}</div>}
      <section className="live-app-content">
        <Suspense fallback={null}>
          {content}
        </Suspense>
      </section>
    </main>
  );
}

export default App;
