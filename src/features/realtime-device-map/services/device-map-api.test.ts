import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { deviceMapMockServer } from "../../../../tests/mocks/device-map/server";
import { DEFAULT_FILTERS } from "../types/device-map.types";
import { clearDeviceMapEtags, fetchDeviceMapSnapshot } from "./device-map-api";

const bounds = { west: 106.6, south: 10.7, east: 106.9, north: 10.95 };
describe("device map API", () => {
  beforeAll(() => deviceMapMockServer.listen({ onUnhandledRequest: "error" }));
  afterEach(() => { deviceMapMockServer.resetHandlers(); clearDeviceMapEtags(); });
  afterAll(() => deviceMapMockServer.close());
  it("encodes bbox and maps 200 then ETag/304", async () => {
    const first = await fetchDeviceMapSnapshot({ bounds, filters: DEFAULT_FILTERS, signal: new AbortController().signal });
    expect(first.kind).toBe("snapshot");
    const second = await fetchDeviceMapSnapshot({ bounds, filters: DEFAULT_FILTERS, signal: new AbortController().signal });
    expect(second.kind).toBe("notModified");
  });
  it("maps density errors", async () => {
    await expect(fetchDeviceMapSnapshot({ bounds, filters: { ...DEFAULT_FILTERS, query: "too-dense" }, signal: new AbortController().signal })).rejects.toMatchObject({ kind: "tooDense", status: 422 });
  });
  it("rejects malformed snapshots atomically", async () => {
    deviceMapMockServer.use(http.get("*/api/v1/map/device-states", () => HttpResponse.json({ complete: false, items: [] })));
    await expect(fetchDeviceMapSnapshot({ bounds, filters: DEFAULT_FILTERS, signal: new AbortController().signal })).rejects.toMatchObject({ kind: "contract" });
  });
});
