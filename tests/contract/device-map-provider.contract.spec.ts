import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { apiClient } from "../../src/helpers/api/client";
import { deviceMapMockServer } from "../mocks/device-map/server";

const realBackend = process.env.PROVIDER_CONTRACT_BASE_URL;

describe("OpenAPI-compatible MSW fallback", () => {
  beforeAll(() => deviceMapMockServer.listen({ onUnhandledRequest: "error" }));
  afterAll(() => deviceMapMockServer.close());
  it("provides a complete shape, ETag/304 and density error", async () => {
    const params = { bbox: "106.6,10.7,106.9,10.95", status: "all", limit: 5000 };
    const first = await apiClient.get("/api/v1/map/device-states", { params });
    expect(first.status).toBe(200);
    expect(first.data).toMatchObject({ complete: true, offline_threshold_seconds: 30, returned: 1 });
    const second = await apiClient.get("/api/v1/map/device-states", { params, headers: { "If-None-Match": first.headers.etag }, validateStatus: (status) => status === 304 });
    expect(second.status).toBe(304);
    await expect(apiClient.get("/api/v1/map/device-states", { params: { ...params, q: "too-dense" } })).rejects.toMatchObject({ response: { status: 422, data: { code: "VIEWPORT_TOO_DENSE" } } });
  });
  it("changes the representation and ETag when server time makes a device offline", async () => {
    const params = { bbox: "106.6,10.7,106.9,10.95", status: "all", limit: 5000, q: "offline-transition" };
    const online = await apiClient.get("/api/v1/map/device-states", { params });
    expect(online.data.items[0].online).toBe(true);
    const offline = await apiClient.get("/api/v1/map/device-states", {
      params,
      headers: { "If-None-Match": online.headers.etag },
    });
    expect(offline.status).toBe(200);
    expect(offline.headers.etag).not.toBe(online.headers.etag);
    expect(offline.data.items[0].online).toBe(false);
  });
});

describe.skipIf(!realBackend)("real backend provider gate", () => {
  const bbox = process.env.PROVIDER_CONTRACT_BBOX ?? "106.6,10.7,106.9,10.95";
  const params = { bbox, status: "all", limit: 5000 };

  beforeAll(() => {
    apiClient.defaults.baseURL = realBackend;
  });

  it("validates the complete response representation and ETag/304", async () => {
    const response = await apiClient.get("/api/v1/map/device-states", { params });
    expect(response.status).toBe(200);
    expect(response.headers.etag).toBeTruthy();
    expect(response.data).toMatchObject({ complete: true, offline_threshold_seconds: 30, items: expect.any(Array) });
    expect(response.data.items[0]).toMatchObject({
      device_id: expect.any(String),
      code: expect.any(String),
      name: expect.any(String),
      online: expect.any(Boolean),
      device_type: { code: expect.any(String), name: expect.any(String) },
    });
    const unchanged = await apiClient.get("/api/v1/map/device-states", {
      params,
      headers: { "If-None-Match": response.headers.etag },
      validateStatus: (status) => status === 304,
    });
    expect(unchanged.status).toBe(304);
  });

  it("returns VIEWPORT_TOO_DENSE instead of truncating", async () => {
    const denseBbox = process.env.PROVIDER_CONTRACT_DENSE_BBOX;
    expect(denseBbox, "Set PROVIDER_CONTRACT_DENSE_BBOX to a seeded viewport containing over 5,000 devices").toBeTruthy();
    await expect(apiClient.get("/api/v1/map/device-states", { params: { ...params, bbox: denseBbox } })).rejects.toMatchObject({
      response: { status: 422, data: { code: "VIEWPORT_TOO_DENSE" } },
    });
  });

  it("returns 200 with a new ETag when an online device ages offline", async () => {
    const offlineBbox = process.env.PROVIDER_CONTRACT_OFFLINE_BBOX ?? bbox;
    const offlineParams = { ...params, bbox: offlineBbox };
    const online = await apiClient.get("/api/v1/map/device-states", { params: offlineParams });
    const onlineDevice = online.data.items.find((item: { online: boolean }) => item.online);
    expect(onlineDevice, "Seed one online device and do not send telemetry during this test").toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 31_000));
    const offline = await apiClient.get("/api/v1/map/device-states", {
      params: offlineParams,
      headers: { "If-None-Match": online.headers.etag },
    });
    expect(offline.status).toBe(200);
    expect(offline.headers.etag).not.toBe(online.headers.etag);
    expect(offline.data.items.find((item: { device_id: string }) => item.device_id === onlineDevice.device_id)?.online).toBe(false);
  }, 45_000);
});
