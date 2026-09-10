import React, { useEffect, useState } from 'react';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Plus, Save } from 'lucide-react';
import { db } from '../firebaseConfig';

export default function AmenityCatalogManager({ onSuccess, onError }) {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => onSnapshot(collection(db, 'amenityCatalog'), (snapshot) => {
    setItems(snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((left, right) => String(left.name).localeCompare(String(right.name))));
  }, onError), [onError]);

  const createAmenity = async (event) => {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName || items.some((item) => item.name?.trim().toLowerCase() === nextName.toLowerCase())) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'amenityCatalog'), {
        name: nextName,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setName('');
      onSuccess?.('Amenity added to the master catalog. It will not appear on a project until its seller selects it.');
    } catch (error) {
      onError?.(error);
    } finally {
      setSaving(false);
    }
  };

  const updateAmenity = async (item, changes) => {
    try {
      await updateDoc(doc(db, 'amenityCatalog', item.id), { ...changes, updatedAt: serverTimestamp() });
      onSuccess?.('Amenity catalog updated. Existing project selections keep their stable reference.');
    } catch (error) {
      onError?.(error);
    }
  };

  return (
    <div className="admin-settings-card amenity-catalog-manager">
      <div>
        <span className="admin-panel-kicker">Master amenities</span>
        <h3>Available project options</h3>
        <p>Sellers choose from this catalog. Adding an option here never adds it to an existing project.</p>
      </div>
      <form onSubmit={createAmenity} className="featured-seller-row">
        <input className="form-control" value={name} maxLength={80} onChange={(event) => setName(event.target.value)} placeholder="Amenity name" aria-label="New amenity name" />
        <button type="submit" className="btn-primary" disabled={saving || !name.trim()}><Plus size={16} /> Add amenity</button>
      </form>
      <div className="featured-developer-admin-list">
        {items.map((item) => (
          <article key={item.id}>
            <input className="form-control" defaultValue={item.name} maxLength={80} aria-label={`Amenity name ${item.name}`} onBlur={(event) => {
              const nextName = event.target.value.trim();
              if (nextName && nextName !== item.name) void updateAmenity(item, { name: nextName });
            }} />
            <span>{item.isActive === false ? 'Inactive' : 'Available to sellers'}</span>
            <button type="button" className="btn-secondary" onClick={() => updateAmenity(item, { isActive: item.isActive === false })}>
              <Save size={15} /> {item.isActive === false ? 'Activate' : 'Deactivate'}
            </button>
          </article>
        ))}
        {items.length === 0 && <p>No master amenities have been added yet.</p>}
      </div>
    </div>
  );
}
