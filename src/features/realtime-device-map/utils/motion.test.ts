import { describe, expect, it } from "vitest";
import { createMotionPlan, inferSpeedKph, interpolatePoint, shortestAngleDelta } from "./motion";

const a = { lat: 10.77, lng: 106.7 };
describe("motion math", () => {
  it("interpolates linearly", () => {
    const result = interpolatePoint(a, { lat: 10.78, lng: 106.72 }, 0.5);
    expect(result.lat).toBeCloseTo(10.775);
    expect(result.lng).toBeCloseTo(106.71);
  });
  it("uses exact fix elapsed time", () => expect(createMotionPlan(a, { lat: 10.7701, lng: 106.7001 }, 1000, 6000)).toMatchObject({ durationMs: 5000, snap: false }));
  it("snaps only above 120 km/h or eight seconds", () => {
    expect(createMotionPlan(a, { lat: 11.77, lng: 107.7 }, 1000, 6000).snap).toBe(true);
    expect(createMotionPlan(a, { lat: 10.7701, lng: 106.7001 }, 1000, 9001).snap).toBe(true);
    expect(inferSpeedKph(a, a, 5000)).toBe(0);
  });
  it("rotates by the shortest angle", () => expect(shortestAngleDelta(350, 10)).toBe(20));
});
