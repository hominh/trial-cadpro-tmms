import { apiClient } from "@/helpers/api/client";
import type {
  DeviceFilters,
  DeviceRecord,
  DeviceWrite,
  ObjectRecord,
  ObjectWrite,
  Page,
} from "../types/device-management.types";
import { mapDevice, mapObject, mapPage } from "./api-mappers";
import { normalizeDeviceFilters } from "../utils/device-query";
const key = () =>
  globalThis.crypto?.randomUUID?.() ??
  `idempotency-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const headers = (etag?: string, idempotencyKey = key()) => ({
  "Idempotency-Key": idempotencyKey,
  ...(etag ? { "If-Match": etag } : {}),
});
const objectBody = (value: ObjectWrite) => ({
  code: value.code,
  name: value.name,
  object_type_id: value.objectTypeId,
  location: value.location,
  status: value.status,
  attrs: value.attrs,
});
const deviceBody = (value: DeviceWrite) => ({
  code: value.code,
  name: value.name,
  serial: value.serial,
  device_type_id: value.deviceTypeId,
  object_id: value.objectId,
  config: value.config,
  status: value.status,
});
export async function listDevices(
  filters: DeviceFilters,
  signal?: AbortSignal
): Promise<Page<DeviceRecord>> {
  const normalized = normalizeDeviceFilters(filters);
  const response = await apiClient.get<unknown>("/api/v1/device-management/devices", {
    signal,
    params: {
      object_id: normalized.objectId,
      object_type_id: normalized.objectTypeId,
      device_type_id: normalized.deviceTypeId,
      status: normalized.status,
      q: normalized.search ?? undefined,
      cursor: normalized.cursor ?? undefined,
      limit: normalized.limit,
    },
  });
  return mapPage(response.data, mapDevice);
}
export async function listObjects(search = "", signal?: AbortSignal): Promise<Page<ObjectRecord>> {
  const response = await apiClient.get<unknown>("/api/v1/device-management/objects", {
    signal,
    params: { q: search || undefined, limit: 100 },
  });
  return mapPage(response.data, mapObject);
}
export async function getDevice(
  id: string,
  signal?: AbortSignal
): Promise<{ readonly item: DeviceRecord; readonly etag: string }> {
  const response = await apiClient.get<unknown>(`/api/v1/device-management/devices/${id}`, {
    signal,
  });
  return { item: mapDevice(response.data), etag: String(response.headers.etag ?? "") };
}
export async function createObject(
  value: ObjectWrite
): Promise<{ readonly item: ObjectRecord; readonly etag: string }> {
  const response = await apiClient.post<unknown>(
    "/api/v1/device-management/objects",
    objectBody(value),
    { headers: headers() }
  );
  return { item: mapObject(response.data), etag: String(response.headers.etag ?? "") };
}
export async function updateObject(
  id: string,
  value: ObjectWrite,
  currentEtag: string
): Promise<{ readonly item: ObjectRecord; readonly etag: string }> {
  const response = await apiClient.put<unknown>(
    `/api/v1/device-management/objects/${id}`,
    objectBody(value),
    { headers: headers(currentEtag) }
  );
  return { item: mapObject(response.data), etag: String(response.headers.etag ?? "") };
}
export async function deleteObject(id: string, currentEtag: string): Promise<void> {
  await apiClient.delete(`/api/v1/device-management/objects/${id}`, {
    headers: headers(currentEtag),
  });
}
export async function createDevice(
  value: DeviceWrite
): Promise<{ readonly item: DeviceRecord; readonly etag: string }> {
  const response = await apiClient.post<unknown>(
    "/api/v1/device-management/devices",
    deviceBody(value),
    { headers: headers() }
  );
  return { item: mapDevice(response.data), etag: String(response.headers.etag ?? "") };
}
export async function updateDevice(
  id: string,
  value: DeviceWrite,
  currentEtag: string
): Promise<{ readonly item: DeviceRecord; readonly etag: string }> {
  const response = await apiClient.put<unknown>(
    `/api/v1/device-management/devices/${id}`,
    deviceBody(value),
    { headers: headers(currentEtag) }
  );
  return { item: mapDevice(response.data), etag: String(response.headers.etag ?? "") };
}
export async function deleteDevice(id: string, currentEtag: string): Promise<void> {
  await apiClient.delete(`/api/v1/device-management/devices/${id}`, {
    headers: headers(currentEtag),
  });
}
