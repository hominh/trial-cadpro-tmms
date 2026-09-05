import { apiClient } from "@/helpers/api/client";
import type { DevicePreset, Page, PresetWrite } from "../types/device-management.types";
import { mapPage, mapPreset } from "./api-mappers";
const key = () =>
  globalThis.crypto?.randomUUID?.() ??
  `idempotency-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const body = (value: PresetWrite) => ({
  preset_no: value.presetNo,
  name: value.name,
  pan: value.pan,
  tilt: value.tilt,
  zoom: value.zoom,
  enforcement_zone: value.enforcementZone,
  lane_label: value.laneLabel,
  approach: value.approach,
});
export async function listPresets(
  deviceId: string,
  signal?: AbortSignal
): Promise<Page<DevicePreset>> {
  const response = await apiClient.get<unknown>(
    `/api/v1/device-management/devices/${deviceId}/presets`,
    { signal, params: { limit: 100 } }
  );
  return mapPage(response.data, mapPreset);
}
export async function createPreset(
  deviceId: string,
  value: PresetWrite
): Promise<{ readonly item: DevicePreset; readonly etag: string }> {
  const response = await apiClient.post<unknown>(
    `/api/v1/device-management/devices/${deviceId}/presets`,
    body(value),
    { headers: { "Idempotency-Key": key() } }
  );
  return { item: mapPreset(response.data), etag: String(response.headers.etag ?? "") };
}
export async function updatePreset(
  deviceId: string,
  presetId: string,
  value: PresetWrite,
  etag: string
): Promise<{ readonly item: DevicePreset; readonly etag: string }> {
  const response = await apiClient.put<unknown>(
    `/api/v1/device-management/devices/${deviceId}/presets/${presetId}`,
    body(value),
    { headers: { "If-Match": etag, "Idempotency-Key": key() } }
  );
  return { item: mapPreset(response.data), etag: String(response.headers.etag ?? "") };
}
export async function deletePreset(
  deviceId: string,
  presetId: string,
  etag: string
): Promise<void> {
  await apiClient.delete(`/api/v1/device-management/devices/${deviceId}/presets/${presetId}`, {
    headers: { "If-Match": etag, "Idempotency-Key": key() },
  });
}
