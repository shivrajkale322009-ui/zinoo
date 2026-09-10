import PropertyPreviewCard from './PropertyPreviewCard';
import { getProjectPublicPath } from '../utils/projectPublicUrl';

export default function PropertyCard({ project, display, variant, onViewDetails, onDeveloperSelect }) {
  const sellerId = project.ownerId || project.sellerUid || project.sellerId;
  const developerName = project.developerName || project.developer || 'Verified Developer';
  return (
    <PropertyPreviewCard
      variant={variant}
      propertyId={project.id}
      projectHref={getProjectPublicPath(project)}
      image={display.media.heroImage}
      projectName={display.basic.shortTitle || display.basic.projectName}
      location={display.basic.location}
      startingPrice={display.pricing.startingPrice}
      cashback={display.cashback.enabled ? display.cashback.amount : 0}
      showNameBadge={display.verified.showNameBadge}
      photoCount={Math.max(1, display.media?.gallery?.length || project.images?.length || 1)}
      legalStatus={project.landZoneLabel || 'Non-Agriculture Zone'}
      titleStatus={project.titleStatus || 'Clear Title'}
      developerName={developerName}
      onDeveloperClick={sellerId ? () => onDeveloperSelect?.({ sellerId, developerName }) : undefined}
      callNumber={display.actions.callNumber}
      whatsappNumber={project.whatsappNumber}
      onClick={() => onViewDetails(project)}
    />
  );
}
