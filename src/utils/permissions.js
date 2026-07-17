export const DEFAULT_PERMISSIONS = Object.freeze({
  buyer: true,
  seller: false,
  admin: false
});

export function normalizePermissions(permissions = {}) {
  const normalized = {
    buyer: Boolean(permissions?.buyer),
    seller: Boolean(permissions?.seller),
    admin: Boolean(permissions?.admin)
  };

  // Administrators can use every workspace.
  if (normalized.admin) {
    normalized.buyer = true;
    normalized.seller = true;
  }

  // A profile without permissions is still a valid buyer account.
  if (!normalized.buyer && !normalized.seller && !normalized.admin) {
    return { ...DEFAULT_PERMISSIONS };
  }

  return normalized;
}

export function canAccessView(permissions, view) {
  const normalized = normalizePermissions(permissions);
  return (view === 'buyer' && normalized.buyer)
    || (view === 'seller' && normalized.seller)
    || (view === 'admin' && normalized.admin);
}

export function getDefaultView(permissions) {
  const normalized = normalizePermissions(permissions);
  if (normalized.admin) return 'admin';
  if (normalized.seller) return 'seller';
  return 'buyer';
}
