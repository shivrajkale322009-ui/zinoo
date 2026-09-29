export function scopedCashbacks(claims = [], role, accountId) {
  if (role === 'admin') return claims;
  if (!accountId) return [];
  if (role === 'seller') return claims.filter((claim) => claim.projectOwnerId === accountId);
  if (role === 'buyer') return claims.filter((claim) => claim.createdBy === accountId);
  return [];
}
