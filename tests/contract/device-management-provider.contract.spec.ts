import { describe, expect, it } from "vitest";
const providerUrl = process.env.PROVIDER_CONTRACT_BASE_URL;
describe.skipIf(!providerUrl)("device-management real provider contract", () => { it("exposes the session context endpoint", async () => { const response = await fetch(`${providerUrl}/api/v1/device-management/session-context`, { headers: { Accept: "application/json" } }); expect([200, 401, 403]).toContain(response.status); }); });
