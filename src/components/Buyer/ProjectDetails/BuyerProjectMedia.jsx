import React from 'react';
import { Check, FileText } from 'lucide-react';
import { getProjectDocumentLabel } from '../../../utils/projectDocuments';
import { ImageLightbox, InAppDocumentViewer } from '../../PropertyMediaDocumentsManager';

export default function BuyerProjectMedia({
  variant,
  selectedProject,
  selectedDisplay,
  selectedGallery,
  galleryIndex,
  galleryViewerIndex,
  documentViewer,
  documents,
  documentsLoading,
  order,
  onViewGallery,
  onOpenGalleryImage,
  onViewDocument,
  onCloseDocumentViewer,
  onCloseGalleryViewer,
  saved,
  onSave,
  onShare
}) {
  if (variant === 'gallery') {
    return (
      <section className="reference-section premium-gallery-section" style={{ order }}>
        <div className="reference-section-title">
          <h3>Project Gallery</h3>
          {selectedGallery.length > 0 && <button type="button" onClick={onViewGallery}>View all ({selectedGallery.length})</button>}
        </div>
        {selectedGallery.length
          ? <div className="reference-gallery-strip">
              {selectedGallery.map((image, index) => (
                <button type="button" className={`${index === galleryIndex ? 'active' : ''} ${image.mediaType === 'video' ? 'is-video' : ''}`} key={image.id} aria-label={`Open ${selectedDisplay.basic.projectName} gallery item ${index + 1}`} onClick={() => image.mediaType !== 'video' && onOpenGalleryImage(index)}>
                  {image.mediaType === 'video' ? <video src={image.downloadURL} controls preload="metadata" /> : <img src={image.downloadURL} alt={`${selectedProject.name} view ${index + 1}`} loading={index ? 'lazy' : 'eager'} />}
                </button>
              ))}
            </div>
          : <p>Gallery images will appear here when the seller adds them.</p>}
      </section>
    );
  }

  if (variant === 'documents') {
    return (
      selectedDisplay.documents.showOnDetails && <section className="reference-section premium-documents-section" style={{ order }}>
        <div className="reference-section-title"><h3>Documents</h3>{documents.length > 0 && <button type="button" onClick={() => onViewDocument(documents[0])}>View all</button>}</div>
        {documentsLoading ? <p>Loading documents…</p> : documents.length ? (
          <div className="buyer-document-list">
            {documents.map((document) => (
              <article key={document.id || document.url}>
                <FileText size={22} />
                <div>
                  <strong>{document.displayName || getProjectDocumentLabel(document.type)}</strong>
                  <small><Check size={13} /> Verified</small>
                </div>
                <button type="button" onClick={() => onViewDocument(document)}>View</button>
              </article>
            ))}
          </div>
        ) : <p>No verified documents are available.</p>}
      </section>
    );
  }

  return (
    <>
      <InAppDocumentViewer document={documentViewer} onClose={onCloseDocumentViewer} />
      {galleryViewerIndex !== null && (
        <ImageLightbox
          images={selectedGallery.filter((item) => item.mediaType !== 'video')}
          initialIndex={Math.max(0, selectedGallery.slice(0, galleryViewerIndex + 1).filter((item) => item.mediaType !== 'video').length - 1)}
          onClose={onCloseGalleryViewer}
          title={selectedDisplay?.basic.projectName || selectedProject?.name}
          subtitle={selectedDisplay?.basic.location || selectedDisplay?.basic.shortDescription}
          saved={saved}
          onSave={onSave}
          onShare={onShare}
        />
      )}
    </>
  );
}
