import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Marker } from "leaflet";
import { asDeviceId } from "../types/device-map.types";
import { useMarkerMotion } from "./use-marker-motion";

describe("useMarkerMotion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      window.setTimeout(() => {
        now += 2500;
        callback(now);
      }, 0)
    );
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  });
  it("retargets through one shared linear scheduler", () => {
    const setLatLng = vi.fn();
    const marker = {
      getLatLng: () => ({ lat: 10, lng: 106 }),
      setLatLng,
      getElement: () => null,
    } as unknown as Marker;
    const { result, unmount } = renderHook(() => useMarkerMotion());
    act(() =>
      result.current.retarget({
        id: asDeviceId("bus"),
        marker,
        fromConfirmed: { lat: 10, lng: 106 },
        to: { lat: 10.001, lng: 106.001 },
        fromObservedAtMs: 0,
        toObservedAtMs: 5000,
        fromCourse: 0,
        toCourse: 90,
      })
    );
    expect(setLatLng).not.toHaveBeenCalled();
    act(() => vi.runAllTimers());
    expect(setLatLng).toHaveBeenCalledTimes(2);
    unmount();
  });
});
