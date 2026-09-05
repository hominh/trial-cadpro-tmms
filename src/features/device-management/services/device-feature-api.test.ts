import { describe, expect, it } from "vitest";
import { listFeatures, updateFeature } from "./device-feature-api";
describe("device feature API", () => {
  it("maps opaque feature ETags and toggles an ordinary capability", async () => {
    const features = await listFeatures("device-00001");
    const gps = features.find((item) => !item.feature.isEnforcement);
    expect(gps?.etag).toBeTruthy();
    if (!gps) throw new Error("Fixture missing ordinary feature");
    expect(
      (
        await updateFeature(
          "device-00001",
          gps.feature.code,
          { isEnabled: true, config: {} },
          gps.etag
        )
      ).isEnabled
    ).toBe(true);
  });
});
