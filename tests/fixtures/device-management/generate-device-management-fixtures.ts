import { createCatalogDevices } from "./device-management.fixtures";
export function generateDeviceManagementFixture(count = 10_000) { return createCatalogDevices(count); }
export function generatePolygonVertices(count = 500): readonly (readonly [number, number])[] { return Array.from({ length: count }, (_, index) => [106.7 + Math.cos(index / count * Math.PI * 2) * .01, 10.77 + Math.sin(index / count * Math.PI * 2) * .01] as const); }
