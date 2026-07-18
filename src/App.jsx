import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { MapPin } from 'lucide-react';
import BuyerApp from './components/BuyerApp';
import BuyerErrorBoundary from './components/BuyerErrorBoundary';
import SellerDashboard from './components/SellerDashboard';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/LoginScreen';
import ProfileDropdown from './components/ProfileDropdown';
import { auth, db, functions } from './firebaseConfig';
import {
  canAccessView,
  DEFAULT_PERMISSIONS,
  getDefaultView,
  isApprovedSellerAccount,
  normalizePermissions
} from './utils/permissions';
import ThemeContext from './components/ThemeProvider';

const collections = ['projects', 'leads', 'visits', 'cashbacks'];
const MANAGED_SELLER_CONTEXT_KEY = 'druvio-managed-seller-context';

function App() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [currentView, setCurrentView] = useState('buyer'); // 'buyer', 'seller', 'admin'
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({ projects: [], leads: [], visits: [], cashbacks: [] });
  const restoredManagedSellerRef = useRef(false);

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
    let unsubscribeProfile = null;
    let profileLoadTimer = null;

    const clearProfileLoadTimer = () => {
      if (profileLoadTimer) {
        window.clearTimeout(profileLoadTimer);
        profileLoadTimer = null;
      }
    };

    const useBuyerFallback = (message) => {
      clearProfileLoadTimer();
      setPermissions({ ...DEFAULT_PERMISSIONS });
      setProfileData(null);
      setCurrentView('buyer');
      setSelectedSeller(null);
      setError(message);
      setLoading(false);
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      clearProfileLoadTimer();
      if (!nextUser) {
        setProfileData(null);
        setPermissions(null);
        setCurrentView('buyer');
        setSelectedSeller(null);
        setLoading(false);
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        return;
      }

      setLoading(true);
      profileLoadTimer = window.setTimeout(() => {
        console.error(`Timed out loading profile for UID: ${nextUser.uid}`);
        useBuyerFallback('Your account profile took too long to load. Buyer access is available while you retry.');
      }, 12000);

      unsubscribeProfile = onSnapshot(
        doc(db, 'users', nextUser.uid),
        (profile) => {
          clearProfileLoadTimer();
          try {
            if (!profile.exists()) {
              console.error(`User profile not found for UID: ${nextUser.uid}`);
              useBuyerFallback('We could not load your profile, so you have been signed in as a buyer.');
              return;
            }

            const nextProfileData = profile.data() || {};
            const userPermissions = normalizePermissions(nextProfileData.permissions ?? nextProfileData);

            setProfileData(nextProfileData);
            setPermissions(userPermissions);
            setCurrentView((current) => {
              if (canAccessView(userPermissions, current)) {
                return current;
              }
              return getDefaultView(userPermissions);
            });

            if (!userPermissions.admin && !userPermissions.seller) {
              setSelectedSeller(null);
            }
            setError('');
            setLoading(false);
          } catch (profileError) {
            console.error('Unable to process account profile', profileError);
            useBuyerFallback('We could not process your profile, so you have been signed in as a buyer.');
          }
        },
        (err) => {
          console.error('PROFILE LOAD FAILED', err);
          useBuyerFallback('We could not load your profile, so you have been signed in as a buyer.');
        }
      );
    });

    return () => {
      unsubscribeAuth();
      clearProfileLoadTimer();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  useEffect(() => {
    if (!user || !permissions) return undefined;

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

      // Buyer mode reuses the existing buyer app with approved listings plus the
      // signed-in account's own activity records.
      if (currentView === 'buyer') {
        if (name === 'projects') return query(ref, where('status', 'in', ['approved', 'Active']));
        return query(ref, where('createdBy', '==', user.uid));
      }

      // Seller view
      if (currentView === 'seller') return query(ref, where(name === 'projects' ? 'ownerId' : 'projectOwnerId', '==', user.uid));

      return ref;
    };

    const unsubscribers = collections.map((name) => onSnapshot(
      sourceFor(name),
      (snapshot) => setData((current) => ({
        ...current,
        [name]: snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      })),
      () => setError('Unable to sync live data. Check your Firestore security rules and connection.')
    ));

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [user, permissions, currentView, selectedSeller]);

  const createRecord = async (name, record) => {
    try {
      return await addDoc(collection(db, name), { ...record, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    } catch (saveError) {
      setError('We could not save that change. Please try again.');
      throw saveError;
    }
  };

  const updateRecord = async (name, id, changes) => {
    try {
      await updateDoc(doc(db, name, id), { ...changes, updatedAt: serverTimestamp() });
    } catch {
      setError('We could not save that change. Please try again.');
    }
  };

  const addLead = (lead) => createRecord('leads', lead);
  const updateLead = (lead) => updateRecord('leads', lead.id, lead);
  const addVisit = (visit) => createRecord('visits', visit);
  const addCashback = (cashback) => createRecord('cashbacks', cashback);
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

  const handleSelectedSellerChange = useCallback((changes) => {
    setSelectedSeller((current) => (current ? { ...current, ...changes } : current));
  }, []);

  if (loading) return <div className="app-loading">Loading Druvio…</div>;
  if (user && !permissions) return <div className="app-loading">Loading account…</div>;
  if (!user) {
    return (
      <LoginScreen
        onLogin={(signedInUser, signedInPermissions) => {
          const normalizedPermissions = normalizePermissions(signedInPermissions);
          setUser(signedInUser);
          setPermissions(normalizedPermissions);
          setCurrentView(getDefaultView(normalizedPermissions));
          setSelectedSeller(null);
          setLoading(false);
        }}
      />
    );
  }

  const profileName = user.displayName || user.phoneNumber || user.email || 'User';
  const profileInitial = profileName.trim().charAt(0).toUpperCase() || 'U';

  const content = currentView === 'admin'
    ? (
      <AdminPanel
        projects={data.projects}
        updateProject={updateProject}
        user={user}
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
        onSwitchToAdmin={handleAdminSwitchToAdmin}
        onSwitchToBuyer={handleAdminSwitchToBuyer}
        onSwitchToSeller={handleAdminSwitchToSeller}
        onSelectSeller={handleAdminSelectSeller}
      />
    )
    : currentView === 'seller'
      ? (
        permissions?.admin && !selectedSeller
          ? (
            <AdminPanel
              projects={data.projects}
              updateProject={updateProject}
              user={user}
              initialTab="seller_selection"
              isDarkMode={isDarkMode}
              onThemeToggle={toggleTheme}
              onSwitchToAdmin={handleAdminSwitchToAdmin}
              onSwitchToBuyer={handleAdminSwitchToBuyer}
              onSwitchToSeller={handleAdminSwitchToSeller}
              onSelectSeller={handleAdminSelectSeller}
            />
          )
          : (
            <SellerDashboard
              {...data}
              user={user}
              updateProject={updateProject}
              addProject={addProject}
              isAdminView={Boolean(permissions?.admin && selectedSeller)}
              selectedSeller={selectedSeller}
              onBackToAdmin={handleBackToAdmin}
              onSelectedSellerChange={handleSelectedSellerChange}
            />
          )
      )
      : (
        <BuyerErrorBoundary>
          <BuyerApp
            {...data}
            user={user}
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
          />
        </BuyerErrorBoundary>
      );

  const headerViewLabel = permissions?.admin && currentView === 'seller' && selectedSeller
    ? `${selectedSeller.displayName || selectedSeller.name || selectedSeller.businessName || 'seller'}`
    : currentView;

  return (
    <main className={`live-app ${currentView === 'buyer' ? 'buyer-experience' : 'backoffice-experience'}`}>
      {currentView !== 'buyer' && (
        <header className="live-app-header">
          <div className="brand-lockup"><MapPin size={21} /><strong>Druvio</strong><span>{headerViewLabel}</span></div>
          <ProfileDropdown
            user={user}
            onThemeToggle={toggleTheme}
            isDarkMode={isDarkMode}
            permissions={permissions}
            currentView={currentView}
            onViewChange={handleViewChange}
            onBackToAdmin={handleBackToAdmin}
            selectedSeller={selectedSeller}
          />
        </header>
      )}
      {error && <div className="app-error" role="alert">{error}</div>}
      <section className="live-app-content">{content}</section>
    </main>
  );
}

export default App;
