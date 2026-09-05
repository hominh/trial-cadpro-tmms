import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { useDeviceStateStore } from "@/features/realtime-device-map/stores/device-state-store";
import { useMapUiStore } from "@/features/realtime-device-map/stores/map-ui-store";

export function renderDeviceMap(ui: ReactElement) {
  return render(ui);
}

export function resetDeviceMapStores(): void {
  useDeviceStateStore.getState().reset();
  useMapUiStore.getState().reset();
}

export function useFakeDeviceClock(now = "2026-09-04T00:00:30.000Z"): void {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(now));
}

afterEach(() => {
  vi.useRealTimers();
  resetDeviceMapStores();
});
