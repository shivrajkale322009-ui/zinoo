// Google Play's documented integer statuses. Keep this policy testable without a device.
export function nativeUpdateState(info) {
  if (info?.installStatus === 11) return 'downloaded';
  if ([1, 2, 3].includes(info?.installStatus)) return 'downloading';
  if (info?.updateAvailability === 2) return info.flexibleUpdateAllowed ? 'available' : 'store';
  return 'none';
}
