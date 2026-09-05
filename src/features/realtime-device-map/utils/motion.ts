export interface LatLngValue { readonly lat: number; readonly lng: number }
export interface MotionPlan { readonly durationMs: number; readonly inferredSpeedKph: number; readonly snap: boolean }

const EARTH_RADIUS_M = 6_371_000;
const toRadians = (degrees: number): number => degrees * Math.PI / 180;

export function isValidLatLng(value: LatLngValue): boolean {
  return Number.isFinite(value.lat) && Number.isFinite(value.lng) && value.lat >= -90 && value.lat <= 90 && value.lng >= -180 && value.lng <= 180;
}

export function distanceMeters(from: LatLngValue, to: LatLngValue): number {
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const h = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function inferSpeedKph(from: LatLngValue, to: LatLngValue, elapsedMs: number): number {
  if (elapsedMs <= 0) return Number.POSITIVE_INFINITY;
  return distanceMeters(from, to) / elapsedMs * 3600;
}

export function createMotionPlan(from: LatLngValue, to: LatLngValue, fromObservedAtMs: number, toObservedAtMs: number): MotionPlan {
  if (!isValidLatLng(from) || !isValidLatLng(to)) throw new Error("Invalid motion coordinates.");
  const durationMs = Math.max(0, toObservedAtMs - fromObservedAtMs);
  const inferredSpeedKph = inferSpeedKph(from, to, durationMs);
  return { durationMs, inferredSpeedKph, snap: inferredSpeedKph > 120 || durationMs > 8000 };
}

export function interpolatePoint(from: LatLngValue, to: LatLngValue, progress: number): LatLngValue {
  const t = Math.min(1, Math.max(0, progress));
  return { lat: from.lat + (to.lat - from.lat) * t, lng: from.lng + (to.lng - from.lng) * t };
}

export function shortestAngleDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

export function interpolateAngle(from: number, to: number, progress: number): number {
  return (from + shortestAngleDelta(from, to) * Math.min(1, Math.max(0, progress)) + 360) % 360;
}
