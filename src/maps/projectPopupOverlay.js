import { formatIndianCurrency, formatPlotArea } from '../utils/formatIndian.js';
import { getProjectPublicPath, getProjectPublicUrl } from '../utils/projectPublicUrl.js';

const fallbackImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';
const HTTP_PROTOCOLS = new Set(['http:', 'https:']);

const textValue = (value, fallback = '') => {
  const text = String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  return text || fallback;
};

export function normalizePopupUrl(value, { allowRelative = false } = {}) {
  const candidate = textValue(value);
  if (!candidate) return '';
  const base = globalThis.location?.origin || 'https://zinoo.in';
  try {
    const url = new URL(candidate, base);
    if (!HTTP_PROTOCOLS.has(url.protocol)) return '';
    if (!allowRelative && !/^[a-z][a-z\d+.-]*:/i.test(candidate)) return '';
    return allowRelative && candidate.startsWith('/') ? `${url.pathname}${url.search}${url.hash}` : url.href;
  } catch {
    return '';
  }
}

const createElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

const createIcon = (name) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const shapes = name === 'directions'
    ? [
        ['path', { d: 'M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0' }],
        ['circle', { cx: '12', cy: '10', r: '3' }]
      ]
    : [
        ['circle', { cx: '18', cy: '5', r: '3' }],
        ['circle', { cx: '6', cy: '12', r: '3' }],
        ['circle', { cx: '18', cy: '19', r: '3' }],
        ['path', { d: 'm8.6 13.5 6.8 4' }],
        ['path', { d: 'm15.4 6.5-6.8 4' }]
      ];
  shapes.forEach(([tagName, attributes]) => {
    const shape = document.createElementNS('http://www.w3.org/2000/svg', tagName);
    Object.entries(attributes).forEach(([attribute, value]) => shape.setAttribute(attribute, value));
    svg.appendChild(shape);
  });
  return svg;
};

const createVerifiedBadge = () => {
  const badge = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  badge.setAttribute('class', 'zinoo-map-project-verified-badge');
  badge.setAttribute('viewBox', '0 0 24 24');
  badge.setAttribute('aria-label', 'Verified property');
  badge.setAttribute('role', 'img');
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '10');
  circle.setAttribute('fill', '#2563eb');
  const check = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  check.setAttribute('d', 'm7.5 12.2 3 3 6.2-6.5');
  check.setAttribute('fill', 'none');
  check.setAttribute('stroke', '#fff');
  check.setAttribute('stroke-width', '2.4');
  check.setAttribute('stroke-linecap', 'round');
  check.setAttribute('stroke-linejoin', 'round');
  badge.append(circle, check);
  return badge;
};

const safeProjectPath = (project) => {
  const path = getProjectPublicPath(project);
  return /^\/projects\/[a-z0-9-]+$/.test(path) ? path : '';
};

const projectDirectionsUrl = (project) => {
  const suppliedUrl = normalizePopupUrl(project.googleMapsLink);
  if (suppliedUrl) return suppliedUrl;
  const latitude = Number(project.latitude);
  const longitude = Number(project.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitude},${longitude}`)}`
    : '';
};

export function createProjectPopupElement(project = {}, { onViewDetails, onClose } = {}) {
  const projectName = textValue(project.name, 'Untitled project');
  const location = [project.village, project.taluka].map((value) => textValue(value)).filter(Boolean).join(', ');
  const area = textValue(formatPlotArea(project.minimumPlotArea ?? project.minimumArea ?? project.sizeMin));
  const projectPath = safeProjectPath(project);
  const directions = projectDirectionsUrl(project);
  const imageUrl = normalizePopupUrl(project.thumbnail || project.heroImage, { allowRelative: true }) || fallbackImage;

  const element = createElement('article', 'zinoo-map-project-popup');
  element.setAttribute('role', 'region');
  element.setAttribute('aria-label', `${projectName} preview`);

  const closeButton = createElement('button', 'zinoo-map-popup-close', '×');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close preview');
  closeButton.addEventListener('click', () => onClose?.());

  const image = createElement('img');
  image.src = imageUrl;
  image.alt = '';
  image.decoding = 'async';
  image.addEventListener('error', () => {
    if (image.src !== fallbackImage) image.src = fallbackImage;
  }, { once: true });

  const content = createElement('div', 'zinoo-map-project-popup-content');
  const heading = createElement('h2');
  if (projectPath) {
    const projectLink = createElement('a', 'zinoo-map-project-title-link', projectName);
    projectLink.href = projectPath;
    heading.appendChild(projectLink);
  } else {
    heading.textContent = projectName;
  }
  if (project.showVerifiedNameBadge === true) heading.appendChild(createVerifiedBadge());
  content.appendChild(heading);

  if (location) content.appendChild(createElement('p', 'zinoo-map-project-location', location));
  content.appendChild(createElement('strong', 'zinoo-map-project-price', formatIndianCurrency(project.priceFrom ?? project.startingPrice)));
  if (area) content.appendChild(createElement('small', 'zinoo-map-project-area', area));

  const actions = createElement('div', 'zinoo-map-popup-actions');
  const details = createElement(projectPath ? 'a' : 'button', 'zinoo-map-popup-details', 'View Details');
  if (projectPath) details.href = projectPath;
  else details.type = 'button';
  details.addEventListener('click', (event) => {
    if (onViewDetails) {
      event.preventDefault();
      onViewDetails(project);
    }
  });
  actions.appendChild(details);

  if (directions) {
    const directionsLink = createElement('a', 'zinoo-map-popup-icon-action');
    directionsLink.href = directions;
    directionsLink.target = '_blank';
    directionsLink.rel = 'noreferrer';
    directionsLink.setAttribute('aria-label', 'Get directions');
    directionsLink.title = 'Get directions';
    directionsLink.appendChild(createIcon('directions'));
    actions.appendChild(directionsLink);
  }

  const shareButton = createElement('button', 'zinoo-map-popup-share zinoo-map-popup-icon-action');
  shareButton.type = 'button';
  shareButton.setAttribute('aria-label', 'Share project');
  shareButton.title = 'Share project';
  shareButton.appendChild(createIcon('share'));
  shareButton.addEventListener('click', async () => {
    const canonicalUrl = normalizePopupUrl(getProjectPublicUrl(project));
    if (!canonicalUrl) return;
    const shareData = { title: projectName, text: `Explore ${projectName} on Zinoo`, url: canonicalUrl };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard?.writeText(shareData.url);
    } catch {}
  });
  actions.appendChild(shareButton);

  content.appendChild(actions);
  element.append(closeButton, image, content);
  element.addEventListener('click', (event) => event.stopPropagation());
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose?.();
    }
  });

  element.focusPrimaryAction = () => details.focus({ preventScroll: true });
  return element;
}
