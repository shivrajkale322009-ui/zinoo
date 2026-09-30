import React from 'react';
import { BadgeCheck, FileText } from 'lucide-react';
import BuyerDetailSection from './BuyerDetailSection';
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
  documentsLoading = false,
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
    const visibleDocuments = selectedDisplay.documents.showOnDetails ? (documents || []) : [];

    return (
      <BuyerDetailSection title="Documents" icon={FileText} className="premium-documents-section" style={{ order }}>
        {visibleDocuments.length > 0 ? <>
        <div className="reference-section-title"><button type="button" onClick={() => onViewDocument(visibleDocuments[0])}>View all</button></div>
        <div className="buyer-document-list">
            {visibleDocuments.map((document) => (
              <article key={document.id || document.url}>
                <div className="buyer-document-name">
                  <strong>{document.displayName || getProjectDocumentLabel(document.type)}</strong>
                  <BadgeCheck className="property-name-verified-badge buyer-document-verified-badge" aria-label="Verified document" />
                </div>
                <button type="button" onClick={() => onViewDocument(document)}>View</button>
              </article>
            ))}
        </div>
        </> : <p className="buyer-detail-empty" role="status">{documentsLoading ? 'Loading documents…' : 'No documents available yet. Contact us on WhatsApp for details.'}</p>}
      </BuyerDetailSection>
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
