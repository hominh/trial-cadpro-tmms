import { describe, expect, it } from "vitest";
import { createObject, listDevices } from "./device-catalog-api";
describe("device catalog API", () => {
  it("uses bounded pages and creates an object", async () => {
    const page = await listDevices({ limit: 999 });
    expect(page.page.limit).toBe(100);
    const result = await createObject({
      code: "OBJ-NEW",
      name: "Mới",
      objectTypeId: "junction",
      location: { type: "Point", coordinates: [106.7, 10.77] },
      status: "active",
      attrs: {},
    });
    expect(result.item.code).toBe("OBJ-NEW");
    expect(result.etag).toContain("object");
  });
});
