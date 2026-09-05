"use client";

import { useCallback, useEffect } from "react";
import { listDevices } from "../services/device-catalog-api";
import { useDeviceCatalogStore } from "../stores/device-catalog-store";
import { useDeviceManagementUiStore } from "../stores/device-management-ui-store";

export function useDeviceList() {
  const filters = useDeviceManagementUiStore((state) => state.filters);
  const setDevices = useDeviceCatalogStore((state) => state.setDevices);
  const setLoading = useDeviceCatalogStore((state) => state.setLoading);
  const setError = useDeviceCatalogStore((state) => state.setError);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        setDevices(await listDevices(filters, signal));
      } catch (error) {
        if (signal?.aborted) return;
        setError(error instanceof Error ? error.message : "Không tải được danh sách device");
      }
    },
    [filters, setDevices, setError, setLoading]
  );
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  const reload = useCallback(() => load(), [load]);

  return { reload };
}
