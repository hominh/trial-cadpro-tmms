import { apiClient } from "@/helpers/api/client";
import type {
  DeviceFeature,
  DeviceFeatureWrite,
  EnforcementDecision,
  EnforcementRequest,
  FeatureHistoryEvent,
  JsonObject,
  Page,
} from "../types/device-management.types";
import { mapFeatureState, mapHistory, mapPage, mapRequest } from "./api-mappers";
const key = () =>
  globalThis.crypto?.randomUUID?.() ??
  `idempotency-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const mutationHeaders = (etag: string) => ({ "If-Match": etag, "Idempotency-Key": key() });
export async function listFeatures(
  deviceId: string,
  signal?: AbortSignal
): Promise<readonly DeviceFeature[]> {
  const response = await apiClient.get<unknown[]>(
    `/api/v1/device-management/devices/${deviceId}/features`,
    { signal }
  );
  return response.data.map(mapFeatureState);
}
export async function updateFeature(
  deviceId: string,
  featureCode: string,
  value: DeviceFeatureWrite,
  etag: string
): Promise<DeviceFeature> {
  const response = await apiClient.put<unknown>(
    `/api/v1/device-management/devices/${deviceId}/features/${featureCode}`,
    { is_enabled: value.isEnabled, config: value.config, reason: value.reason ?? null },
    { headers: mutationHeaders(etag) }
  );
  return mapFeatureState(response.data);
}
export async function requestEnforcement(
  deviceId: string,
  featureCode: string,
  reason: string,
  requestedConfig: JsonObject
): Promise<EnforcementRequest> {
  const response = await apiClient.post<unknown>(
    `/api/v1/device-management/devices/${deviceId}/features/${featureCode}/enforcement-requests`,
    { reason, requested_config: requestedConfig },
    { headers: { "Idempotency-Key": key() } }
  );
  return mapRequest(response.data);
}
export async function listFeatureHistory(
  deviceId: string,
  cursor?: string | null,
  signal?: AbortSignal
): Promise<Page<FeatureHistoryEvent>> {
  const response = await apiClient.get<unknown>(
    `/api/v1/device-management/devices/${deviceId}/feature-history`,
    { signal, params: { cursor: cursor ?? undefined, limit: 50 } }
  );
  return mapPage(response.data, mapHistory);
}
export async function listEnforcementRequests(
  cursor?: string | null,
  signal?: AbortSignal
): Promise<Page<EnforcementRequest>> {
  const response = await apiClient.get<unknown>("/api/v1/device-management/enforcement-requests", {
    signal,
    params: { status: "pending", cursor: cursor ?? undefined, limit: 50 },
  });
  return mapPage(response.data, mapRequest);
}
export async function decideEnforcementRequest(
  requestId: string,
  value: EnforcementDecision,
  etag: string
): Promise<{ readonly request: EnforcementRequest; readonly feature: DeviceFeature }> {
  const response = await apiClient.post<{ request: unknown; feature: unknown }>(
    `/api/v1/device-management/enforcement-requests/${requestId}/decision`,
    { decision: value.decision, note: value.note },
    { headers: mutationHeaders(etag) }
  );
  return {
    request: mapRequest(response.data.request),
    feature: mapFeatureState(response.data.feature),
  };
}
