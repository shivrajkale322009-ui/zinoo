import React, { useEffect, useRef, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, writeBatch } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { GripVertical, ImagePlus, Save, Trash2 } from 'lucide-react';
import { auth, db, firebaseProjectId, functions, storage } from '../firebaseConfig';
import ImageUploadCropper from './ImageUploadCropper';

const MAX_BANNERS = 5;
const MAX_SIZE = 10 * 1024 * 1024;

const revokePreview = (banner) => {
  if (banner?.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(banner.previewUrl);
};

export default function FeedBannerManager({ user, onSuccess, onError }) {
  const [saved, setSaved] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [busy, setBusy] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const cropTriggerRef = useRef(null);
  const replaceIndexRef = useRef(null);
  const draftsRef = useRef([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'feed'), orderBy('displayOrder', 'asc')), (snapshot) => {
      const next = snapshot.docs.map((item) => ({ id: item.id, ...item.data(), previewUrl: item.data().imageUrl }));
      setSaved(next);
      setDrafts((current) => current.some((item) => item.dirty) ? current : next);
    }, () => onError('Unable to load feed banners.'));
    return unsubscribe;
  }, [onError]);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => () => draftsRef.current.forEach(revokePreview), []);

  const stageFile = (file, index = null) => {
    if (!file) return;
    if (file.size > MAX_SIZE) {
      onError('The cropped banner is larger than 10 MB. Choose a smaller source image.');
      return;
    }
    const staged = {
      localId: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      fileName: file.name,
      size: file.size,
      width: 1600,
      height: 900,
      dirty: true,
      isActive: true
    };
    console.info('[Druvio Feed] Crop complete; banner staged.', {
      uid: auth.currentUser?.uid || null,
      file: { name: file.name, size: file.size, type: file.type },
      target: index === null ? 'new banner' : `replace banner ${index + 1}`
    });
    setDrafts((current) => {
      if (index === null) return [...current, staged];
      revokePreview(current[index]);
      const next = [...current];
      next[index] = { ...current[index], ...staged, id: current[index].id, oldStoragePath: current[index].storagePath || current[index].oldStoragePath };
      return next;
    });
  };

  const removeBanner = (index) => {
    if (!window.confirm('Delete this banner? It will be removed when you save changes.')) return;
    setDrafts((current) => {
      revokePreview(current[index]);
      return current.filter((_, itemIndex) => itemIndex !== index).map((item) => ({ ...item, dirty: true }));
    });
  };

  const reorder = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    setDrafts((current) => {
      const next = [...current];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next.map((item) => ({ ...item, dirty: true }));
    });
    setDragIndex(null);
  };

  const save = async () => {
    setBusy(true);
    const uploaded = [];
    const manageAsset = httpsCallable(functions, 'manageFeedBannerAsset');
    try {
      const authenticatedUser = auth.currentUser;
      if (!authenticatedUser || authenticatedUser.uid !== user?.uid) {
        console.error('[Druvio Feed] Upload blocked: authenticated admin session is unavailable.', {
          currentUser: authenticatedUser ? { uid: authenticatedUser.uid, email: authenticatedUser.email } : null,
          panelUserUid: user?.uid || null,
          projectId: firebaseProjectId,
          storageBucket: storage.app.options.storageBucket
        });
        throw new Error('Your authenticated admin session is unavailable. Sign in again before uploading banners.');
      }
      await authenticatedUser.getIdToken();

      const finalBanners = [];
      for (const item of drafts) {
        if (!item.file) {
          finalBanners.push(item);
          continue;
        }
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(',')[1]);
          reader.onerror = () => reject(reader.error || new Error('Unable to read the banner image.'));
          reader.readAsDataURL(item.file);
        });
        console.info('[Druvio Feed] Starting banner upload.', {
          currentUser: { uid: authenticatedUser.uid, email: authenticatedUser.email },
          projectId: firebaseProjectId,
          storageBucket: storage.app.options.storageBucket,
          uploadPath: 'feed-banners/{server-generated-uuid}',
          file: { name: item.file.name, size: item.file.size, type: item.file.type },
          metadata: { contentType: item.file.type, uploadedBy: authenticatedUser.uid }
        });
        const result = await manageAsset({ action: 'upload', contentType: item.file.type, data: base64 });
        console.info('[Druvio Feed] Cloud Function upload succeeded.', {
          uid: authenticatedUser.uid,
          storagePath: result.data.storagePath,
          hasDownloadUrl: Boolean(result.data.imageUrl)
        });
        uploaded.push(result.data.storagePath);
        finalBanners.push({ ...item, imageUrl: result.data.imageUrl, storagePath: result.data.storagePath });
      }

      const batch = writeBatch(db);
      const retainedIds = new Set();
      const committedBanners = [];
      finalBanners.forEach((item, index) => {
        const bannerRef = item.id ? doc(db, 'feed', item.id) : doc(collection(db, 'feed'));
        retainedIds.add(bannerRef.id);
        batch.set(bannerRef, {
          imageUrl: item.imageUrl,
          storagePath: item.storagePath,
          displayOrder: index + 1,
          isActive: true,
          createdAt: item.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        committedBanners.push({
          id: bannerRef.id,
          imageUrl: item.imageUrl,
          previewUrl: item.imageUrl,
          storagePath: item.storagePath,
          displayOrder: index + 1,
          isActive: true,
          createdAt: item.createdAt
        });
      });
      saved.filter((item) => !retainedIds.has(item.id)).forEach((item) => batch.delete(doc(db, 'feed', item.id)));
      console.info('[Druvio Feed] Starting Firestore feed batch.', {
        uid: authenticatedUser.uid,
        databaseId: db._databaseId?.database || 'default',
        writes: finalBanners.length,
        deletes: saved.filter((item) => !retainedIds.has(item.id)).length
      });
      await batch.commit();
      console.info('[Druvio Feed] Firestore feed batch succeeded.', {
        uid: authenticatedUser.uid,
        bannerCount: committedBanners.length
      });

      const obsoletePaths = [
        ...saved.filter((item) => !retainedIds.has(item.id)).map((item) => item.storagePath),
        ...finalBanners.map((item) => item.oldStoragePath)
      ].filter(Boolean);
      await Promise.allSettled(obsoletePaths.map((path) => manageAsset({ action: 'delete', storagePath: path })));
      drafts.forEach(revokePreview);
      setSaved(committedBanners);
      setDrafts(committedBanners);
      onSuccess('Feed banners saved successfully.');
    } catch (error) {
      await Promise.allSettled(uploaded.map((path) => manageAsset({ action: 'delete', storagePath: path })));
      console.error('[Druvio Feed] Save failed.', {
        currentUser: auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null,
        projectId: firebaseProjectId,
        storageBucket: storage.app.options.storageBucket,
        code: error?.code || null,
        message: error?.message || String(error),
        serverResponse: error?.customData?.serverResponse || null,
        error
      });
      onError(error?.code === 'storage/unauthorized' ? 'You do not have permission to upload feed banners.' : 'Unable to save feed banners. No live changes were applied.');
    } finally {
      setBusy(false);
    }
  };

  const hasChanges = drafts.length !== saved.length || drafts.some((item, index) =>
    item.dirty || item.id !== saved[index]?.id
  );

  return (
    <div className="feed-manager">
      <section className="admin-panel-section feed-manager-head">
        <div><h3>Feed Banners</h3><p>Maximum: 5 banners</p></div>
        <button type="button" className="btn-primary" disabled={busy || drafts.length >= MAX_BANNERS} onClick={() => { replaceIndexRef.current = null; cropTriggerRef.current?.(); }}>
          <ImagePlus size={17} /> Upload Banner
        </button>
      </section>

      <section className="admin-panel-section">
        <h3>Uploaded Banners</h3>
        {drafts.length === 0 ? <p className="feed-manager-empty">No banners uploaded. The Buyer Home carousel will remain hidden.</p> : (
          <div className="feed-banner-admin-list">
            {drafts.map((banner, index) => (
              <article
                key={banner.id || banner.localId}
                className="feed-banner-admin-card"
                draggable={!busy}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => reorder(index)}
              >
                <span className="feed-banner-drag" aria-label={`Drag banner ${index + 1}`}><GripVertical size={20} /></span>
                <div className="feed-banner-admin-preview"><img src={banner.previewUrl || banner.imageUrl} alt={`Banner ${index + 1} preview`} /></div>
                <div className="feed-banner-admin-meta">
                  <strong>Order #{index + 1}</strong><span>Status: Active</span>
                  <small>{banner.fileName || banner.storagePath?.split('/').pop() || 'Saved banner'}</small>
                  <small>{banner.size ? `${(banner.size / 1024).toFixed(0)} KB · ` : ''}{banner.width || 1600} × {banner.height || 900}</small>
                </div>
                <div className="feed-banner-admin-actions">
                  <button type="button" className="btn-secondary" disabled={busy} onClick={() => { replaceIndexRef.current = index; cropTriggerRef.current?.(); }}>Change Image</button>
                  <button type="button" className="btn-secondary feed-delete-button" disabled={busy} onClick={() => removeBanner(index)}><Trash2 size={16} /> Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="feed-manager-save">
        <button type="button" className="btn-primary" disabled={busy || !hasChanges} onClick={save}><Save size={17} /> {busy ? 'Saving…' : 'Save Changes'}</button>
      </div>

      <div className="feed-crop-stager">
        <ImageUploadCropper
          value=""
          aspect={16 / 9}
          maxSize={MAX_SIZE}
          triggerRef={cropTriggerRef}
          label="Banner"
          onUpload={(file) => {
            stageFile(file, replaceIndexRef.current);
            replaceIndexRef.current = null;
          }}
          onError={onError}
        />
      </div>
    </div>
  );
}
