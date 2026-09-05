import { describe, expect, it } from "vitest";
import { getCatalogs, getSessionContext } from "./catalog-api";
describe("catalog API", () => {
  it("maps capabilities and current permissions from the shared Axios API", async () => {
    const [catalogs, session] = await Promise.all([getCatalogs(), getSessionContext()]);
    expect(catalogs.deviceTypes[0]?.capabilities.length).toBeGreaterThan(0);
    expect(session.permissions).toContain("enforcement.approve");
  });
});
