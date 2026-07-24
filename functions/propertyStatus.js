'use strict';

const statusDefinition = require('./propertyStatus.json');
const PROPERTY_STATUS = Object.freeze(statusDefinition.statuses);
const PROPERTY_STATUSES = Object.freeze(Object.values(PROPERTY_STATUS));
const LEGACY_STATUS_MAP = Object.freeze(statusDefinition.legacyMap);

function normalizePropertyStatus(value, fallback = PROPERTY_STATUS.DRAFT) {
  const token = String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  return LEGACY_STATUS_MAP[token] || fallback;
}

function isPropertyStatus(value) {
  return PROPERTY_STATUSES.includes(value);
}

module.exports = {
  PROPERTY_STATUS,
  PROPERTY_STATUSES,
  LEGACY_STATUS_MAP,
  normalizePropertyStatus,
  isPropertyStatus
};
