import { describe, expect, it } from "vitest";
import { createDevice } from "../../../../tests/fixtures/device-management/device-management.fixtures";
import { useDeviceCatalogStore } from "./device-catalog-store";
describe("catalog store", () => {
  it("reconciles the selection against a bounded page", () => {
    const device = createDevice();
    useDeviceCatalogStore
      .getState()
      .setDevices({ items: [device], page: { limit: 50, hasMore: false, nextCursor: null } });
    useDeviceCatalogStore.getState().select(device.id);
    useDeviceCatalogStore
      .getState()
      .setDevices({ items: [], page: { limit: 50, hasMore: false, nextCursor: null } });
    expect(useDeviceCatalogStore.getState().selectedDeviceId).toBeNull();
  });
});
