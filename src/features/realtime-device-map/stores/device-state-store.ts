import { create } from "zustand";
import type {
  DeviceId,
  DeviceMapError,
  DeviceMapSnapshot,
  DeviceState,
} from "../types/device-map.types";

export type DeviceStoreStatus = "idle" | "loading" | "success" | "stale" | "error" | "tooDense";

interface DeviceStateStore {
  devicesById: Map<DeviceId, DeviceState>;
  visibleIds: Set<DeviceId>;
  activeQueryKey: string | null;
  snapshotId: string | null;
  generatedAt: string | null;
  lastSuccessAt: number | null;
  etag: string | null;
  status: DeviceStoreStatus;
  error: DeviceMapError | null;
  unlocatedCount: number;
  tooDense: { matched: number; maxItems: number } | null;
  beginRequest: (queryKey: string) => void;
  applySnapshot: (queryKey: string, snapshot: DeviceMapSnapshot, etag: string | null) => void;
  markNotModified: (queryKey: string, receivedAt: number) => void;
  markError: (queryKey: string, error: DeviceMapError) => void;
  markTooDense: (queryKey: string, matched: number, maxItems: number) => void;
  reset: () => void;
}

const initialState = {
  devicesById: new Map<DeviceId, DeviceState>(),
  visibleIds: new Set<DeviceId>(),
  activeQueryKey: null,
  snapshotId: null,
  generatedAt: null,
  lastSuccessAt: null,
  etag: null,
  status: "idle" as const,
  error: null,
  unlocatedCount: 0,
  tooDense: null,
};

function hasValidPosition(device: DeviceState): boolean {
  const [longitude, latitude] = device.position.coordinates;
  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
}

function safeIncoming(current: DeviceState | undefined, incoming: DeviceState): DeviceState {
  if (!current) return incoming;
  const preservePosition =
    incoming.latestGpsStatus === "V" ||
    !hasValidPosition(incoming) ||
    (incoming.mobility === "mobile" && incoming.isStatic);
  if (!preservePosition) return incoming;
  return { ...incoming, position: current.position, positionVersion: current.positionVersion };
}

export const useDeviceStateStore = create<DeviceStateStore>((set) => ({
  ...initialState,
  beginRequest: (queryKey) =>
    set((state) => ({
      activeQueryKey: queryKey,
      status: state.lastSuccessAt === null ? "loading" : state.status,
      error: null,
      tooDense: null,
    })),
  applySnapshot: (queryKey, snapshot, etag) =>
    set((state) => {
      if (state.activeQueryKey !== queryKey) return state;
      const next = new Map(state.devicesById);
      const visible = new Set<DeviceId>();
      for (const incoming of snapshot.items) {
        visible.add(incoming.deviceId);
        const current = next.get(incoming.deviceId);
        if (!current || incoming.stateVersion > current.stateVersion)
          next.set(incoming.deviceId, safeIncoming(current, incoming));
      }
      for (const id of next.keys()) if (!visible.has(id)) next.delete(id);
      return {
        devicesById: next,
        visibleIds: visible,
        snapshotId: snapshot.snapshotId,
        generatedAt: snapshot.generatedAt,
        lastSuccessAt: Date.now(),
        etag,
        status: "success",
        error: null,
        unlocatedCount: snapshot.unlocatedCount,
        tooDense: null,
      };
    }),
  markNotModified: (queryKey, receivedAt) =>
    set((state) =>
      state.activeQueryKey === queryKey
        ? { lastSuccessAt: receivedAt, status: "success", error: null }
        : state
    ),
  markError: (queryKey, error) =>
    set((state) =>
      state.activeQueryKey === queryKey
        ? { status: state.lastSuccessAt === null ? "error" : "stale", error }
        : state
    ),
  markTooDense: (queryKey, matched, maxItems) =>
    set((state) =>
      state.activeQueryKey === queryKey
        ? { status: "tooDense", tooDense: { matched, maxItems }, error: null }
        : state
    ),
  reset: () => set({ ...initialState, devicesById: new Map(), visibleIds: new Set() }),
}));

export const selectVisibleDevices = (state: DeviceStateStore): DeviceState[] =>
  [...state.visibleIds].flatMap((id) => {
    const item = state.devicesById.get(id);
    return item ? [item] : [];
  });
