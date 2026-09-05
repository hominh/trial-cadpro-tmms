import { beforeEach, describe, expect, it } from "vitest";
import { asDeviceId } from "../types/device-map.types";
import {
  makeDevice,
  makeSnapshot,
} from "../../../../tests/fixtures/device-map/device-map.fixtures";
import { useDeviceStateStore } from "./device-state-store";

describe("device state store", () => {
  beforeEach(() => useDeviceStateStore.getState().reset());
  it("applies complete snapshots, preserves unchanged references and reconciles membership", () => {
    const store = useDeviceStateStore.getState();
    store.beginRequest("query");
    store.applySnapshot("query", makeSnapshot(3), '"one"');
    const old = useDeviceStateStore.getState().devicesById.get(asDeviceId("device-2"));
    const next = makeSnapshot(2);
    store.applySnapshot("query", next, '"two"');
    const state = useDeviceStateStore.getState();
    expect(state.visibleIds.size).toBe(2);
    expect(state.devicesById.get(asDeviceId("device-2"))).toBe(old);
    expect(state.devicesById.has(asDeviceId("device-3"))).toBe(false);
  });
  it("prevents void/static position movement while accepting newer metadata", () => {
    const first = makeDevice({ stateVersion: 1, positionVersion: 1 });
    const second = makeDevice({
      deviceId: first.deviceId,
      stateVersion: 2,
      positionVersion: 2,
      position: { type: "Point", coordinates: [107, 11] },
      latestGpsStatus: "V",
      alertLevel: "high",
    });
    const store = useDeviceStateStore.getState();
    store.beginRequest("q");
    store.applySnapshot("q", { ...makeSnapshot(1), items: [first] }, null);
    store.applySnapshot("q", { ...makeSnapshot(1), items: [second] }, null);
    const result = useDeviceStateStore.getState().devicesById.get(first.deviceId);
    expect(result?.position).toEqual(first.position);
    expect(result?.alertLevel).toBe("high");
  });
  it("keeps snapshot stale on error and refreshes timestamp on 304", () => {
    const store = useDeviceStateStore.getState();
    store.beginRequest("q");
    store.applySnapshot("q", makeSnapshot(1), null);
    store.markError("q", { kind: "network", message: "offline" });
    expect(useDeviceStateStore.getState().status).toBe("stale");
    store.markNotModified("q", 123);
    expect(useDeviceStateStore.getState().lastSuccessAt).toBe(123);
  });
});
