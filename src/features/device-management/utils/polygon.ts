import type { GeoJsonPolygon } from "../types/device-management.types";

type Position = readonly [number, number];
const equal = (a: Position, b: Position) => a[0] === b[0] && a[1] === b[1];
function cross(a: Position, b: Position, c: Position): number {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}
function segmentsIntersect(a: Position, b: Position, c: Position, d: Position): boolean {
  const ab1 = cross(a, b, c);
  const ab2 = cross(a, b, d);
  const cd1 = cross(c, d, a);
  const cd2 = cross(c, d, b);
  return (
    ((ab1 > 0 && ab2 < 0) || (ab1 < 0 && ab2 > 0)) && ((cd1 > 0 && cd2 < 0) || (cd1 < 0 && cd2 > 0))
  );
}
export function polygonArea(ring: readonly Position[]): number {
  return (
    Math.abs(
      ring.slice(0, -1).reduce((sum, point, index) => {
        const next = ring[(index + 1) % (ring.length - 1)]!;
        return sum + point[0] * next[1] - next[0] * point[1];
      }, 0)
    ) / 2
  );
}
export function normalizeRing(vertices: readonly Position[]): readonly Position[] {
  if (vertices.length === 0) return [];
  return equal(vertices[0]!, vertices[vertices.length - 1]!)
    ? vertices
    : [...vertices, vertices[0]!];
}
export function validatePolygon(polygon: GeoJsonPolygon | null): string | null {
  if (!polygon) return null;
  const ring = polygon.coordinates[0] ?? [];
  const distinct =
    ring.length > 0 && equal(ring[0]!, ring[ring.length - 1]!) ? ring.slice(0, -1) : ring;
  if (polygon.coordinates.length !== 1 || distinct.length < 3 || distinct.length > 500)
    return "Polygon phải có từ 3 đến 500 đỉnh.";
  if (ring.length !== distinct.length + 1 || !equal(ring[0]!, ring[ring.length - 1]!))
    return "Polygon phải khép kín.";
  if (
    distinct.some(
      ([lng, lat]) =>
        !Number.isFinite(lng) ||
        !Number.isFinite(lat) ||
        lng < -180 ||
        lng > 180 ||
        lat < -90 ||
        lat > 90
    )
  )
    return "Tọa độ polygon không hợp lệ.";
  if (
    distinct.some(([lng]) => Math.abs(lng) === 180) ||
    distinct.some(
      (point, index) => Math.abs(point[0] - distinct[(index + 1) % distinct.length]![0]) > 180
    )
  )
    return "Polygon không được cắt đường đổi ngày.";
  for (let index = 0; index < distinct.length; index += 1) {
    const a = ring[index]!;
    const b = ring[index + 1]!;
    for (let other = index + 2; other < distinct.length; other += 1) {
      if (index === 0 && other === distinct.length - 1) continue;
      if (segmentsIntersect(a, b, ring[other]!, ring[other + 1]!))
        return "Polygon không được tự cắt.";
    }
  }
  if (polygonArea(ring) <= 0) return "Polygon phải có diện tích lớn hơn 0.";
  return null;
}
