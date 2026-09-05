import { apiClient } from "@/helpers/api/client";
import type { Catalogs, Permission, SessionContext } from "../types/device-management.types";
import { mapActor, mapDeviceType, mapObjectType } from "./api-mappers";

export async function getCatalogs(signal?: AbortSignal): Promise<Catalogs> {
  const response = await apiClient.get<Record<string, unknown>>(
    "/api/v1/device-management/catalogs",
    { signal }
  );
  const data = response.data;
  return {
    objectTypes: Array.isArray(data.object_types) ? data.object_types.map(mapObjectType) : [],
    deviceTypes: Array.isArray(data.device_types) ? data.device_types.map(mapDeviceType) : [],
    objectStatuses: Array.isArray(data.object_statuses)
      ? data.object_statuses.filter((item): item is string => typeof item === "string")
      : [],
    deviceStatuses: Array.isArray(data.device_statuses)
      ? data.device_statuses.filter((item): item is string => typeof item === "string")
      : [],
  };
}
export async function getSessionContext(signal?: AbortSignal): Promise<SessionContext> {
  const response = await apiClient.get<Record<string, unknown>>(
    "/api/v1/device-management/session-context",
    { signal }
  );
  return {
    actor: mapActor(response.data.actor),
    permissions: (Array.isArray(response.data.permissions) ? response.data.permissions : []).filter(
      (item): item is Permission => typeof item === "string"
    ) as Permission[],
  };
}
