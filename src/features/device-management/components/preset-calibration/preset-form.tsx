"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPreset } from "../../services/device-preset-api";
import { useDevicePresetStore } from "../../stores/device-preset-store";
import { validatePolygon } from "../../utils/polygon";
import { PolygonCoordinateTable } from "./polygon-coordinate-table";
import { PolygonEditorLoader } from "./polygon-editor-loader";
import type { GeoJsonPolygon } from "../../types/device-management.types";
export function PresetForm({ deviceId }: { readonly deviceId: string }) {
  const upsert = useDevicePresetStore((state) => state.upsertPreset);
  const [presetNo, setPresetNo] = useState(1);
  const [name, setName] = useState("");
  const [pan, setPan] = useState<number | null>(null);
  const [tilt, setTilt] = useState<number | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const [laneLabel, setLaneLabel] = useState("");
  const [approach, setApproach] = useState("");
  const [vertices, setVertices] = useState<readonly (readonly [number, number])[]>([]);
  const [error, setError] = useState<string | null>(null);
  const polygon: GeoJsonPolygon | null = vertices.length
    ? { type: "Polygon", coordinates: [[...vertices, vertices[0]!]] }
    : null;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const issue = validatePolygon(polygon);
    if (issue) {
      setError(issue);
      return;
    }
    try {
      const result = await createPreset(deviceId, {
        presetNo,
        name,
        pan,
        tilt,
        zoom,
        enforcementZone: polygon,
        laneLabel: laneLabel || null,
        approach: approach || null,
      });
      upsert(result.item);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể lưu preset");
    }
  };
  const numeric =
    (set: (value: number | null) => void) => (event: React.ChangeEvent<HTMLInputElement>) =>
      set(event.target.value === "" ? null : Number(event.target.value));
  return (
    <form className="form-grid" onSubmit={submit}>
      <h3>Hiệu chỉnh preset</h3>
      <div className="two-columns">
        <div>
          <Label htmlFor="preset-no">Preset number</Label>
          <Input
            id="preset-no"
            type="number"
            min={1}
            max={9999}
            value={presetNo}
            onChange={(event) => setPresetNo(Number(event.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="preset-name">Tên preset</Label>
          <Input
            id="preset-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      </div>
      <div className="three-columns">
        <div>
          <Label htmlFor="preset-pan">Pan</Label>
          <Input id="preset-pan" type="number" value={pan ?? ""} onChange={numeric(setPan)} />
        </div>
        <div>
          <Label htmlFor="preset-tilt">Tilt</Label>
          <Input id="preset-tilt" type="number" value={tilt ?? ""} onChange={numeric(setTilt)} />
        </div>
        <div>
          <Label htmlFor="preset-zoom">Zoom</Label>
          <Input id="preset-zoom" type="number" value={zoom ?? ""} onChange={numeric(setZoom)} />
        </div>
      </div>
      <div className="two-columns">
        <div>
          <Label htmlFor="preset-lane">Làn</Label>
          <Input
            id="preset-lane"
            value={laneLabel}
            onChange={(event) => setLaneLabel(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="preset-approach">Hướng tiếp cận</Label>
          <Input
            id="preset-approach"
            value={approach}
            onChange={(event) => setApproach(event.target.value)}
          />
        </div>
      </div>
      <PolygonEditorLoader
        value={polygon}
        onChange={(value) => setVertices(value.coordinates[0]?.slice(0, -1) ?? [])}
      />
      <PolygonCoordinateTable vertices={vertices} onChange={setVertices} />
      {error ? (
        <p role="alert" className="field-error">
          {error}
        </p>
      ) : null}
      <Button type="submit">Lưu preset</Button>
    </form>
  );
}
