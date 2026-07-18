export const DEFAULT_PERMISSIONS = Object.freeze({
  buyer: true,
  seller: false,
  admin: false
});

export function normalizePermissions(permissions = {}) {
  // Support legacy role-based documents
  if (permissions.role) {
    switch (permissions.role) {
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
    buyer: Boolean(permissions?.buyer),
    seller: Boolean(permissions?.seller),
    admin: Boolean(permissions?.admin)
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
