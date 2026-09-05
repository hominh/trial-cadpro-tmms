"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import type { GeoJsonPoint } from "../../types/device-management.types";
function PointClick({ onChange }: { readonly onChange: (value: GeoJsonPoint) => void }) {
  useMapEvents({
    click(event) {
      onChange({ type: "Point", coordinates: [event.latlng.lng, event.latlng.lat] });
    },
  });
  return null;
}
export function ObjectPointPicker({
  value,
  onChange,
}: {
  readonly value: GeoJsonPoint;
  readonly onChange: (value: GeoJsonPoint) => void;
}) {
  const set = (index: 0 | 1, raw: string) => {
    const number = Number(raw);
    const coordinates: [number, number] = [...value.coordinates] as [number, number];
    if (Number.isFinite(number)) coordinates[index] = number;
    onChange({ type: "Point", coordinates });
  };
  return (
    <fieldset className="point-picker">
      <legend>Vị trí lắp đặt</legend>
      <p className="field-hint">
        Click trên bản đồ hoặc nhập kinh độ/vĩ độ chính xác bằng bàn phím.
      </p>
      <div className="point-map">
        <MapContainer
          center={[value.coordinates[1], value.coordinates[0]]}
          zoom={15}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <PointClick onChange={onChange} />
          <CircleMarker center={[value.coordinates[1], value.coordinates[0]]} radius={8} />
        </MapContainer>
      </div>
      <div className="two-columns">
        <div>
          <Label htmlFor="object-lng">Kinh độ</Label>
          <Input
            id="object-lng"
            type="number"
            value={value.coordinates[0]}
            min={-180}
            max={180}
            step="0.000001"
            onChange={(event) => set(0, event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="object-lat">Vĩ độ</Label>
          <Input
            id="object-lat"
            type="number"
            value={value.coordinates[1]}
            min={-90}
            max={90}
            step="0.000001"
            onChange={(event) => set(1, event.target.value)}
          />
        </div>
      </div>
    </fieldset>
  );
}
