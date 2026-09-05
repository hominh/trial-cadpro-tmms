import { describe, expect, it } from "vitest";
import { deviceQueryKey, normalizeDeviceFilters } from "./device-query";
describe("device query", () => {
  it("bounds the page and normalizes a partial search", () => {
    expect(normalizeDeviceFilters({ search: "  CaMeRa ", limit: 900 })).toMatchObject({
      search: "camera",
      limit: 100,
      cursor: null,
    });
  });
  it("uses stable keys", () => {
    expect(deviceQueryKey({ search: "A", limit: 50 })).toBe(
      deviceQueryKey({ search: " a ", limit: 50 })
    );
  });
});
