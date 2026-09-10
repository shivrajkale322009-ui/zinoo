import { getProjectPublicPath, normalizeProjectSlug } from './projectPublicUrl.js';

const PROJECT_ROUTE = /^\/projects\/([a-z0-9-]+)\/?$/i;

export function getProjectRouteSlug(pathname = window.location.pathname) {
  const match = String(pathname || '').match(PROJECT_ROUTE);
  return match ? normalizeProjectSlug(decodeURIComponent(match[1])) : '';
}

export function getProjectRoutePath(project) {
  return getProjectPublicPath(project);
}
