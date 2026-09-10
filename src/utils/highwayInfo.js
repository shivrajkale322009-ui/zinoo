const GENERATED_HIGHWAY_LINE = /^(?:🛣️ Highway Touch|📍 \d+ m from .+)$/u;

export function formatHighwayDescriptionLine({ highwayName, highwayDistance, isHighwayTouch } = {}) {
  if (!highwayName || !Number.isFinite(Number(highwayDistance))) return '';
  const distance = Math.max(0, Math.round(Number(highwayDistance)));
  return isHighwayTouch || distance <= 100
    ? '🛣️ Highway Touch'
    : `📍 ${distance} m from ${highwayName}`;
}

export function removeGeneratedHighwayLine(description = '') {
  return String(description)
    .split(/\r?\n/)
    .filter((line) => !GENERATED_HIGHWAY_LINE.test(line.trim()))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function applyHighwayResult(project = {}, result = null) {
  const description = removeGeneratedHighwayLine(project.description);
  if (!result?.found || !result.highwayName || !Number.isFinite(Number(result.highwayDistance))) {
    return {
      ...project,
      description,
      highwayName: '',
      highwayDistance: null,
      isHighwayTouch: false,
      lastCalculatedAt: null
    };
  }

  const highwayDistance = Math.max(0, Math.round(Number(result.highwayDistance)));
  const isHighwayTouch = highwayDistance <= 100;
  const line = formatHighwayDescriptionLine({
    highwayName: result.highwayName,
    highwayDistance,
    isHighwayTouch
  });

  return {
    ...project,
    description: [description, line].filter(Boolean).join('\n\n'),
    highwayName: result.highwayName,
    highwayDistance,
    isHighwayTouch,
    lastCalculatedAt: result.lastCalculatedAt || new Date().toISOString()
  };
}
