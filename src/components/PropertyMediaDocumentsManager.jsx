import React, { useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Maximize2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { formatDocumentDate, normalizeProjectDocuments } from '../utils/projectDocuments';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar', 'png', 'jpg', 'jpeg']);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 15 * 1024 * 1024;

const idFor = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const extensionFor = (name = '') => name.split('.').pop()?.toLowerCase() || '';
const safeFileName = (name = 'file') => name.replace(/[^a-zA-Z0-9._-]/g, '-');
const fileLabel = (bytes = 0) => {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
const getImageSize = (file) => new Promise((resolve) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    resolve({ width: image.naturalWidth, height: image.naturalHeight });
    URL.revokeObjectURL(url);
  };
  image.onerror = () => {
    resolve({ width: 0, height: 0 });
    URL.revokeObjectURL(url);
  };
  image.src = url;
});

export const normalizePropertyImages = (property) => {
  const legacy = [
    { url: property?.thumbnailUrl || property?.thumbnail, path: property?.thumbnailPath, isThumbnail: true },
    { url: property?.heroImage, path: property?.heroImagePath }
  ];
  // Once the canonical media array exists (including an empty array after the
  // last deletion), do not rehydrate removed images from legacy URL aliases.
  const source = Array.isArray(property?.media)
    ? property.media
    : [
        ...(Array.isArray(property?.galleryImages) ? property.galleryImages : []),
        ...(Array.isArray(property?.images) ? property.images : []),
        ...legacy
      ];
  const seen = new Set();
  return source
    .map((item, index) => typeof item === 'string'
      ? { id: `legacy-${index}`, downloadURL: item, displayOrder: index }
      : {
          ...item,
          id: item?.id || `legacy-${index}`,
          downloadURL: item?.downloadURL || item?.url || item?.imageUrl || '',
          storagePath: item?.storagePath || item?.path || '',
          displayOrder: Number.isFinite(Number(item?.displayOrder)) ? Number(item.displayOrder) : index,
          isThumbnail: item?.isThumbnail === true
        })
    .filter((item) => item.downloadURL && !seen.has(item.downloadURL) && seen.add(item.downloadURL))
    .sort((left, right) => Number(right.isThumbnail) - Number(left.isThumbnail) || left.displayOrder - right.displayOrder)
    .map((item, index) => ({ ...item, displayOrder: index, isThumbnail: index === 0 }));
};

const documentName = (document) =>
  document.displayName || document.title || document.label || (document.type && document.type !== 'other'
    ? document.type.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    : 'Property Document');

const documentIcon = (document) => {
  const type = `${document.fileType || document.contentType || extensionFor(document.fileName)}`.toLowerCase();
  if (type.includes('image') || ['png', 'jpg', 'jpeg'].includes(type)) return FileImage;
  if (type.includes('sheet') || type.includes('excel') || ['xls', 'xlsx'].includes(type)) return FileSpreadsheet;
  if (type.includes('pdf') || type.includes('word') || ['doc', 'docx', 'txt'].includes(type)) return FileText;
  return File;
};

function UploadTask({ item }) {
  return (
    <div className="property-upload-task" role="status">
      <span>{item.name}</span><strong>{Math.round(item.progress)}%</strong>
      <i><b style={{ width: `${item.progress}%` }} /></i>
    </div>
  );
}

export function InAppDocumentViewer({ document: activeDocument, onClose }) {
  if (!activeDocument) return null;
  const name = documentName(activeDocument);
  const type = `${activeDocument.contentType || activeDocument.mimeType || activeDocument.fileType || extensionFor(activeDocument.fileName)}`.toLowerCase();
  const isImage = type.includes('image') || ['png', 'jpg', 'jpeg', 'webp'].includes(type);
  const isText = type.includes('text') || type === 'txt';
  const isPDF = type.includes('pdf') || type === 'pdf' || name.toLowerCase().endsWith('.pdf');
  const sourceUrl = activeDocument.url || activeDocument.downloadURL;

  const isLocalUrl = (url) => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname.startsWith('192.168.') || parsed.hostname.startsWith('10.');
    } catch (e) {
      return false;
    }
  };

  const isLocal = isLocalUrl(sourceUrl);
  const useNativeViewer = isImage || isText || isPDF;

  // Use Google Docs viewer only for non-local, non-native (e.g. Office files like .docx, .xlsx) when we have a public sourceUrl
  const embeddedUrl = !useNativeViewer && sourceUrl && !isLocal
    ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(sourceUrl)}`
    : sourceUrl;

  return (
    <div className="document-viewer-overlay" role="dialog" aria-modal="true" aria-labelledby="property-document-title">
      <div className="document-viewer-shell">
        <div className="document-viewer-header">
          <div><span>Document preview</span><h3 id="property-document-title">{name}</h3></div>
          <button type="button" onClick={onClose} aria-label="Close document viewer"><X size={19} /></button>
        </div>
        <div className="document-viewer-content">
          {isImage ? (
            <img src={sourceUrl} alt={name} />
          ) : isPDF || isText ? (
            <iframe src={sourceUrl} title={name} />
          ) : !isLocal && sourceUrl ? (
            <iframe src={embeddedUrl} title={name} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: '#64748b', padding: '2rem', textAlign: 'center' }}>
              <FileText size={48} />
              <p style={{ margin: 0, fontSize: '0.95rem' }}>Preview is not available for this document type on local servers.</p>
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6', color: '#ffffff', padding: '0.625rem 1.25rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 500, transition: 'background 0.2s' }}>
                Open / Download Document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ImageLightbox({ images, initialIndex = 0, onClose, canManage = false, onDelete, onReplace }) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const touchRef = useRef(null);
  const active = images[index];
  if (!active) return null;
  const move = (direction) => {
    setIndex((current) => (current + direction + images.length) % images.length);
    setZoom(1);
  };
  const onTouchStart = (event) => {
    const touches = [...event.touches];
    touchRef.current = touches.length === 2
      ? { distance: Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY), zoom }
      : { x: touches[0]?.clientX };
  };
  const onTouchMove = (event) => {
    if (event.touches.length === 2 && touchRef.current?.distance) {
      const touches = [...event.touches];
      const distance = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
      setZoom(Math.min(4, Math.max(1, touchRef.current.zoom * distance / touchRef.current.distance)));
    }
  };
  const onTouchEnd = (event) => {
    if (touchRef.current?.x && event.changedTouches[0]) {
      const delta = event.changedTouches[0].clientX - touchRef.current.x;
      if (Math.abs(delta) > 60) move(delta > 0 ? -1 : 1);
    }
    touchRef.current = null;
  };
  return (
    <div className="property-image-lightbox" role="dialog" aria-modal="true" aria-label="Image preview"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
        if (event.key === 'ArrowLeft') move(-1);
        if (event.key === 'ArrowRight') move(1);
      }}
      ref={(node) => node?.focus()}>
      <div className="property-lightbox-toolbar">
        <span>{index + 1} / {images.length}</span>
        <div>
          <button type="button" onClick={() => setZoom((value) => Math.max(1, value - .5))} aria-label="Zoom out"><ZoomOut /></button>
          <button type="button" onClick={() => setZoom((value) => Math.min(4, value + .5))} aria-label="Zoom in"><ZoomIn /></button>
          {canManage && <button type="button" onClick={() => onReplace(active)} aria-label="Replace image"><RefreshCw /></button>}
          {canManage && <button type="button" onClick={() => onDelete(active)} aria-label="Delete image"><Trash2 /></button>}
          <button type="button" onClick={onClose} aria-label="Close image preview"><X /></button>
        </div>
      </div>
      {images.length > 1 && <button type="button" className="property-lightbox-previous" onClick={() => move(-1)} aria-label="Previous image"><ChevronLeft /></button>}
      <div className="property-lightbox-stage" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <img src={active.downloadURL || active.url || active} alt="" style={{ transform: `scale(${zoom})` }} />
      </div>
      {images.length > 1 && <button type="button" className="property-lightbox-next" onClick={() => move(1)} aria-label="Next image"><ChevronRight /></button>}
    </div>
  );
}

export default function PropertyMediaDocumentsManager({ property, user, onChange }) {
  const [uploadTasks, setUploadTasks] = useState([]);
  const [error, setError] = useState('');
  const [draggingImageId, setDraggingImageId] = useState('');
  const [previewIndex, setPreviewIndex] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [dragActive, setDragActive] = useState('');
  const imageInputRef = useRef(null);
  const replaceImageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const replaceDocumentInputRef = useRef(null);
  const replaceTargetRef = useRef(null);

  const images = useMemo(() => normalizePropertyImages(property), [property]);
  const documents = useMemo(() => normalizeProjectDocuments(property)
    .sort((left, right) => (left.displayOrder || 0) - (right.displayOrder || 0)), [property]);

  const persist = async (changes) => {
    await updateDoc(doc(db, 'projects', property.id), {
      ...changes,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid
    });
    onChange?.({ ...property, ...changes });
  };

  const imageChangesFor = (nextImages) => {
    const normalized = nextImages.map((image, index) => ({ ...image, displayOrder: index, isThumbnail: index === 0 }));
    const first = normalized[0];
    return {
      media: normalized,
      images: normalized.map((image) => image.downloadURL),
      galleryImages: normalized.map((image) => image.downloadURL),
      thumbnail: first?.downloadURL || '',
      thumbnailUrl: first?.downloadURL || '',
      thumbnailPath: first?.storagePath || '',
      heroImage: first?.downloadURL || '',
      heroImagePath: first?.storagePath || ''
    };
  };

  const persistImages = async (nextImages) => {
    await persist(imageChangesFor(nextImages));
  };

  const updateTask = (id, changes) => setUploadTasks((current) =>
    current.map((task) => task.id === id ? { ...task, ...changes } : task));

  const uploadImage = async (file, replacing = null, persistResult = true) => {
    const taskId = idFor();
    const previewUrl = URL.createObjectURL(file);
    setUploadTasks((current) => [...current, { id: taskId, name: file.name, progress: 0, previewUrl, kind: 'image' }]);
    const dimensions = await getImageSize(file);
    const assetId = replacing?.id && !String(replacing.id).startsWith('legacy-') ? replacing.id : idFor();
    const assetRef = ref(storage, `project-media/${user.uid}/${property.id}/${assetId}-${safeFileName(file.name)}`);
    try {
      const task = uploadBytesResumable(assetRef, file, {
        contentType: file.type,
        customMetadata: { projectId: property.id, uploadedBy: user.uid, kind: 'gallery' }
      });
      const snapshot = await new Promise((resolve, reject) => task.on('state_changed',
        ({ bytesTransferred, totalBytes }) => updateTask(taskId, { progress: totalBytes ? bytesTransferred / totalBytes * 100 : 0 }),
        reject,
        () => resolve(task.snapshot)));
      const downloadURL = await getDownloadURL(snapshot.ref);
      const uploaded = {
        id: assetId,
        storagePath: snapshot.ref.fullPath,
        downloadURL,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.uid,
        displayOrder: replacing ? replacing.displayOrder : images.length,
        isThumbnail: replacing ? replacing.isThumbnail : images.length === 0,
        width: dimensions.width,
        height: dimensions.height,
        fileSize: file.size,
        mimeType: file.type
      };
      if (persistResult) {
        const nextImages = replacing
          ? images.map((image) => image.id === replacing.id ? uploaded : image)
          : [...images, uploaded];
        await persistImages(nextImages);
        if (replacing?.storagePath && replacing.storagePath !== snapshot.ref.fullPath) {
          await deleteObject(ref(storage, replacing.storagePath)).catch(() => undefined);
        }
      }
      return uploaded;
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadTasks((current) => current.filter((task) => task.id !== taskId));
    }
  };

  const acceptImages = async (files, replacing = null) => {
    setError('');
    const selected = [...files];
    const invalid = selected.find((file) => !IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_SIZE);
    if (invalid) {
      setError('Photos must be JPG, JPEG, PNG, or WEBP and no larger than 10 MB.');
      return;
    }
    try {
      if (replacing) await uploadImage(selected[0], replacing);
      else {
        const uploaded = await Promise.all(selected.map((file) => uploadImage(file, null, false)));
        await persistImages([...images, ...uploaded]);
      }
    } catch (uploadError) {
      console.error('Property photo upload failed:', uploadError);
      setError('One or more photos could not be uploaded. Please try again.');
    }
  };

  const deleteImage = async (image) => {
    if (!window.confirm('Delete this photo?')) return;
    const nextImages = images.filter((item) => item.id !== image.id);
    const nextChanges = imageChangesFor(nextImages);
    const previousChanges = imageChangesFor(images);
    const projectRef = doc(db, 'projects', property.id);
    let firestoreUpdated = false;

    // Remove immediately from the editor. If either persistent operation fails,
    // the previous state and metadata are restored.
    onChange?.({ ...property, ...nextChanges });
    setPreviewIndex(null);
    setError('');

    try {
      await updateDoc(projectRef, {
        ...nextChanges,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid
      });
      firestoreUpdated = true;

      if (image.storagePath) {
        try {
          await deleteObject(ref(storage, image.storagePath));
        } catch (storageError) {
          // A previously removed object should not block metadata cleanup.
          if (storageError?.code !== 'storage/object-not-found') throw storageError;
        }
      }

      if (import.meta.env.DEV) {
        const snapshot = await getDoc(projectRef);
        const storedMedia = snapshot.exists() && Array.isArray(snapshot.data().media) ? snapshot.data().media : [];
        console.info('[Druvio Media] Image deletion completed', {
          propertyId: property.id,
          imageId: image.id,
          storagePath: image.storagePath || '',
          downloadURL: image.downloadURL || '',
          firestoreDocument: `projects/${property.id}`,
          imagesRemaining: storedMedia.length,
          thumbnailId: storedMedia.find((item) => item.isThumbnail)?.id || null
        });
      }
    } catch (deleteError) {
      console.error('[Druvio Media] Image deletion failed', {
        propertyId: property.id,
        imageId: image.id,
        storagePath: image.storagePath || '',
        downloadURL: image.downloadURL || '',
        firebaseError: deleteError
      });

      if (firestoreUpdated) {
        try {
          await updateDoc(projectRef, {
            ...previousChanges,
            updatedAt: new Date().toISOString(),
            updatedBy: user.uid
          });
        } catch (rollbackError) {
          console.error('[Druvio Media] Image deletion rollback failed', {
            propertyId: property.id,
            imageId: image.id,
            firebaseError: rollbackError
          });
        }
      }
      onChange?.(property);
      setError('The photo could not be deleted. The previous gallery has been restored.');
    }
  };

  const reorderImage = async (targetId) => {
    if (!draggingImageId || draggingImageId === targetId) return;
    const next = [...images];
    const from = next.findIndex((image) => image.id === draggingImageId);
    const to = next.findIndex((image) => image.id === targetId);
    next.splice(to, 0, next.splice(from, 1)[0]);
    setDraggingImageId('');
    try { await persistImages(next); } catch { setError('Photo order could not be saved.'); }
  };

  const persistDocuments = async (nextDocuments) => {
    const orderedDocuments = nextDocuments.map((item, index) => ({ ...item, displayOrder: index }));
    await persist({ documents: orderedDocuments });
    if (import.meta.env.DEV) {
      const storedSnapshot = await getDoc(doc(db, 'projects', property.id));
      const storedDocuments = storedSnapshot.exists() && Array.isArray(storedSnapshot.data().documents)
        ? storedSnapshot.data().documents
        : [];
      console.info('[Druvio Documents] Firestore metadata saved', {
        propertyId: property.id,
        firestoreDocument: `projects/${property.id}`,
        documentsFound: storedDocuments.length,
        documents: storedDocuments.map((item) => ({
          id: item.id,
          displayName: item.displayName,
          hasDownloadURL: Boolean(item.downloadURL || item.url),
          storagePath: item.storagePath || item.path,
          fileType: item.fileType,
          fileSize: item.fileSize || item.size,
          uploadedAt: item.uploadedAt,
          verified: item.verified === true || item.status === 'verified'
        }))
      });
    }
  };

  const uploadDocument = async (file, replacing = null, persistResult = true) => {
    const taskId = idFor();
    setUploadTasks((current) => [...current, { id: taskId, name: replacing ? documentName(replacing) : file.name, progress: 0, kind: 'document' }]);
    const assetId = replacing?.id || idFor();
    const assetRef = ref(storage, `project-documents/${user.uid}/${property.id}/${assetId}-${safeFileName(file.name)}`);
    try {
      const task = uploadBytesResumable(assetRef, file, {
        contentType: file.type || 'application/octet-stream',
        customMetadata: { projectId: property.id, uploadedBy: user.uid, documentType: replacing?.type || 'other' }
      });
      const snapshot = await new Promise((resolve, reject) => task.on('state_changed',
        ({ bytesTransferred, totalBytes }) => updateTask(taskId, { progress: totalBytes ? bytesTransferred / totalBytes * 100 : 0 }),
        reject,
        () => resolve(task.snapshot)));
      const url = await getDownloadURL(snapshot.ref);
      const now = new Date().toISOString();
      const uploaded = {
        ...(replacing || {}),
        id: assetId,
        type: replacing?.type || 'other',
        url,
        downloadURL: url,
        path: snapshot.ref.fullPath,
        storagePath: snapshot.ref.fullPath,
        displayName: replacing ? documentName(replacing) : file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '),
        originalFileName: file.name,
        fileName: file.name,
        fileType: extensionFor(file.name).toUpperCase(),
        contentType: file.type || 'application/octet-stream',
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        fileSize: file.size,
        uploadedBy: replacing?.uploadedBy || user.uid,
        uploadedAt: replacing?.uploadedAt || now,
        lastUpdated: now,
        updatedAt: now,
        displayOrder: replacing?.displayOrder ?? documents.length,
        // This manager is available only in the authenticated Admin Property
        // Editor, so documents uploaded or replaced here are admin-approved.
        verified: true,
        status: 'verified'
      };
      if (persistResult) {
        await persistDocuments(replacing
          ? documents.map((item) => item.id === replacing.id ? uploaded : item)
          : [...documents, uploaded]);
        if (replacing?.path && replacing.path !== snapshot.ref.fullPath) {
          await deleteObject(ref(storage, replacing.path)).catch(() => undefined);
        }
      }
      return uploaded;
    } finally {
      setUploadTasks((current) => current.filter((task) => task.id !== taskId));
    }
  };

  const acceptDocuments = async (files, replacing = null) => {
    setError('');
    const selected = [...files];
    const invalid = selected.find((file) => !DOCUMENT_EXTENSIONS.has(extensionFor(file.name)) || file.size > MAX_DOCUMENT_SIZE);
    if (invalid) {
      setError('Documents must use a supported format and be no larger than 15 MB.');
      return;
    }
    try {
      if (replacing) await uploadDocument(selected[0], replacing);
      else {
        const uploaded = await Promise.all(selected.map((file) => uploadDocument(file, null, false)));
        await persistDocuments([...documents, ...uploaded]);
      }
    } catch (uploadError) {
      console.error('Property document upload failed:', uploadError);
      setError('One or more documents could not be uploaded. Please try again.');
    }
  };

  const renameDocument = async (document) => {
    const value = window.prompt('Document display name', documentName(document))?.trim();
    if (!value || value === documentName(document)) return;
    try {
      await persistDocuments(documents.map((item) => item.id === document.id
        ? { ...item, displayName: value, lastUpdated: new Date().toISOString() }
        : item));
    } catch { setError('The document name could not be updated.'); }
  };

  const deleteDocument = async (document) => {
    if (!window.confirm(`Delete “${documentName(document)}”?`)) return;
    try {
      if (document.path) await deleteObject(ref(storage, document.path));
      await persistDocuments(documents.filter((item) => item.id !== document.id));
      setDocumentPreview(null);
    } catch (deleteError) {
      console.error('Property document deletion failed:', deleteError);
      setError('The document could not be deleted. No property metadata was changed.');
    }
  };

  const dropFiles = (event, kind) => {
    event.preventDefault();
    setDragActive('');
    if (kind === 'images') acceptImages(event.dataTransfer.files);
    else acceptDocuments(event.dataTransfer.files);
  };

  return (
    <div className="property-assets-manager">
      <section className={`property-assets-module ${dragActive === 'images' ? 'is-dragging' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setDragActive('images'); }}
        onDragLeave={() => setDragActive('')}
        onDrop={(event) => dropFiles(event, 'images')}>
        <div className="property-assets-heading">
          <div><h3>Media</h3><p>Upload property photos</p><small>JPG · JPEG · PNG · WEBP</small></div>
          <button type="button" className="btn-primary" onClick={() => imageInputRef.current?.click()}><Plus size={17} /> Add Photos</button>
          <input ref={imageInputRef} hidden type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => { acceptImages(event.target.files); event.target.value = ''; }} />
          <input ref={replaceImageInputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { if (event.target.files[0]) acceptImages(event.target.files, replaceTargetRef.current); event.target.value = ''; }} />
        </div>
        <div className="property-drop-hint"><Upload size={18} /> Drag photos here or use Add Photos</div>
        {uploadTasks.filter((task) => task.kind === 'image').map((task) => <UploadTask key={task.id} item={task} />)}
        {images.length ? (
          <div className="property-image-grid">
            {images.map((image, index) => (
              <article key={image.id} className="property-image-card" draggable
                onDragStart={() => setDraggingImageId(image.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => reorderImage(image.id)}>
                <button type="button" className="property-image-preview" onClick={() => setPreviewIndex(index)} aria-label={`Preview photo ${index + 1}`}>
                  <img src={image.downloadURL} alt="" loading="lazy" />
                  <Maximize2 size={18} />
                </button>
                <div className="property-image-actions">
                  <button type="button" onClick={() => { replaceTargetRef.current = image; replaceImageInputRef.current?.click(); }}>Replace</button>
                  <button type="button" onClick={() => deleteImage(image)}>Delete</button>
                </div>
                {index === 0 && <span className="property-thumbnail-badge">Thumbnail</span>}
              </article>
            ))}
          </div>
        ) : <div className="property-assets-empty">No property photos uploaded yet.</div>}
      </section>

      <section className={`property-assets-module ${dragActive === 'documents' ? 'is-dragging' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setDragActive('documents'); }}
        onDragLeave={() => setDragActive('')}
        onDrop={(event) => dropFiles(event, 'documents')}>
        <div className="property-assets-heading">
          <div><h3>Documents</h3><p>Upload legal documents and brochures</p><small>PDF · DOC · DOCX · XLS · XLSX · TXT · ZIP · RAR · PNG · JPG · JPEG</small></div>
          <button type="button" className="btn-secondary" onClick={() => documentInputRef.current?.click()}><Plus size={17} /> Upload Documents</button>
          <input ref={documentInputRef} hidden type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.png,.jpg,.jpeg" onChange={(event) => { acceptDocuments(event.target.files); event.target.value = ''; }} />
          <input ref={replaceDocumentInputRef} hidden type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.png,.jpg,.jpeg" onChange={(event) => { if (event.target.files[0]) acceptDocuments(event.target.files, replaceTargetRef.current); event.target.value = ''; }} />
        </div>
        <div className="property-drop-hint"><Upload size={18} /> Drag documents here or use Upload Documents</div>
        {uploadTasks.filter((task) => task.kind === 'document').map((task) => <UploadTask key={task.id} item={task} />)}
        {documents.length ? (
          <div className="property-document-list">
            {documents.map((item) => {
              const Icon = documentIcon(item);
              return (
                <article className="property-document-row" key={item.id || `${item.url}-${item.displayOrder}`}>
                  <Icon className="property-document-icon" size={22} />
                  <div className="property-document-name"><strong>{documentName(item)}</strong><small>{item.fileType || extensionFor(item.fileName).toUpperCase() || 'FILE'}</small></div>
                  <span>{fileLabel(item.fileSize || item.size)}</span>
                  <span>{formatDocumentDate(item.uploadedAt) || '—'}</span>
                  <div className="property-document-actions">
                    <button type="button" onClick={() => setDocumentPreview(item)}>Preview</button>
                    <button type="button" onClick={() => renameDocument(item)}><Pencil size={15} /> Rename</button>
                    <button type="button" onClick={() => { replaceTargetRef.current = item; replaceDocumentInputRef.current?.click(); }}><RefreshCw size={15} /> Replace</button>
                    <button type="button" onClick={() => deleteDocument(item)}><Trash2 size={15} /> Delete</button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <div className="property-assets-empty">No documents uploaded yet.</div>}
      </section>
      {error && <p className="property-assets-error" role="alert">{error}</p>}
      {previewIndex !== null && <ImageLightbox images={images} initialIndex={previewIndex} onClose={() => setPreviewIndex(null)} canManage onDelete={deleteImage} onReplace={(image) => { replaceTargetRef.current = image; replaceImageInputRef.current?.click(); }} />}
      <InAppDocumentViewer document={documentPreview} onClose={() => setDocumentPreview(null)} />
    </div>
  );
}
