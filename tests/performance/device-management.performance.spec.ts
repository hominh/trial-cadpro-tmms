import { describe, expect, it } from "vitest";
import { createCatalogDevices } from "../fixtures/device-management/device-management.fixtures";
import { normalizeDeviceFilters } from "@/features/device-management/utils/device-query";
import { validatePolygon } from "@/features/device-management/utils/polygon";
import { generatePolygonVertices } from "../fixtures/device-management/generate-device-management-fixtures";
describe("device-management bounded performance fixtures", () => { it("keeps catalog rendering input bounded to one 100-row page", () => { const dataset = createCatalogDevices(2_000); const filters = normalizeDeviceFilters({ limit: 1000, search: "device" }); expect(filters.limit).toBe(100); expect(dataset.slice(0, filters.limit)).toHaveLength(100); }); it("accepts 500 vertices and rejects 501", () => { const polygon = (count: number) => { const vertices = generatePolygonVertices(count); return { type: "Polygon" as const, coordinates: [[...vertices, vertices[0]!]] }; }; expect(validatePolygon(polygon(500))).toBeNull(); expect(validatePolygon(polygon(501))).toContain("3 đến 500"); }); });
