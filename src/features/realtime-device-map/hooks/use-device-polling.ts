"use client";

import { useEffect, useMemo } from "react";
import { fetchDeviceMapSnapshot, type DeviceMapApiResult } from "../services/device-map-api";
import { useDeviceStateStore } from "../stores/device-state-store";
import { useMapUiStore } from "../stores/map-ui-store";
import type { DeviceMapError, DeviceMapFilters, ViewportBounds } from "../types/device-map.types";
import { createQueryKey } from "../utils/bbox";

type Fetcher = (input: {
  bounds: ViewportBounds;
  filters: DeviceMapFilters;
  signal: AbortSignal;
}) => Promise<DeviceMapApiResult>;

export function useDevicePolling(options: { pollMs?: number; fetcher?: Fetcher } = {}): void {
  const bounds = useMapUiStore((state) => state.viewportBounds);
  const filters = useMapUiStore((state) => state.filters);
  const configuredPollMs =
    options.pollMs ?? (Number(process.env.NEXT_PUBLIC_DEVICE_MAP_POLL_MS) || 4000);
  const pollMs = Math.min(5000, Math.max(3000, configuredPollMs));
  const fetcher = options.fetcher ?? fetchDeviceMapSnapshot;
  const queryKey = useMemo(
    () => (bounds ? createQueryKey(bounds, filters) : null),
    [bounds, filters]
  );

  useEffect(() => {
    if (!bounds || !queryKey) return;
    let controller: AbortController | null = null;
    let generation = 0;
    let disposed = false;
    let nextAllowedAt = 0;

    const poll = async (): Promise<void> => {
      if (Date.now() < nextAllowedAt) return;
      controller?.abort();
      controller = new AbortController();
      const currentGeneration = ++generation;
      useDeviceStateStore.getState().beginRequest(queryKey);
      try {
        const result = await fetcher({ bounds, filters, signal: controller.signal });
        if (
          disposed ||
          currentGeneration !== generation ||
          useDeviceStateStore.getState().activeQueryKey !== queryKey
        )
          return;
        if (result.kind === "notModified")
          useDeviceStateStore.getState().markNotModified(queryKey, result.receivedAt);
        else useDeviceStateStore.getState().applySnapshot(queryKey, result.snapshot, result.etag);
      } catch (error) {
        const mapError = error as DeviceMapError;
        if (disposed || currentGeneration !== generation || mapError.kind === "cancelled") return;
        if (mapError.kind === "tooDense")
          useDeviceStateStore
            .getState()
            .markTooDense(queryKey, mapError.matched ?? 5001, mapError.maxItems ?? 5000);
        else {
          if (mapError.kind === "rateLimited" && mapError.retryAfterSeconds)
            nextAllowedAt = Date.now() + mapError.retryAfterSeconds * 1000;
          useDeviceStateStore.getState().markError(queryKey, mapError);
        }
      }
    };

    void poll();
    const interval = window.setInterval(() => void poll(), pollMs);
    return () => {
      disposed = true;
      generation += 1;
      window.clearInterval(interval);
      controller?.abort();
    };
  }, [bounds, fetcher, filters, pollMs, queryKey]);
}
