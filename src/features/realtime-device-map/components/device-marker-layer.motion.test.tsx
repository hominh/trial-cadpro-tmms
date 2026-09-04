import L from "leaflet";
import { describe, expect, it } from "vitest";
import { createMotionPlan } from "../utils/motion";

describe("marker motion integration contracts", () => {
  it("keeps Leaflet outer transform ownership", () => {
    const marker = L.marker([10.77, 106.7]);
    marker.setLatLng([10.78, 106.71]);
    expect(marker.getLatLng()).toMatchObject({ lat: 10.78, lng: 106.71 });
  });
  it("snaps only at the specified validity thresholds", () => {
    const from = { lat: 10.77, lng: 106.7 };
    expect(createMotionPlan(from, { lat: 10.7701, lng: 106.7001 }, 0, 5000).snap).toBe(false);
    expect(createMotionPlan(from, { lat: 10.7701, lng: 106.7001 }, 0, 8001).snap).toBe(true);
  });
});
