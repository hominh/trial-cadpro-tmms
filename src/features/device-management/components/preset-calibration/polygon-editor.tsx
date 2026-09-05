"use client";
import { MapContainer, Polygon, TileLayer, useMapEvents } from "react-leaflet";
import type { GeoJsonPolygon } from "../../types/device-management.types";
function ClickToAdd({ onAdd }: { readonly onAdd: (point: readonly [number, number]) => void }) {
  useMapEvents({
    click(event) {
      onAdd([event.latlng.lng, event.latlng.lat]);
    },
  });
  return null;
}
export function PolygonEditor({
  value,
  onChange,
}: {
  readonly value: GeoJsonPolygon | null;
  readonly onChange: (value: GeoJsonPolygon) => void;
}) {
  const vertices = value?.coordinates[0]?.slice(0, -1) ?? [];
  const add = ([lng, lat]: readonly [number, number]) => {
    const next = [...vertices, [lng, lat] as [number, number]];
    onChange({ type: "Polygon", coordinates: [[...next, next[0]!]] });
  };
  const positions = vertices.map(([lng, lat]) => [lat, lng] as [number, number]);
  return (
    <div
      className={
        "polygon-map h-[260px] overflow-hidden [border:1px_solid_#d6dad3] rounded-[0.6rem] [&_.leaflet-container]:w-full [&_.leaflet-container]:h-full"
      }
      aria-label="Bản đồ vùng phạt, click để thêm đỉnh"
    >
      <MapContainer center={[10.77, 106.7]} zoom={15} scrollWheelZoom={false}>
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToAdd onAdd={add} />
        {positions.length >= 3 ? <Polygon positions={positions} /> : null}
      </MapContainer>
    </div>
  );
}
