import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { LogOut, MapPin } from 'lucide-react';
import BuyerApp from './components/BuyerApp';
import SellerDashboard from './components/SellerDashboard';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/LoginScreen';
import { auth, db } from './firebaseConfig';

const collections = ['projects', 'leads', 'visits', 'cashbacks'];

function Avatar({ user, size = 36 }) {
  const [failed, setFailed] = useState(false);
  const label = user.displayName || user.phoneNumber || user.email || 'Account';
  const initials = (user.displayName || user.email || user.phoneNumber || '?').trim().charAt(0).toUpperCase();
  const sizing = { width: size, height: size, fontSize: Math.round(size * 0.42) };

  if (user.photoURL && !failed) {
    return (
      <img
        className="avatar-img"
        style={sizing}
        src={user.photoURL}
        alt={label}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }
  return <span className="avatar-fallback" style={sizing}>{initials}</span>;
}

function AccountMenu({ user }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const label = user.displayName || user.phoneNumber || user.email || 'Account';

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        type="button"
        className="avatar-button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <Avatar user={user} size={38} />
      </button>
      {open && (
        <div className="account-dropdown" role="menu">
          <div className="account-dropdown-header">
            <Avatar user={user} size={42} />
            <div className="account-dropdown-meta">
              <strong>{label}</strong>
              {user.email && <span>{user.email}</span>}
            </div>
          </div>
          <button type="button" className="account-dropdown-action" role="menuitem" onClick={() => signOut(auth)}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({ projects: [], leads: [], visits: [], cashbacks: [] });

  useEffect(() => onAuthStateChanged(auth, async (nextUser) => {
    setUser(nextUser);
    if (!nextUser) {
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await getDoc(doc(db, 'users', nextUser.uid));
      setRole(profile.data()?.role || 'buyer');
    } catch {
      setError('Unable to load your account profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }), []);

  useEffect(() => {
    if (!user || !role) return undefined;

    const sourceFor = (name) => {
      const ref = collection(db, name);
      if (role === 'admin' || name === 'projects' && role === 'buyer') return ref;
      if (role === 'seller') return query(ref, where(name === 'projects' ? 'ownerId' : 'projectOwnerId', '==', user.uid));
      return query(ref, where('createdBy', '==', user.uid));
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
  }, [user, role]);

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
  const addProject = (project) => createRecord('projects', { ...project, ownerId: user.uid });
  const updateProject = (project) => updateRecord('projects', project.id, project);
  const updateCashbackStatus = async (id, status) => {
    await updateRecord('cashbacks', id, { status });
    if (status === 'Approved') {
      const claim = data.cashbacks.find((item) => item.id === id);
      const lead = claim && data.leads.find((item) => item.phone === claim.buyerPhone);
      if (lead) await updateLead({ ...lead, stage: 'Purchased' });
    }
  };

  if (loading) return <div className="app-loading">Loading Druvio…</div>;
  if (user && !role) return <div className="app-loading">Loading account…</div>;
  if (!user) return <LoginScreen onLogin={(signedInUser, signedInRole) => { setUser(signedInUser); setRole(signedInRole); }} />;

  const content = role === 'admin'
    ? <AdminPanel {...data} updateCashbackStatus={updateCashbackStatus} addProject={addProject} />
    : role === 'seller'
      ? <SellerDashboard {...data} updateProject={updateProject} addProject={addProject} />
      : <BuyerApp {...data} addLead={addLead} updateLead={updateLead} addVisit={addVisit} addCashback={addCashback} />;

  return (
    <main className={`live-app ${role === 'buyer' ? 'buyer-experience' : 'backoffice-experience'}`}>
      <header className="live-app-header">
        <div className="brand-lockup"><MapPin size={21} /><strong>Druvio</strong><span>{role}</span></div>
        <AccountMenu user={user} />
      </header>
      {error && <div className="app-error" role="alert">{error}</div>}
      <section className="live-app-content">{content}</section>
    </main>
  );
}

export default App;
