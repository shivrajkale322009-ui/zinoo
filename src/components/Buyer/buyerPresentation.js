import { getCashbackPerGuntha } from '../../utils/projectArea';

export const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== '';

export const getDisplayLocation = (project) =>
  [project?.village, project?.taluka, project?.area].filter((item) => hasValue(item)).join(' • ');

export const buildWhatsAppUrl = (project) => {
  if (!hasValue(project?.whatsappNumber)) return '';
  const phone = String(project.whatsappNumber).replace(/[^\d]/g, '');
  if (!phone) return '';
  const message = `Hi, I am interested in ${project.name || 'your project'} on Druvio.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const formatINR = (num) => {
  if (!hasValue(num)) return 'Price on request';
  const parsed = Number(num);
  if (!Number.isFinite(parsed) || parsed <= 0) return 'Price on request';
  if (parsed >= 10000000) return `₹${(parsed / 10000000).toFixed(2)} Cr`;
  return `₹${(parsed / 100000).toFixed(1)} Lakh`;
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
