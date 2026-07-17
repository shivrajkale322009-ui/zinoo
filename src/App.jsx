import React, { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
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
import SellerDashboard from './components/SellerDashboard';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/LoginScreen';
import ProfileDropdown from './components/ProfileDropdown';
import { auth, db } from './firebaseConfig';
import {
  canAccessView,
  DEFAULT_PERMISSIONS,
  getDefaultView,
  normalizePermissions
} from './utils/permissions';
import { withTimeout } from './utils/async';

const collections = ['projects', 'leads', 'visits', 'cashbacks'];

function App() {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [currentView, setCurrentView] = useState('buyer'); // 'buyer', 'seller', 'admin'
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({ projects: [], leads: [], visits: [], cashbacks: [] });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const handleViewChange = useCallback((nextView) => {
    if (!permissions) return;
    const resolvedView = canAccessView(permissions, nextView)
      ? nextView
      : getDefaultView(permissions);

    setCurrentView(resolvedView);
    if (resolvedView !== 'seller') {
      setSelectedSeller(null);
    }
  }, [permissions]);

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
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

      unsubscribeProfile = onSnapshot(
        doc(db, 'users', nextUser.uid),
        (profile) => {
          if (!profile.exists()) {
            console.error(`User profile not found for UID: ${nextUser.uid}`);
            setPermissions(DEFAULT_PERMISSIONS);
            setCurrentView('buyer');
            setSelectedSeller(null);
            setError('We could not load your profile, so you have been signed in as a buyer.');
            setLoading(false);
            return;
          }

          const profileData = profile.data();
          const userPermissions = normalizePermissions(profileData.permissions ?? profileData);

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
          setLoading(false);
        },
        (err) => {
          console.error('PROFILE LOAD FAILED', err);
          alert(err?.message);
          setPermissions(DEFAULT_PERMISSIONS);
          setCurrentView('buyer');
          setSelectedSeller(null);
          setError('We could not load your profile, so you have been signed in as a buyer.');
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
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
        if (name === 'projects') return ref;
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
      await addDoc(collection(db, name), { ...record, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    } catch {
      setError('We could not save that change. Please try again.');
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
  const addProject = (project) => createRecord('projects', {
    ...project,
    ownerId: selectedSeller?.id || user.uid,
    status: permissions?.admin && currentView === 'seller' && selectedSeller ? 'approved' : 'pending_review',
    createdByAdmin: Boolean(permissions?.admin && currentView === 'seller' && selectedSeller)
  });
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

  const handleAdminSelectSeller = useCallback((seller) => {
    setSelectedSeller({ ...seller, uid: seller.uid || seller.id });
    setCurrentView('seller');
  }, []);

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
              updateProject={updateProject}
              addProject={addProject}
              isAdminView={Boolean(permissions?.admin && selectedSeller)}
              selectedSeller={selectedSeller}
              onBackToAdmin={handleBackToAdmin}
              onSelectedSellerChange={handleSelectedSellerChange}
            />
          )
      )
      : <BuyerApp {...data} addLead={addLead} updateLead={updateLead} addVisit={addVisit} addCashback={addCashback} isAdmin={Boolean(permissions?.admin)} />;

  const headerViewLabel = permissions?.admin && currentView === 'seller' && selectedSeller
    ? `${selectedSeller.displayName || selectedSeller.name || selectedSeller.businessName || 'seller'}`
    : currentView;

  return (
    <main className={`live-app ${currentView === 'buyer' ? 'buyer-experience' : 'backoffice-experience'}`}>
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
      {error && <div className="app-error" role="alert">{error}</div>}
      <section className="live-app-content">{content}</section>
    </main>
  );
}

export default App;
