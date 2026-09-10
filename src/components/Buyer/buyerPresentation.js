import { getCashbackPerGuntha } from '../../utils/projectArea';

export const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== '';

export const getDisplayLocation = (project) =>
  [project?.village, project?.taluka, project?.area].filter((item) => hasValue(item)).join(' • ');

export const buildWhatsAppUrl = (project) => {
  const contactNumber = project?.whatsappNumber || project?.salesContact || project?.siteVisitContact || project?.contactNumber;
  if (!hasValue(contactNumber)) return '';
  const phone = String(contactNumber).replace(/[^\d]/g, '');
  if (!phone) return '';
  const message = `Hi, I am interested in ${project.name || 'your project'} on Zinoo.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const formatINR = (num) => {
  if (!hasValue(num)) return 'Price on request';
  const parsed = Number(num);
  if (!Number.isFinite(parsed) || parsed <= 0) return 'Price on request';
  if (parsed >= 10000000) return `₹${(parsed / 10000000).toFixed(2)} Cr`;
  return `₹${(parsed / 100000).toFixed(1)} Lakh`;
};

export const formatExactINR = (num) => {
  const parsed = Number(num);
  if (!Number.isFinite(parsed) || parsed <= 0) return '';
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(parsed))}`;
};

export const formatCashbackLabel = (project) => {
  const amount = getCashbackPerGuntha(project);
  if (amount > 0) return `₹${new Intl.NumberFormat('en-IN').format(amount)} per Guntha`;
  return '';
};

export const getNavigateUrl = (project) => {
  if (hasValue(project?.googleMapsLink)) return project.googleMapsLink;
  if (hasValue(project?.latitude) && hasValue(project?.longitude)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${project.latitude},${project.longitude}`;
  }
  return '';
};
