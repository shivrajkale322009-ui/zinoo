import { useEffect, useMemo, useRef, useState } from 'react';
import { collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, runTransaction, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import SearchBar from './ui/SearchBar';
import { BadgeCheck, CloudUpload, GripVertical, Plus, Save, Search, Trash2, UserPlus, X } from 'lucide-react';
import { auth, db, functions } from '../firebaseConfig';

const blank = { sellerId: '', logo: '', experienceYears: 0, completedProjects: 0, activeProjects: 0, upcomingProjects: 0, verified: false, isFeatured: true, isActive: true };
const logoPath = (url) => { try { return decodeURIComponent(new URL(url).pathname.split('/o/')[1] || ''); } catch { return ''; } };
const writeFields = (source) => ({
  sellerId: String(source.sellerId || ''),
  logo: String(source.logo || ''),
  experienceYears: Number(source.experienceYears),
  completedProjects: Number(source.completedProjects),
  activeProjects: Number(source.activeProjects),
  upcomingProjects: Number(source.upcomingProjects),
  verified: Boolean(source.verified),
  isFeatured: Boolean(source.isFeatured),
  isActive: Boolean(source.isActive)
});
const friendlySaveError = (error) => {
  if (error?.code === 'permission-denied') return 'Permission denied. You are not authorized to create Featured Developers.';
  if (error?.code === 'unauthenticated') return 'Your Admin session has expired. Sign in again.';
  if (String(error?.message || '').includes('already featured')) return 'This Seller is already a Featured Developer.';
  return error?.message || 'Unable to save Featured Developer.';
};

export default function FeaturedDeveloperManager({ onSuccess, onError }) {
  const [items, setItems] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [draft, setDraft] = useState(blank);
  const [editingId, setEditingId] = useState('');
  const [sellerSearch, setSellerSearch] = useState('');
  const [showSellerPicker, setShowSellerPicker] = useState(false);
  const [showNewSeller, setShowNewSeller] = useState(false);
  const [newSeller, setNewSeller] = useState({ name: '', email: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => onSnapshot(query(collection(db, 'featuredDevelopers'), orderBy('sortIndex', 'asc')), (snapshot) => setItems(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), () => onError('Unable to load featured developers.')), [onError]);
  useEffect(() => onSnapshot(query(collection(db, 'users'), where('permissions.seller', '==', true)), (snapshot) => setSellers(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => !item.permissions?.admin)), () => onError('Unable to load sellers.')), [onError]);

  const sellerName = (seller) => seller?.displayName || seller?.name || seller?.businessName || seller?.email || 'Unnamed Seller';
  const selectedSeller = sellers.find((seller) => seller.id === draft.sellerId);
  const filteredSellers = useMemo(() => sellers.filter((seller) => sellerName(seller).toLowerCase().includes(sellerSearch.toLowerCase()) || String(seller.email || '').toLowerCase().includes(sellerSearch.toLowerCase())), [sellers, sellerSearch]);
  const reset = () => { setDraft(blank); setEditingId(''); setSellerSearch(''); };

  const uploadLogo = async (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return onError('Logo must be PNG, JPG, or WEBP.');
    setBusy(true);
    try {
      const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); });
      const result = await httpsCallable(functions, 'manageFeaturedDeveloperLogo')({ action: 'upload', contentType: file.type, data });
      console.info('[Featured Developers] Storage upload complete.', { uid: auth.currentUser?.uid || null, downloadURL: result.data.imageUrl });
      const oldPath = logoPath(draft.logo);
      if (oldPath) await httpsCallable(functions, 'manageFeaturedDeveloperLogo')({ action: 'delete', storagePath: oldPath });
      setDraft((current) => ({ ...current, logo: result.data.imageUrl }));
    } catch (error) { console.error('[Featured Developers] Logo upload failed.', error); onError('Logo upload failed. Please choose a valid PNG, JPG, or WEBP image and try again.'); } finally { setBusy(false); }
  };

  const createSeller = async (event) => {
    event.preventDefault(); setBusy(true);
    try {
      const result = await httpsCallable(functions, 'createSellerAccount')(newSeller);
      const seller = { id: result.data.sellerId, displayName: result.data.sellerName, email: result.data.email, permissions: { seller: true } };
      setSellers((current) => [...current, seller]); setDraft((current) => ({ ...current, sellerId: seller.id })); setShowNewSeller(false); setShowSellerPicker(false); setNewSeller({ name: '', email: '', phone: '' }); onSuccess('Seller created and selected.');
    } catch (error) { console.error(error); onError(error?.message || 'Unable to create seller.'); } finally { setBusy(false); }
  };

  const save = async (event) => {
    event.preventDefault();
    if (!draft.sellerId) return onError('Select a Seller.');
    if (!draft.logo) return onError('Upload a Developer Logo before saving.');
    setBusy(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw Object.assign(new Error('Admin authentication is required.'), { code: 'unauthenticated' });
      const adminSnapshot = await getDoc(doc(db, 'users', currentUser.uid));
      const adminProfile = adminSnapshot.data() || {};
      const isAdmin = adminProfile.role === 'admin' || adminProfile.permissions?.admin === true;
      const path = `featuredDevelopers/${draft.sellerId}`;
      const cleanPayload = writeFields(draft);
      const invalidNumber = ['experienceYears', 'completedProjects', 'activeProjects', 'upcomingProjects'].some((field) => !Number.isInteger(cleanPayload[field]) || cleanPayload[field] < 0);
      if (invalidNumber) throw new Error('Project statistics must be valid non-negative whole numbers.');
      console.info('[Featured Developers] Save diagnostics.', {
        currentUser: { uid: currentUser.uid, email: currentUser.email || null },
        adminRole: { isAdmin, role: adminProfile.role || null, permissionAdmin: adminProfile.permissions?.admin === true },
        firestorePath: path,
        requestPayload: cleanPayload,
        storageUploadURL: cleanPayload.logo
      });
      if (!isAdmin) throw Object.assign(new Error('This account does not have the Admin role.'), { code: 'permission-denied' });
      const ref = doc(db, 'featuredDevelopers', draft.sellerId);
      await runTransaction(db, async (transaction) => {
        const existing = await transaction.get(ref);
        if (!editingId && existing.exists()) throw new Error('This seller is already featured.');
        if (editingId && editingId !== draft.sellerId) throw new Error('Seller cannot be changed while editing.');
        const payload = { ...cleanPayload, sortIndex: editingId ? items.find((item) => item.id === editingId)?.sortIndex || 0 : items.length, updatedAt: serverTimestamp() };
        if (editingId) transaction.update(ref, payload);
        else transaction.set(ref, { ...payload, createdAt: serverTimestamp() });
      });
      console.info('[Featured Developers] Firestore commit succeeded.', { uid: currentUser.uid, firestorePath: path });
      onSuccess(editingId ? 'Featured developer updated.' : 'Seller featured successfully.'); reset();
    } catch (error) {
      console.error('[Featured Developers] Firestore commit failed.', {
        uid: auth.currentUser?.uid || null,
        email: auth.currentUser?.email || null,
        firestorePath: draft.sellerId ? `featuredDevelopers/${draft.sellerId}` : null,
        code: error?.code || null,
        message: error?.message || String(error),
        error
      });
      onError(friendlySaveError(error));
    } finally { setBusy(false); }
  };

  const reorder = async (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) return setDragIndex(null);
    const next = [...items]; const [moved] = next.splice(dragIndex, 1); next.splice(targetIndex, 0, moved); setItems(next); setDragIndex(null);
    const batch = writeBatch(db); next.forEach((item, index) => batch.update(doc(db, 'featuredDevelopers', item.id), { sortIndex: index, updatedAt: serverTimestamp() }));
    try { await batch.commit(); onSuccess('Order updated.'); } catch { onError('Unable to save the new order.'); }
  };

  const toggle = async (item) => {
    try { const batch = writeBatch(db); batch.update(doc(db, 'featuredDevelopers', item.id), { isActive: !item.isActive, updatedAt: serverTimestamp() }); await batch.commit(); }
    catch { onError('Unable to update visibility.'); }
  };

  const remove = async (item) => {
    if (!window.confirm(`Remove ${sellerName(sellers.find((seller) => seller.id === item.sellerId))} from featured developers?`)) return;
    try { await deleteDoc(doc(db, 'featuredDevelopers', item.id)); const path = logoPath(item.logo); if (path) await httpsCallable(functions, 'manageFeaturedDeveloperLogo')({ action: 'delete', storagePath: path }); onSuccess('Featured developer deleted.'); }
    catch { onError('Unable to delete featured developer.'); }
  };

  return <div className="featured-developer-manager">
    <form className="admin-panel-section featured-developer-form" onSubmit={save}>
      <div className="featured-developer-form-head"><div><h3>{editingId ? 'Edit Featured Developer' : 'Add Featured Developer'}</h3><p>Feature an existing Zinoo Seller on the homepage.</p></div></div>
      <div className="featured-seller-row">
        <div className="featured-seller-picker"><label>Seller *</label><button type="button" className="featured-seller-select" onClick={() => setShowSellerPicker((value) => !value)}><Search size={17} /><span>{selectedSeller ? sellerName(selectedSeller) : 'Search seller...'}</span></button>
          {showSellerPicker && <div className="featured-seller-options"><SearchBar autoFocus value={sellerSearch} onChange={(event) => setSellerSearch(event.target.value)} placeholder="Search seller..." />{filteredSellers.map((seller) => <button type="button" key={seller.id} disabled={items.some((item) => item.sellerId === seller.id && item.id !== editingId)} onClick={() => { setDraft((current) => ({ ...current, sellerId: seller.id })); setShowSellerPicker(false); }}>{sellerName(seller)}<small>{seller.email}</small></button>)}</div>}
        </div>
        <button type="button" className="btn-secondary featured-add-seller" onClick={() => setShowNewSeller(true)}><UserPlus size={16} /> Add New Seller</button>
      </div>
      <div className="featured-developer-editor">
        <div className={`developer-logo-uploader ${draft.logo ? 'has-image' : ''}`} onClick={() => fileRef.current?.click()}>
          {draft.logo ? <img src={draft.logo} alt="Developer logo preview" /> : <><CloudUpload size={30} /><strong>Upload Developer Logo</strong><span>PNG, JPG or WEBP<br />Recommended 512×512</span></>}
          <input ref={fileRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadLogo(event.target.files?.[0])} />
        </div>
        <div className="developer-logo-actions">{draft.logo && <><button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>Replace</button><button type="button" className="btn-secondary" onClick={() => setDraft((current) => ({ ...current, logo: '' }))}>Remove</button></>}</div>
        <div className="featured-developer-fields compact">
          <label>Years Experience<input required type="number" min="0" max="150" value={draft.experienceYears} onChange={(event) => setDraft({ ...draft, experienceYears: Number(event.target.value) })} /></label>
          <label>Completed Projects<input required type="number" min="0" max="10000" value={draft.completedProjects} onChange={(event) => setDraft({ ...draft, completedProjects: Number(event.target.value) })} /></label>
          <label>Active Projects<input required type="number" min="0" max="10000" value={draft.activeProjects} onChange={(event) => setDraft({ ...draft, activeProjects: Number(event.target.value) })} /></label>
          <label>Upcoming Projects<input required type="number" min="0" max="10000" value={draft.upcomingProjects} onChange={(event) => setDraft({ ...draft, upcomingProjects: Number(event.target.value) })} /></label>
          <div className="featured-total-preview"><span>Total Projects</span><strong>{draft.completedProjects + draft.activeProjects + draft.upcomingProjects}</strong></div>
        </div>
      </div>
      <div className="featured-developer-switches"><label><input type="checkbox" checked={draft.verified} onChange={(event) => setDraft({ ...draft, verified: event.target.checked })} /> Verified</label><label><input type="checkbox" checked={draft.isFeatured} onChange={(event) => setDraft({ ...draft, isFeatured: event.target.checked })} /> Featured</label><label><input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} /> Active</label></div>
      <div className="featured-developer-form-actions">{editingId && <button type="button" className="btn-secondary" onClick={reset}>Cancel</button>}<button type="submit" className="btn-primary" disabled={busy || !draft.sellerId || !draft.logo}><Save size={16} /> {busy ? 'Saving…' : 'Save Featured Developer'}</button></div>
    </form>
    <section className="admin-panel-section"><h3>Featured Developers</h3><div className="featured-developer-admin-list premium">
      {items.map((item, index) => { const seller = sellers.find((entry) => entry.id === item.sellerId); return <article key={item.id} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorder(index)}><span className="featured-drag"><GripVertical /></span><img src={item.logo} alt="" /><div><strong>{sellerName(seller)}</strong><span>{item.experienceYears} yrs · {item.completedProjects} completed · {item.activeProjects} active · {item.upcomingProjects} upcoming</span><small>{item.verified && <><BadgeCheck size={12} /> Verified · </>}{item.isActive ? 'Visible' : 'Hidden'}</small></div><button type="button" className="btn-secondary" onClick={() => { setEditingId(item.id); setDraft({ ...blank, ...item }); }}>Edit</button><button type="button" className="btn-secondary" onClick={() => toggle(item)}>{item.isActive ? 'Hide' : 'Show'}</button><button type="button" className="btn-secondary feed-delete-button" onClick={() => remove(item)}><Trash2 size={15} /> Delete</button></article>; })}
      {!items.length && <p>No featured developers yet.</p>}
    </div></section>
    {showNewSeller && <div className="modal-overlay"><form className="modal-card featured-new-seller-modal" onSubmit={createSeller}><div className="modal-head"><h3>Add New Seller</h3><button type="button" onClick={() => setShowNewSeller(false)}><X /></button></div><label>Seller Name<input required value={newSeller.name} onChange={(event) => setNewSeller({ ...newSeller, name: event.target.value })} /></label><label>Email<input required type="email" value={newSeller.email} onChange={(event) => setNewSeller({ ...newSeller, email: event.target.value })} /></label><label>Phone<input value={newSeller.phone} onChange={(event) => setNewSeller({ ...newSeller, phone: event.target.value })} /></label><button type="submit" className="btn-primary" disabled={busy}><Plus size={16} /> Create Seller</button></form></div>}
  </div>;
}
