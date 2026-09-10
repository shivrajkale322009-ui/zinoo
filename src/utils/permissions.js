export const DEFAULT_PERMISSIONS = Object.freeze({
  buyer: true,
  seller: false,
  admin: false
});

export function normalizePermissions(permissions = {}) {
  // Accept both a permissions map and the complete Firestore user document.
  // Some legacy accounts store `role` at the document root while newer
  // accounts store booleans inside `permissions`.
  const permissionMap = permissions?.permissions && typeof permissions.permissions === 'object'
    ? permissions.permissions
    : permissions;
  const role = String(permissions?.role ?? permissionMap?.role ?? '')
    .trim()
    .toLowerCase();

  if (role) {
    switch (role) {
      case "admin":
        return {
          buyer: true,
          seller: true,
          admin: true
        };

      case "seller":
        return {
          buyer: true,
          seller: true,
          admin: false
        };

      default:
        return {
          buyer: true,
          seller: false,
          admin: false
        };
    }
  }

  const normalized = {
    buyer: permissionMap?.buyer === true,
    seller: permissionMap?.seller === true,
    admin: permissionMap?.admin === true
  };

  if (normalized.admin) {
    normalized.buyer = true;
    normalized.seller = true;
  }

  if (!normalized.buyer && !normalized.seller && !normalized.admin) {
    return { ...DEFAULT_PERMISSIONS };
  }

  return normalized;
}

export function canAccessView(permissions, view) {
  const normalized = normalizePermissions(permissions);

  return (
    (view === "buyer" && normalized.buyer) ||
    (view === "seller" && normalized.seller) ||
    (view === "admin" && normalized.admin)
  );
}

export function getDefaultView(permissions) {
  const normalized = normalizePermissions(permissions);

  if (normalized.admin) return "admin";
  if (normalized.seller) return "seller";
  return "buyer";
}

export function isApprovedSellerAccount(account) {
  if (!account || !normalizePermissions(account.permissions).seller) return false;
  const blockedStatuses = new Set(['pending', 'rejected', 'suspended', 'disabled', 'inactive', 'revoked']);
  const statuses = [account.status, account.sellerStatus, account.approvalStatus, account.reviewStatus]
    .map((value) => String(value ?? '').trim().toLowerCase())
    .filter(Boolean);
  return !statuses.some((status) => blockedStatuses.has(status));
}
