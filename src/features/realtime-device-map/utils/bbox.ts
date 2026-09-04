import type { DeviceMapFilters, NormalizedMapQuery, ViewportBounds } from "../types/device-map.types";

const PRECISION = 5;

const round = (value: number): number => Number(value.toFixed(PRECISION));

export function validateBounds(bounds: ViewportBounds): ViewportBounds {
  const values = [bounds.west, bounds.south, bounds.east, bounds.north];
  if (!values.every(Number.isFinite)) throw new Error("Viewport bounds must be finite numbers.");
  if (bounds.west < -180 || bounds.east > 180 || bounds.south < -90 || bounds.north > 90) {
    throw new Error("Viewport bounds are outside CRS84 limits.");
  }
  if (bounds.west >= bounds.east) throw new Error("Dateline-crossing or empty bounds are unsupported.");
  if (bounds.south >= bounds.north) throw new Error("Viewport south must be below north.");
  return bounds;
}

export function normalizeBounds(bounds: ViewportBounds): ViewportBounds {
  validateBounds(bounds);
  return {
    west: round(bounds.west),
    south: round(bounds.south),
    east: round(bounds.east),
    north: round(bounds.north),
  };
}

export function serializeBbox(bounds: ViewportBounds): string {
  const normalized = normalizeBounds(bounds);
  return [normalized.west, normalized.south, normalized.east, normalized.north].join(",");
}

export function normalizeFilters(filters: DeviceMapFilters): DeviceMapFilters {
  return {
    deviceTypes: new Set([...filters.deviceTypes].map((value) => value.trim()).filter(Boolean).sort()),
    status: filters.status,
    query: filters.query.trim().slice(0, 100),
  };
}

export function toNormalizedQuery(bounds: ViewportBounds, filters: DeviceMapFilters): NormalizedMapQuery {
  const normalizedBounds = normalizeBounds(bounds);
  const normalizedFilters = normalizeFilters(filters);
  return {
    bbox: [normalizedBounds.west, normalizedBounds.south, normalizedBounds.east, normalizedBounds.north],
    deviceTypes: [...normalizedFilters.deviceTypes],
    status: normalizedFilters.status,
    query: normalizedFilters.query || null,
  };
}

export function createQueryKey(bounds: ViewportBounds, filters: DeviceMapFilters): string {
  return JSON.stringify(toNormalizedQuery(bounds, filters));
}
