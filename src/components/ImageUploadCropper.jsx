import React, { useEffect, useRef, useState } from 'react';
import { Camera, LoaderCircle, Minus, Plus, X } from 'lucide-react';

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;
const DEFAULT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

export default function ImageUploadCropper({
  value,
  alt = 'Uploaded image',
  aspect = 16 / 9,
  accept = DEFAULT_TYPES,
  maxSize = DEFAULT_MAX_SIZE,
  uploading = false,
  progress = 0,
  onUpload,
  onDelete,
  onError,
  triggerRef,
  label = 'Thumbnail'
}) {
  const inputRef = useRef(null);
  const cropFrameRef = useRef(null);
  const dragRef = useRef(null);
  const [source, setSource] = useState('');
  const [fileName, setFileName] = useState('');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [savingCrop, setSavingCrop] = useState(false);

  useEffect(() => () => {
    if (source) URL.revokeObjectURL(source);
  }, [source]);

  const closeCropper = () => {
    if (source) URL.revokeObjectURL(source);
    setSource('');
    setFileName('');
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const chooseFile = () => {
    if (!uploading && !savingCrop) inputRef.current?.click();
  };

  useEffect(() => {
    if (triggerRef) triggerRef.current = chooseFile;
    return () => {
      if (triggerRef) triggerRef.current = null;
    };
  });

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!accept.includes(file.type)) {
      onError?.('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > maxSize) {
      onError?.(`${label} images must be ${Math.round(maxSize / 1024 / 1024)} MB or smaller.`);
      return;
    }
    setSource(URL.createObjectURL(file));
    setFileName(file.name);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, offset };
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;
    setOffset({
      x: dragRef.current.offset.x + event.clientX - dragRef.current.x,
      y: dragRef.current.offset.y + event.clientY - dragRef.current.y
    });
  };

  const createCrop = async () => {
    if (!source || !cropFrameRef.current) return;
    setSavingCrop(true);
    try {
      const image = await loadImage(source);
      const frame = cropFrameRef.current.getBoundingClientRect();
      const baseScale = Math.max(frame.width / image.naturalWidth, frame.height / image.naturalHeight);
      const scale = baseScale * zoom;
      const cropWidth = frame.width / scale;
      const cropHeight = frame.height / scale;
      const sourceX = Math.max(0, Math.min(image.naturalWidth - cropWidth, (image.naturalWidth - cropWidth) / 2 - offset.x / scale));
      const sourceY = Math.max(0, Math.min(image.naturalHeight - cropHeight, (image.naturalHeight - cropHeight) / 2 - offset.y / scale));
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = Math.round(1600 / aspect);
      canvas.getContext('2d').drawImage(
        image,
        sourceX,
        sourceY,
        Math.min(cropWidth, image.naturalWidth),
        Math.min(cropHeight, image.naturalHeight),
        0,
        0,
        canvas.width,
        canvas.height
      );
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.9));
      if (!blob) throw new Error('Unable to prepare the cropped image.');
      await onUpload(new File([blob], `${fileName.replace(/\.[^.]+$/, '') || 'thumbnail'}.webp`, { type: 'image/webp' }));
      closeCropper();
    } catch (error) {
      onError?.(error?.message || 'Unable to crop this image.');
    } finally {
      setSavingCrop(false);
    }
  };

  const confirmDelete = (event) => {
    event.stopPropagation();
    if (!uploading && window.confirm('Delete this thumbnail? This cannot be undone.')) onDelete?.();
  };

  return (
    <>
      <div className="thumbnail-upload">
        <input ref={inputRef} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={handleFile} />
        <button
          type="button"
          className={`thumbnail-preview-card ${value ? 'has-image' : 'is-empty'} ${uploading ? 'is-uploading' : ''}`}
          onClick={chooseFile}
          disabled={uploading}
          aria-label={value ? `Change ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
        >
          {value ? <img src={value} alt={alt} /> : (
            <span className="thumbnail-placeholder"><Camera size={34} /><strong>Click to upload thumbnail</strong><small>JPG, PNG or WEBP · 5 MB max</small></span>
          )}
          {!uploading && (
            <span className="thumbnail-hover"><Camera size={25} /><strong>Change Thumbnail</strong></span>
          )}
          {uploading && (
            <span className="thumbnail-progress-overlay" role="status" aria-live="polite">
              <LoaderCircle className="thumbnail-spinner" size={30} />
              <strong>Uploading… {Math.round(progress)}%</strong>
              <span className="thumbnail-progress-track"><i style={{ width: `${progress}%` }} /></span>
            </span>
          )}
        </button>
        {value && (
          <button type="button" className="thumbnail-delete" onClick={confirmDelete} disabled={uploading} aria-label="Delete thumbnail" title="Delete thumbnail">
            <X size={17} />
          </button>
        )}
      </div>

      {source && (
        <div className="image-cropper-backdrop" role="presentation">
          <section className="image-cropper-dialog" role="dialog" aria-modal="true" aria-labelledby="thumbnail-crop-title">
            <header>
              <div><h3 id="thumbnail-crop-title">Crop {label}</h3><p>Drag to reposition and use the slider to zoom.</p></div>
              <button type="button" onClick={closeCropper} disabled={savingCrop} aria-label="Close cropper"><X size={20} /></button>
            </header>
            <div
              ref={cropFrameRef}
              className="image-cropper-frame"
              style={{ aspectRatio: `${aspect}` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={() => { dragRef.current = null; }}
              onPointerCancel={() => { dragRef.current = null; }}
            >
              <img src={source} alt="Crop preview" draggable="false" style={{ transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})` }} />
              <span className="image-cropper-grid" />
            </div>
            <div className="image-cropper-zoom">
              <Minus size={17} />
              <input aria-label="Zoom image" type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
              <Plus size={17} />
            </div>
            <footer>
              <button type="button" className="btn-secondary" onClick={closeCropper} disabled={savingCrop}>Cancel</button>
              <button type="button" className="btn-primary" onClick={createCrop} disabled={savingCrop}>
                {savingCrop ? <><LoaderCircle className="thumbnail-spinner" size={17} /> Preparing…</> : `Use ${label}`}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
