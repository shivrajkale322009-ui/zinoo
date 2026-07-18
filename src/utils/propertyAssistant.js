import { LAND_ZONE_OPTIONS } from './projectLand';

const lakh = 100000;

export function parsePropertyQuery(query = '') {
  const text = query.trim().toLowerCase();
  const filters = {};
  const budget = text.match(/(?:below|under|less than|upto|up to)\s*₹?\s*(\d+(?:\.\d+)?)\s*(lakh|lac|l|crore|cr)?/);
  if (budget) filters.budgetMax = Number(budget[1]) * (budget[2]?.startsWith('c') ? 100 * lakh : lakh);
  const area = text.match(/(?:above|over|more than)\s*([\d,]+)\s*(?:sq\.?\s*ft|sqft|square feet)/);
  if (area) filters.minimumPlotArea = Number(area[1].replace(/,/g, ''));
  const zone = LAND_ZONE_OPTIONS.find((item) => text.includes(item.value) || text.includes(item.label.toLowerCase().replace(' zone', '')));
  if (zone) filters.landZones = [zone.value];
  if (text.includes('verified')) filters.verified = true;
  if (text.includes('cashback')) filters.cashback = true;
  const location = text.match(/(?:near|in|around)\s+([a-z\s]+?)(?:\.|,|$)/);
  if (location) filters.location = location[1].trim();
  return filters;
}

export function matchesAssistantFilters(project, filters) {
  if (filters.budgetMax && Number(project.priceFrom ?? project.startingPrice ?? Infinity) > filters.budgetMax) return false;
  if (filters.minimumPlotArea && Number(project.minimumPlotArea ?? project.minimumArea ?? project.sizeMin ?? 0) < filters.minimumPlotArea) return false;
  if (filters.landZones?.length && !filters.landZones.includes(project.landZone || project.zoneType)) return false;
  if (filters.cashback && Number(project.cashbackAmount || 0) <= 0) return false;
  if (filters.location) {
    const location = [project.village, project.taluka, project.area, project.name].join(' ').toLowerCase();
    if (!location.includes(filters.location)) return false;
  }
  return true;
}
