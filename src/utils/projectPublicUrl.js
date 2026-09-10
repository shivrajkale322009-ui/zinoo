const PUBLIC_SITE_ORIGIN = 'https://zinoo.in';

export const normalizeProjectSlug = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, '')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

export function getProjectPublicPath(project = {}) {
  const slug = normalizeProjectSlug(project.canonicalSlug || project.publicSlug || project.slug);
  return slug ? `/projects/${encodeURIComponent(slug)}` : '';
}

export function getProjectPublicUrl(project = {}, origin = PUBLIC_SITE_ORIGIN) {
  const path = getProjectPublicPath(project);
  return path ? new URL(path, origin).href : '';
}

export { PUBLIC_SITE_ORIGIN };
