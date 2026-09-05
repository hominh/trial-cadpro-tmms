// Baseline profile: Chromium headless, 4 vCPU/8 GB, Fast 3G/4G. CI records one warm-up and median of three runs.
import { beforeEach, describe, expect, it } from "vitest";
import { generatePerformanceFixtures } from "../fixtures/device-map/generate-device-map-fixtures";
import { useDeviceStateStore } from "../../src/features/realtime-device-map/stores/device-state-store";
import { createMotionPlan, interpolatePoint } from "../../src/features/realtime-device-map/utils/motion";
import type { DeviceMapSnapshot } from "../../src/features/realtime-device-map/types/device-map.types";

const median = (values: number[]): number => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? Infinity;

describe("5,000-device performance guard", () => {
  const fixture = generatePerformanceFixtures().fiveThousand;
  const snapshot: DeviceMapSnapshot = { snapshotId: "perf", generatedAt: "2026-09-04T00:00:00Z", query: { bbox: [106.5, 10.5, 107, 11], deviceTypes: [], status: "all", query: null }, offlineThresholdSeconds: 30, returned: 5000, unlocatedCount: 0, complete: true, pollAfterMs: 4000, items: fixture };
  beforeEach(() => useDeviceStateStore.getState().reset());
  it("commits a complete snapshot within the one-second interaction budget", () => {
    const runs: number[] = [];
    for (let iteration = 0; iteration < 4; iteration += 1) {
      useDeviceStateStore.getState().beginRequest("perf");
      const start = performance.now(); useDeviceStateStore.getState().applySnapshot("perf", snapshot, null); const elapsed = performance.now() - start;
      if (iteration > 0) runs.push(elapsed);
    }
    expect(median(runs)).toBeLessThan(1000);
    expect(useDeviceStateStore.getState().devicesById.size).toBe(5000);
  });
  it("searches 5,000 devices and exercises linear frames inside budget", () => {
    const start = performance.now();
    const result = fixture.filter((device) => `${device.code} ${device.name}`.toLocaleLowerCase("vi").includes("dv-04999"));
    for (let frame = 0; frame < 120; frame += 1) interpolatePoint({ lat: 10.7, lng: 106.7 }, { lat: 10.71, lng: 106.71 }, frame / 119);
    expect(performance.now() - start).toBeLessThan(1000);
    expect(result).toHaveLength(1);
    expect(createMotionPlan({ lat: 10.7, lng: 106.7 }, { lat: 10.7001, lng: 106.7001 }, 0, 5000).snap).toBe(false);
  });
});
