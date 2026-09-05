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
    const host = document.createElement("div");
    const heading = document.createElementNS("http://www.w3.org/2000/svg", "g");
    heading.setAttribute("data-marker-heading", "");
    host.append(heading);
    const marker = {
      getLatLng: () => ({ lat: 10, lng: 106 }),
      setLatLng,
      getElement: () => host,
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
    expect(heading.getAttribute("transform")).toBe("rotate(90 19 19)");
    expect(heading.hasAttribute("style")).toBe(false);
    unmount();
  });
});
