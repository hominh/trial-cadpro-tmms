import { beforeEach, describe, expect, it } from "vitest";
import { asDeviceId } from "../types/device-map.types";
import { useMapUiStore } from "./map-ui-store";

describe("map UI store", () => {
  beforeEach(() => useMapUiStore.getState().reset());
  it("keeps viewport, filters and selection independent", () => {
    const store = useMapUiStore.getState();
    store.setViewportBounds({ west: 106.600001, south: 10.7, east: 106.9, north: 10.95 });
    store.setStatus("offline");
    store.setQuery("BUS");
    store.selectDevice(asDeviceId("bus-1"));
    expect(useMapUiStore.getState()).toMatchObject({
      detailPanelOpen: true,
      filters: { status: "offline", query: "BUS" },
    });
  });
  it("clears a missing selection after reconciliation", () => {
    const store = useMapUiStore.getState();
    store.selectDevice(asDeviceId("bus-1"));
    store.reconcileSelection(new Set());
    expect(useMapUiStore.getState().selectedDeviceId).toBeNull();
  });
});
