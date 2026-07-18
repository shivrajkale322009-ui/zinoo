import { formatIndianCurrency, formatPlotArea } from '../utils/formatIndian';

const fallbackImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';

export function createProjectPopupElement(project, onViewDetails) {
  const element = document.createElement('article');
  element.className = 'druvio-map-project-popup';
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-label', `${project.name || 'Project'} preview`);
  const location = [project.village, project.taluka].filter(Boolean).join(', ');
  const area = formatPlotArea(project.minimumPlotArea ?? project.minimumArea ?? project.sizeMin);
  element.innerHTML = `<img src="${project.thumbnail || project.heroImage || fallbackImage}" alt="" /><div class="druvio-map-project-popup-content"><span>Verified project</span><h2>${project.name || 'Untitled project'}</h2>${location ? `<p>${location}</p>` : ''}<strong>${formatIndianCurrency(project.priceFrom ?? project.startingPrice)}</strong>${area ? `<small>${area}</small>` : ''}<button type="button">View Details</button></div>`;
  element.addEventListener('click', (event) => event.stopPropagation());
  element.querySelector('button')?.addEventListener('click', () => onViewDetails?.(project));
  return element;
}
