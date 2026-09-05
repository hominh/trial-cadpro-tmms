import { describe, expect, it } from "vitest";
import { validatePolygon } from "./polygon";
describe("polygon validation", () => {
  it("accepts a closed valid CRS84 polygon", () =>
    expect(
      validatePolygon({
        type: "Polygon",
        coordinates: [
          [
            [106.7, 10.7],
            [106.71, 10.7],
            [106.71, 10.71],
            [106.7, 10.7],
          ],
        ],
      })
    ).toBeNull());
  it("rejects too few vertices", () =>
    expect(
      validatePolygon({
        type: "Polygon",
        coordinates: [
          [
            [106.7, 10.7],
            [106.71, 10.7],
            [106.7, 10.7],
          ],
        ],
      })
    ).toContain("3 đến 500"));
  it("rejects a self-intersection", () =>
    expect(
      validatePolygon({
        type: "Polygon",
        coordinates: [
          [
            [106.7, 10.7],
            [106.71, 10.71],
            [106.71, 10.7],
            [106.7, 10.71],
            [106.7, 10.7],
          ],
        ],
      })
    ).toContain("tự cắt"));
});
