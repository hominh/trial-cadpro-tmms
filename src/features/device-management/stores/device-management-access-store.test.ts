import { describe, expect, it } from "vitest";
import { adminSession } from "../../../../tests/fixtures/device-management/device-management.fixtures";
import { useDeviceManagementAccessStore } from "./device-management-access-store";
describe("access store", () => {
  it("keeps actor and permissions outside catalog state", () => {
    useDeviceManagementAccessStore.getState().setContext(adminSession);
    expect(useDeviceManagementAccessStore.getState().context?.permissions).toContain(
      "enforcement.approve"
    );
  });
});
