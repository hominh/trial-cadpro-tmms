import { describe, expect, it } from "vitest";
import { createQueryKey, normalizeBounds, normalizeFilters, serializeBbox } from "./bbox";

describe("bbox utilities", () => {
  const bounds = { west: 106.600001, south: 10.700001, east: 106.900001, north: 10.950001 };

  it("serializes normalized CRS84 longitude/latitude order", () => {
    expect(serializeBbox(bounds)).toBe("106.6,10.7,106.9,10.95");
  });

  it("normalizes filters and produces stable query keys", () => {
    const a = {
      deviceTypes: new Set([" bus_gps ", "lpr_camera"]),
      status: "all" as const,
      query: " Bus ",
    };
    const b = {
      deviceTypes: new Set(["lpr_camera", "bus_gps"]),
      status: "all" as const,
      query: "Bus",
    };
    expect(normalizeFilters(a).query).toBe("Bus");
    expect(createQueryKey(bounds, a)).toBe(createQueryKey(normalizeBounds(bounds), b));
  });

  it("rejects dateline crossing", () => {
    expect(() => normalizeBounds({ west: 170, south: -10, east: -170, north: 10 })).toThrow(
      /Dateline/
    );
  });
});
