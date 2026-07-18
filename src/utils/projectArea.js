export const SQUARE_FEET_PER_GUNTHA = 900;

const toNonNegativeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

export const squareFeetToGuntha = (squareFeet) =>
  toNonNegativeNumber(squareFeet) / SQUARE_FEET_PER_GUNTHA;

export const calculateCashbackForArea = (cashbackPerGuntha, purchasedAreaSqFt) =>
  Math.round(toNonNegativeNumber(cashbackPerGuntha) * squareFeetToGuntha(purchasedAreaSqFt));

export const getCashbackPerGuntha = (project) =>
  toNonNegativeNumber(project?.cashbackPerGuntha ?? project?.cashbackAmount);

export const withCanonicalPlotArea = (project = {}) => {
  const minimum = toNonNegativeNumber(project.plotAreaMinSqFt ?? project.sizeMin);
  const maximum = toNonNegativeNumber(project.plotAreaMaxSqFt ?? project.sizeMax);
  const cashbackPerGuntha = getCashbackPerGuntha(project);

  return {
    ...project,
    plotAreaMinSqFt: minimum,
    plotAreaMaxSqFt: maximum,
    sizeMin: minimum,
    sizeMax: maximum,
    cashbackPerGuntha,
    cashbackAmount: cashbackPerGuntha
  };
};
