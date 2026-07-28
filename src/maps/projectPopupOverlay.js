import { formatIndianCurrency, formatPlotArea } from '../utils/formatIndian';

const fallbackImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';

export function createProjectPopupElement(project, { onViewDetails, onClose } = {}) {
  const element = document.createElement('article');
  element.className = 'druvio-map-project-popup';
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-label', `${project.name || 'Project'} preview`);
  const location = [project.village, project.taluka].filter(Boolean).join(', ');
  const area = formatPlotArea(project.minimumPlotArea ?? project.minimumArea ?? project.sizeMin);
  const directions = project.googleMapsLink || (project.latitude && project.longitude ? `https://www.google.com/maps/dir/?api=1&destination=${project.latitude},${project.longitude}` : '');
  element.innerHTML = `<button type="button" class="druvio-map-popup-close" aria-label="Close preview">×</button><img src="${project.thumbnail || project.heroImage || fallbackImage}" alt="" /><div class="druvio-map-project-popup-content"><h2>${project.name || 'Untitled project'}</h2><strong>${formatIndianCurrency(project.priceFrom ?? project.startingPrice)}</strong>${area ? `<small>${area}</small>` : ''}<div class="druvio-map-popup-actions"><button type="button" class="druvio-map-popup-details">View Details</button>${directions ? `<a href="${directions}" target="_blank" rel="noreferrer" aria-label="View on Map">↗</a>` : ''}<button type="button" class="druvio-map-popup-share" aria-label="Share project">↗</button></div></div>`;
  element.addEventListener('click', (event) => event.stopPropagation());
  element.querySelector('.druvio-map-popup-details')?.addEventListener('click', () => onViewDetails?.(project));
  element.querySelector('.druvio-map-popup-close')?.addEventListener('click', () => onClose?.());
  element.querySelector('.druvio-map-popup-share')?.addEventListener('click', async () => {
    const shareData = { title: project.name || 'Druvio project', text: `Explore ${project.name || 'this project'} on Druvio`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard?.writeText(shareData.url);
    } catch {}
  });
  return element;
}
