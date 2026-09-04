import { AxiosError } from "axios";
import { apiClient, normalizeApiError } from "@/helpers/api/client";
import { createQueryKey, serializeBbox, toNormalizedQuery } from "../utils/bbox";
import type { DeviceMapError, DeviceMapFilters, DeviceMapSnapshot, DeviceState, ViewportBounds } from "../types/device-map.types";
import { asDeviceId } from "../types/device-map.types";

interface DeviceMapItemDto {
  device_id: string; code: string; name: string;
  device_type: { code: string; name: string; icon_id?: string | null; ui_panel?: string | null };
  mobility: "fixed" | "mobile"; position: { type: "Point"; coordinates: [number, number] };
  position_source: "object_location" | "device_state_valid_gps"; position_observed_at: string;
  position_version: number; state_version: number; last_seen_at: string; online: boolean;
  speed_kph?: number | null; course_deg?: number | null; is_static: boolean;
  latest_gps_status?: string | null; alert_level: string; active_preset_id?: string | null;
  preset_source?: string | null;
}

interface SnapshotDto {
  snapshot_id: string; generated_at: string;
  query: { bbox: [number, number, number, number]; device_types: string[]; status: "all" | "online" | "offline"; q: string | null };
  offline_threshold_seconds: number; returned: number; unlocated_count: number;
  complete: boolean; poll_after_ms: number; items: DeviceMapItemDto[];
}

export type DeviceMapApiResult =
  | { readonly kind: "snapshot"; readonly snapshot: DeviceMapSnapshot; readonly etag: string | null }
  | { readonly kind: "notModified"; readonly receivedAt: number };

const etags = new Map<string, string>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assertSnapshotDto(value: unknown): asserts value is SnapshotDto {
  if (!isRecord(value) || !Array.isArray(value.items) || value.complete !== true || value.offline_threshold_seconds !== 30) {
    throw new Error("Malformed or partial device-map snapshot.");
  }
  if (value.returned !== value.items.length || value.items.length > 5000 || typeof value.snapshot_id !== "string") {
    throw new Error("Invalid device-map snapshot cardinality.");
  }
}

function mapItem(item: DeviceMapItemDto): DeviceState {
  const [longitude, latitude] = item.position.coordinates;
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude) || longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    throw new Error(`Invalid coordinates for ${item.device_id}.`);
  }
  return {
    deviceId: asDeviceId(item.device_id), code: item.code, name: item.name,
    deviceType: { code: item.device_type.code, name: item.device_type.name, iconId: item.device_type.icon_id ?? null, uiPanel: item.device_type.ui_panel ?? null },
    mobility: item.mobility, position: { type: "Point", coordinates: [longitude, latitude] }, positionSource: item.position_source,
    positionObservedAt: item.position_observed_at, positionVersion: item.position_version, stateVersion: item.state_version,
    lastSeenAt: item.last_seen_at, online: item.online, speedKph: item.speed_kph ?? null, courseDeg: item.course_deg ?? null,
    isStatic: item.is_static, latestGpsStatus: item.latest_gps_status ?? null, alertLevel: item.alert_level,
    activePresetId: item.active_preset_id ?? null, presetSource: item.preset_source ?? null,
  };
}

function mapSnapshot(dto: SnapshotDto): DeviceMapSnapshot {
  return {
    snapshotId: dto.snapshot_id, generatedAt: dto.generated_at,
    query: { bbox: dto.query.bbox, deviceTypes: dto.query.device_types, status: dto.query.status, query: dto.query.q },
    offlineThresholdSeconds: 30, returned: dto.returned, unlocatedCount: dto.unlocated_count,
    complete: true, pollAfterMs: dto.poll_after_ms, items: dto.items.map(mapItem),
  };
}

export function clearDeviceMapEtags(): void { etags.clear(); }

export async function fetchDeviceMapSnapshot(input: { bounds: ViewportBounds; filters: DeviceMapFilters; signal: AbortSignal }): Promise<DeviceMapApiResult> {
  const key = createQueryKey(input.bounds, input.filters);
  const query = toNormalizedQuery(input.bounds, input.filters);
  try {
    const response = await apiClient.get<unknown>("/api/v1/map/device-states", {
      signal: input.signal,
      params: { bbox: serializeBbox(input.bounds), device_types: query.deviceTypes.length ? query.deviceTypes.join(",") : undefined, status: query.status, q: query.query ?? undefined, limit: 5000 },
      headers: etags.has(key) ? { "If-None-Match": etags.get(key) } : undefined,
      validateStatus: (status) => status === 200 || status === 304,
    });
    if (response.status === 304) return { kind: "notModified", receivedAt: Date.now() };
    assertSnapshotDto(response.data);
    const etag = typeof response.headers.etag === "string" ? response.headers.etag : null;
    if (etag) etags.set(key, etag);
    return { kind: "snapshot", snapshot: mapSnapshot(response.data), etag };
  } catch (error) {
    if (error instanceof Error && !(error instanceof AxiosError)) throw <DeviceMapError>{ kind: "contract", message: error.message };
    if (error instanceof AxiosError && error.response?.status === 422) {
      const data = error.response.data as { matched?: number; max_items?: number };
      throw <DeviceMapError>{ kind: "tooDense", message: "Viewport contains too many devices.", status: 422, matched: data.matched, maxItems: data.max_items };
    }
    const normalized = normalizeApiError(error);
    throw <DeviceMapError>{ kind: normalized.cancelled ? "cancelled" : normalized.status === 429 ? "rateLimited" : normalized.status && normalized.status >= 500 ? "server" : "network", message: normalized.message, status: normalized.status, retryAfterSeconds: normalized.retryAfterSeconds };
  }
}
