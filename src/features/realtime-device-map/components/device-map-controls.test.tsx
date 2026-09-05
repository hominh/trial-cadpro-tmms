import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeDevice, makeSnapshot } from "../../../../tests/fixtures/device-map/device-map.fixtures";
import { DeviceDetailPanel } from "./device-detail-panel";
import { DeviceMapFilters } from "./device-map-filters";
import { useDeviceStateStore } from "../stores/device-state-store";
import { useMapUiStore } from "../stores/map-ui-store";

describe("map controls and detail", () => {
  beforeEach(() => { vi.useFakeTimers(); useDeviceStateStore.getState().reset(); useMapUiStore.getState().reset(); });
  it("supports partial code/name search", () => {
    render(<DeviceMapFilters />);
    fireEvent.change(screen.getByPlaceholderText(/Tìm mã hoặc tên/), { target: { value: "xe BuÝt" } });
    vi.advanceTimersByTime(250);
    expect(useMapUiStore.getState().filters.query).toBe("xe BuÝt");
  });
  it("shows complete mobile details and explicit offline text", () => {
    const device = makeDevice({ online: false, activePresetId: "preset-1" });
    const server = useDeviceStateStore.getState(); server.beginRequest("q"); server.applySnapshot("q", { ...makeSnapshot(1), items: [device] }, null);
    useMapUiStore.getState().selectDevice(device.deviceId);
    render(<DeviceDetailPanel />);
    expect(screen.getByTestId("complete-device-detail")).toHaveTextContent("Offline");
    expect(screen.getByText("preset-1")).toBeInTheDocument();
  });
});
