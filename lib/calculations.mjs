export function parseValue(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number.parseFloat(String(value).replace(/\s/g, "").replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}
export function progress(target, actual, direction = "increase") {
  const t = parseValue(target); const a = parseValue(actual);
  if (t === null || a === null || t <= 0 || (direction === "decrease" && a <= 0)) return null;
  return Math.max(0, Math.round(100 * (direction === "decrease" ? t / a : a / t)));
}
export function metricStatus(value) { return value >= 100 ? "green" : value >= 85 ? "yellow" : "red"; }
export function canTransition(from, to, readiness, unresolved = 0) {
  return (from === "preparation" && to === "review" && readiness >= 70) || (from === "review" && to === "preparation") || (from === "review" && to === "results" && unresolved === 0);
}
export function russianCount(value, forms) {
  const a = value % 100; const b = value % 10;
  return `${value} ${a >= 11 && a <= 14 ? forms[2] : b === 1 ? forms[0] : b >= 2 && b <= 4 ? forms[1] : forms[2]}`;
}
