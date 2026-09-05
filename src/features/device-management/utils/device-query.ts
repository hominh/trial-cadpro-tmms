import type { DeviceFilters } from "../types/device-management.types";

export function normalizeDeviceFilters(filters: DeviceFilters): Required<
  Pick<DeviceFilters, "limit">
> &
  Omit<DeviceFilters, "limit" | "search" | "cursor"> & {
    readonly search: string | null;
    readonly cursor: string | null;
  } {
  const search = filters.search?.trim().toLocaleLowerCase() ?? "";
  return {
    ...filters,
    limit: Math.min(100, Math.max(1, filters.limit ?? 50)),
    search: search || null,
    cursor: filters.cursor ?? null,
  };
}

export function deviceQueryKey(filters: DeviceFilters): string {
  const value = normalizeDeviceFilters(filters);
  return JSON.stringify([
    value.objectId ?? null,
    value.objectTypeId ?? null,
    value.deviceTypeId ?? null,
    value.status ?? null,
    value.search,
    value.cursor,
    value.limit,
  ]);
}
