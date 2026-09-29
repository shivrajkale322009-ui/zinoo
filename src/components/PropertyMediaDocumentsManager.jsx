import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Heart,
  Maximize2,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Share2,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { formatDocumentDate, getProjectDocumentPreviewKind, normalizeProjectDocuments } from '../utils/projectDocuments';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);
const DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar']);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024;

const idFor = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const extensionFor = (name = '') => name.split('.').pop()?.toLowerCase() || '';
const safeFileName = (name = 'file') => name.replace(/[^a-zA-Z0-9._-]/g, '-');
const documentContentDisposition = (name) => `inline; filename="${safeFileName(name)}"`;
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
        ...(Array.isArray(property?.gallery) ? property.gallery : []),
        ...(Array.isArray(property?.display?.media?.gallery) ? property.display.media.gallery : []),
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

const documentUrl = (document) => document?.url || document?.downloadURL || '';

const parseDocumentUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const parsed = new URL(value.trim());
    return ['http:', 'https:', 'blob:'].includes(parsed.protocol) ? parsed : null;
  } catch {
    return null;
  }
};

export const isGoogleDocumentUrl = (value) => {
  const parsed = parseDocumentUrl(value);
  if (!parsed || parsed.protocol === 'blob:') return false;
  return parsed.hostname === 'docs.google.com'
    || parsed.hostname.endsWith('.docs.google.com')
    || parsed.hostname === 'drive.google.com'
    || parsed.hostname.endsWith('.drive.google.com');
};

const isMobileDocumentViewport = () => typeof window !== 'undefined'
  && (window.matchMedia?.('(max-width: 768px)').matches || window.innerWidth <= 768);

/**
 * Mobile keeps the current page behind a large preview dialog. Desktop
 * opens externally hosted or unsupported formats in a separate tab.
 */
export const openDocumentPreview = (document, setViewer) => {
  const sourceUrl = documentUrl(document);
  if (!parseDocumentUrl(sourceUrl)) {
    setViewer({ ...document, previewError: 'This document has an invalid or missing URL.' });
    return;
  }
  const previewKind = getProjectDocumentPreviewKind(document);
  if (isMobileDocumentViewport()) {
    setViewer(document);
    return;
  }
  if (isGoogleDocumentUrl(sourceUrl) || previewKind === 'external') {
    const opened = window.open(sourceUrl, '_blank');
    if (!opened) {
      setViewer({
        ...document,
        previewError: 'Your browser blocked the new tab. Use “Open document” below to continue.'
      });
    } else {
      opened.opener = null;
    }
    return;
  }
  setViewer(document);
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
  const [loadError, setLoadError] = useState('');
  const closeButtonRef = useRef(null);
  useEffect(() => setLoadError(''), [activeDocument]);
  useEffect(() => {
    if (!activeDocument) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const handleKey = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
      previousFocus?.focus?.();
    };
  }, [activeDocument, onClose]);
  if (!activeDocument) return null;
  const name = documentName(activeDocument);
  const previewKind = getProjectDocumentPreviewKind(activeDocument);
  const isImage = previewKind === 'image';
  const isText = previewKind === 'text';
  const isPDF = previewKind === 'pdf' || name.toLowerCase().endsWith('.pdf');
  const sourceUrl = documentUrl(activeDocument);
  const isGoogleHostedDocument = isGoogleDocumentUrl(sourceUrl);

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
  const validUrl = Boolean(parseDocumentUrl(sourceUrl));
  const errorMessage = activeDocument.previewError || loadError;
  // Defense in depth: even if a caller bypasses openDocumentPreview(), a
  // Google Docs/Drive URL can never become an iframe source.
  const canRenderDirectly = validUrl && !isGoogleHostedDocument && (isImage || isText || isPDF);

  return createPortal(
    <div className="document-viewer-overlay" role="dialog" aria-modal="true" aria-labelledby="property-document-title">
      <div className="document-viewer-shell">
        <div className="document-viewer-header">
          <div><span>Document preview</span><h3 id="property-document-title">{name}</h3></div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close document viewer"><X size={19} /></button>
        </div>
        <div className="document-viewer-content">
          {errorMessage ? (
            <div className="document-preview-unavailable" role="alert">
              <FileText size={48} />
              <p>{errorMessage}</p>
              {validUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer">Open document</a>}
            </div>
          ) : isImage && canRenderDirectly ? (
            <img src={sourceUrl} alt={name} onError={() => setLoadError('This image could not be loaded. It may be unavailable or access-restricted.')} />
          ) : (isPDF || isText) && canRenderDirectly ? (
            <iframe src={sourceUrl} title={name} onError={() => setLoadError('This document could not be loaded. It may be unavailable or access-restricted.')} />
          ) : (
            <div className="document-preview-unavailable">
              <FileText size={48} />
              <p>{isGoogleHostedDocument
                ? 'Google-hosted documents must be opened in a separate browser tab.'
                : validUrl
                ? `A secure in-app preview is not available for this ${isLocal ? 'local ' : ''}document type.`
                : 'This document has an invalid or missing URL.'}</p>
              {validUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                {isGoogleHostedDocument ? 'Open document' : 'Open / Download Document'}
              </a>}
            </div>
          )}
        </div>
      </div>
    </div>, document.body
  );
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  onClose,
  canManage = false,
  onDelete,
  onReplace,
  title,
  subtitle,
  saved = false,
  onSave,
  onShare
}) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showOptions, setShowOptions] = useState(false);
  const touchRef = useRef(null);
  const stageRef = useRef(null);
  const dialogRef = useRef(null);
  const lastTapRef = useRef(0);
  const active = images[index];
  const activeUrl = active?.downloadURL || active?.url || active || '';
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);
  useEffect(() => {
    if (index >= images.length) setIndex(Math.max(0, images.length - 1));
  }, [images.length, index]);
  useEffect(() => {
    if (images.length < 2) return;
    [index - 1, index + 1].forEach((candidateIndex) => {
      const candidate = images[(candidateIndex + images.length) % images.length];
      const url = candidate?.downloadURL || candidate?.url || candidate;
      if (url) { const image = new Image(); image.src = url; }
    });
  }, [images, index]);
  if (!active) return null;
  const move = (direction) => {
    setIndex((current) => (current + direction + images.length) % images.length);
    resetView();
    setShowOptions(false);
  };
  const clampPan = (nextPan, nextZoom = zoom) => {
    const bounds = stageRef.current?.getBoundingClientRect();
    if (!bounds || nextZoom <= 1) return { x: 0, y: 0 };
    const maxX = bounds.width * (nextZoom - 1) / 2;
    const maxY = bounds.height * (nextZoom - 1) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, nextPan.x)),
      y: Math.max(-maxY, Math.min(maxY, nextPan.y))
    };
  };
  const applyZoom = (nextZoom) => {
    const normalized = Math.min(4, Math.max(1, nextZoom));
    setZoom(normalized);
    setPan((current) => clampPan(current, normalized));
  };
  const onTouchStart = (event) => {
    const touches = [...event.touches];
    touchRef.current = touches.length === 2
      ? { distance: Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY), zoom, pan }
      : { x: touches[0]?.clientX, y: touches[0]?.clientY, pan, moved: false };
  };
  const onTouchMove = (event) => {
    if (event.touches.length === 2 && touchRef.current?.distance) {
      const touches = [...event.touches];
      const distance = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
      const nextZoom = Math.min(4, Math.max(1, touchRef.current.zoom * distance / touchRef.current.distance));
      setZoom(nextZoom);
      setPan(clampPan(touchRef.current.pan, nextZoom));
    } else if (event.touches.length === 1 && touchRef.current?.x !== undefined && zoom > 1) {
      const touch = event.touches[0];
      const nextPan = {
        x: touchRef.current.pan.x + touch.clientX - touchRef.current.x,
        y: touchRef.current.pan.y + touch.clientY - touchRef.current.y
      };
      touchRef.current.moved = Math.abs(touch.clientX - touchRef.current.x) > 4 || Math.abs(touch.clientY - touchRef.current.y) > 4;
      setPan(clampPan(nextPan));
    }
  };
  const onTouchEnd = (event) => {
    if (touchRef.current?.x !== undefined && event.changedTouches[0]) {
      const delta = event.changedTouches[0].clientX - touchRef.current.x;
      const verticalDelta = event.changedTouches[0].clientY - touchRef.current.y;
      if (zoom === 1 && images.length > 1 && Math.abs(delta) > 60) move(delta > 0 ? -1 : 1);
      else if (Math.abs(delta) < 12 && Math.abs(verticalDelta) < 12 && !touchRef.current.moved) {
        const now = Date.now();
        if (now - lastTapRef.current < 300) zoom > 1 ? resetView() : applyZoom(2.5);
        lastTapRef.current = now;
      }
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
      ref={dialogRef}>
      <div
        key={`backdrop-${activeUrl}`}
        className="property-lightbox-backdrop"
        style={{ backgroundImage: `url("${String(activeUrl).replace(/"/g, '\\"')}")` }}
        aria-hidden="true"
      />
      <div className="property-lightbox-toolbar">
        <span className="property-lightbox-counter">{index + 1} / {images.length}</span>
        <div>
          {canManage && <button type="button" onClick={() => onReplace(active)} aria-label="Replace image"><RefreshCw /></button>}
          {canManage && <button type="button" onClick={() => onDelete(active)} aria-label="Delete image"><Trash2 /></button>}
          <button type="button" onClick={() => setShowOptions((value) => !value)} aria-label="More image options" aria-expanded={showOptions}><MoreVertical /></button>
          <button type="button" onClick={onClose} aria-label="Close image preview"><X /></button>
        </div>
      </div>
      {showOptions && <div className="property-lightbox-options">
        <button type="button" onClick={() => applyZoom(zoom + .5)}><ZoomIn size={18} /> Zoom in</button>
        <button type="button" onClick={() => applyZoom(zoom - .5)}><ZoomOut size={18} /> Zoom out</button>
        <button type="button" onClick={resetView}><Maximize2 size={18} /> Fit to screen</button>
      </div>}
      <div className="property-lightbox-stage" ref={stageRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        onDoubleClick={() => zoom > 1 ? resetView() : applyZoom(2.5)}>
        <img key={activeUrl} src={activeUrl} alt={title ? `${title} image ${index + 1}` : `Property image ${index + 1}`}
          draggable="false" style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` }} />
      </div>
      {(onSave || onShare) && <div className="property-lightbox-actions" aria-label="Property actions">
        {onSave && <button type="button" onClick={onSave} aria-label={saved ? 'Remove from saved projects' : 'Save project'}><Heart fill={saved ? 'currentColor' : 'none'} /></button>}
        {onShare && <button type="button" onClick={onShare} aria-label="Share project"><Share2 /></button>}
      </div>}
      {(title || subtitle) && <div className="property-lightbox-information">
        {title && <strong>{title}</strong>}
        {subtitle && <span>{subtitle}</span>}
      </div>}
    </div>
  );
}

export default function PropertyMediaDocumentsManager({ property, user, onChange, showMedia = true, showDocuments = true, onHeroImageUploadReady }) {
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
  const videos = useMemo(() => (Array.isArray(property?.videos) ? property.videos : [])
    .map((item, index) => typeof item === 'string'
      ? { id: `video-${index}`, downloadURL: item, displayOrder: index }
      : { ...item, id: item.id || `video-${index}`, downloadURL: item.downloadURL || item.url || '', displayOrder: item.displayOrder ?? index })
    .filter((item) => item.downloadURL), [property]);
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
    const heroUrl = first?.downloadURL || '';
    return {
      media: normalized,
      images: normalized.map((image) => image.downloadURL),
      galleryImages: normalized.map((image) => image.downloadURL),
      thumbnail: heroUrl,
      thumbnailUrl: heroUrl,
      thumbnailPath: first?.storagePath || '',
      heroImage: heroUrl,
      heroImagePath: first?.storagePath || '',
      display: {
        ...(property.display || {}),
        media: {
          ...(property.display?.media || {}),
          heroImage: heroUrl
        }
      }
    };
  };

  const persistImages = async (nextImages) => {
    await persist(imageChangesFor(nextImages));
  };

  const persistVideos = async (nextVideos) => {
    const normalized = nextVideos.map((video, index) => ({ ...video, displayOrder: index }));
    await persist({ videos: normalized });
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

  useEffect(() => {
    if (!onHeroImageUploadReady) return undefined;
    onHeroImageUploadReady(async (file) => {
      const replacing = images.find((image) => image.isThumbnail) || images[0] || null;
      if (replacing) {
        await uploadImage(file, replacing);
      } else {
        const uploaded = await uploadImage(file, null, false);
        const nextImages = [uploaded, ...images];
        await persistImages(nextImages);
      }
    });
    return () => onHeroImageUploadReady(null);
  }, [images, onHeroImageUploadReady, uploadImage]);

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

  const uploadVideo = async (file, replacing = null, persistResult = true) => {
    const taskId = idFor();
    setUploadTasks((current) => [...current, { id: taskId, name: file.name, progress: 0, kind: 'video' }]);
    const assetId = replacing?.id && !String(replacing.id).startsWith('video-') ? replacing.id : idFor();
    const assetRef = ref(storage, `project-media/${user.uid}/${property.id}/${assetId}-${safeFileName(file.name)}`);
    try {
      const task = uploadBytesResumable(assetRef, file, {
        contentType: file.type,
        customMetadata: { projectId: property.id, uploadedBy: user.uid, kind: 'video', mediaRole: 'video' }
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
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.uid,
        displayOrder: replacing ? replacing.displayOrder : videos.length
      };
      if (persistResult) {
        await persistVideos(replacing
          ? videos.map((video) => video.id === replacing.id ? uploaded : video)
          : [...videos, uploaded]);
        if (replacing?.storagePath && replacing.storagePath !== snapshot.ref.fullPath) {
          await deleteObject(ref(storage, replacing.storagePath)).catch(() => undefined);
        }
      }
      return uploaded;
    } finally {
      setUploadTasks((current) => current.filter((task) => task.id !== taskId));
    }
  };

  const acceptMedia = async (files, replacing = null) => {
    const selected = [...files];
    if (!selected.length) return;
    const invalid = selected.find((file) =>
      (!IMAGE_TYPES.has(file.type) && !VIDEO_TYPES.has(file.type))
      || (IMAGE_TYPES.has(file.type) && file.size > MAX_IMAGE_SIZE)
      || (VIDEO_TYPES.has(file.type) && file.size > MAX_VIDEO_SIZE));
    if (invalid) {
      setError('Use JPG, PNG, WEBP (up to 10 MB) or MP4, WebM (up to 50 MB).');
      return;
    }
    setError('');
    try {
      if (replacing?.mediaType === 'video') {
        if (!VIDEO_TYPES.has(selected[0].type)) return setError('Replace a video with an MP4 or WebM file.');
        await uploadVideo(selected[0], replacing);
      }
      else if (replacing) {
        if (!IMAGE_TYPES.has(selected[0].type)) return setError('Replace a photo with a JPG, PNG, or WEBP file.');
        await acceptImages([selected[0]], replacing);
      }
      else {
        const imageFiles = selected.filter((file) => IMAGE_TYPES.has(file.type));
        const videoFiles = selected.filter((file) => VIDEO_TYPES.has(file.type));
        const [uploadedImages, uploadedVideos] = await Promise.all([
          Promise.all(imageFiles.map((file) => uploadImage(file, null, false))),
          Promise.all(videoFiles.map((file) => uploadVideo(file, null, false)))
        ]);
        await persist({
          ...imageChangesFor([...images, ...uploadedImages]),
          videos: [...videos, ...uploadedVideos].map((video, index) => ({ ...video, displayOrder: index }))
        });
      }
    } catch (uploadError) {
      console.error('Property media upload failed:', uploadError);
      setError('One or more media files could not be uploaded. Please try again.');
    }
  };

  const deleteVideo = async (video) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await persistVideos(videos.filter((item) => item.id !== video.id));
      if (video.storagePath) await deleteObject(ref(storage, video.storagePath)).catch((error) => {
        if (error?.code !== 'storage/object-not-found') throw error;
      });
    } catch (deleteError) {
      console.error('Property video deletion failed:', deleteError);
      setError('The video could not be deleted.');
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
        console.info('[Zinoo Media] Image deletion completed', {
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
      console.error('[Zinoo Media] Image deletion failed', {
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
          console.error('[Zinoo Media] Image deletion rollback failed', {
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
      console.info('[Zinoo Documents] Firestore metadata saved', {
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
        contentDisposition: documentContentDisposition(file.name),
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
      setError('Documents must use a supported format and be no larger than 50 MB.');
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
    if (kind === 'images') acceptMedia(event.dataTransfer.files);
    else acceptDocuments(event.dataTransfer.files);
  };

  return (
    <div className="property-assets-manager">
      {showMedia && <section className={`property-assets-module ${dragActive === 'images' ? 'is-dragging' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setDragActive('images'); }}
        onDragLeave={() => setDragActive('')}
        onDrop={(event) => dropFiles(event, 'images')}>
        <div className="property-assets-heading">
          <div><h3>Media</h3><p>Upload property photos</p><small>JPG · JPEG · PNG · WEBP</small></div>
          <input ref={imageInputRef} hidden type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(event) => { acceptMedia(event.target.files); event.target.value = ''; }} />
          <input ref={replaceImageInputRef} hidden type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(event) => { if (event.target.files[0]) acceptMedia(event.target.files, replaceTargetRef.current); event.target.value = ''; }} />
        </div>
        {uploadTasks.filter((task) => task.kind === 'image' || task.kind === 'video').map((task) => <UploadTask key={task.id} item={task} />)}
        <div className="property-image-grid">
            <button type="button" className="property-media-add-tile" onClick={() => imageInputRef.current?.click()}>
              <Plus size={26} />
              <span>Photos &amp; Videos</span>
            </button>
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
              </article>
            ))}
            {videos.map((video) => (
              <article key={video.id} className="property-image-card is-video">
                <div className="property-image-preview">
                  <video src={video.downloadURL} muted playsInline preload="metadata" />
                  <span className="property-video-play"><Play size={18} fill="currentColor" /></span>
                </div>
                <div className="property-image-actions">
                  <button type="button" onClick={() => { replaceTargetRef.current = { ...video, mediaType: 'video' }; replaceImageInputRef.current?.click(); }}>Replace</button>
                  <button type="button" onClick={() => deleteVideo(video)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
      </section>}

      {showDocuments && <section className={`property-assets-module ${dragActive === 'documents' ? 'is-dragging' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setDragActive('documents'); }}
        onDragLeave={() => setDragActive('')}
        onDrop={(event) => dropFiles(event, 'documents')}>
        <div className="property-assets-heading">
          <div><h3>Documents</h3><p>Upload legal documents and brochures</p><small>PDF · DOC · DOCX · XLS · XLSX · TXT · ZIP · RAR</small></div>
          <button type="button" className="btn-secondary" onClick={() => documentInputRef.current?.click()}><Plus size={17} /> Upload Documents</button>
          <input ref={documentInputRef} hidden type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar" onChange={(event) => { acceptDocuments(event.target.files); event.target.value = ''; }} />
          <input ref={replaceDocumentInputRef} hidden type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar" onChange={(event) => { if (event.target.files[0]) acceptDocuments(event.target.files, replaceTargetRef.current); event.target.value = ''; }} />
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
                    <button type="button" onClick={() => openDocumentPreview(item, setDocumentPreview)}>Preview</button>
                    <button type="button" onClick={() => renameDocument(item)}><Pencil size={15} /> Rename</button>
                    <button type="button" onClick={() => { replaceTargetRef.current = item; replaceDocumentInputRef.current?.click(); }}><RefreshCw size={15} /> Replace</button>
                    <button type="button" onClick={() => deleteDocument(item)}><Trash2 size={15} /> Delete</button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <div className="property-assets-empty">No documents uploaded yet.</div>}
      </section>}
      {error && <p className="property-assets-error" role="alert">{error}</p>}
      {previewIndex !== null && <ImageLightbox images={images} initialIndex={previewIndex} onClose={() => setPreviewIndex(null)} canManage onDelete={deleteImage} onReplace={(image) => { replaceTargetRef.current = image; replaceImageInputRef.current?.click(); }} />}
      <InAppDocumentViewer document={documentPreview} onClose={() => setDocumentPreview(null)} />
    </div>
  );
}
