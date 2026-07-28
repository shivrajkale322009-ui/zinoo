export function getProjectPurchaseValue(project) {
  const purchaseVal = project?.purchasePrice ?? project?.startingPrice ?? project?.priceFrom;

  if (purchaseVal === undefined || purchaseVal === null) {
    throw new Error('Purchase value is missing.');
  }

  const numericPurchaseValue = Number(purchaseVal);
  if (!Number.isFinite(numericPurchaseValue) || numericPurchaseValue <= 0) {
    throw new Error('Purchase value must be a positive number.');
  }

  return numericPurchaseValue;
}
