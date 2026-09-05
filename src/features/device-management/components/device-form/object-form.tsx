"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JsonObjectEditor } from "./json-object-editor";
import { ObjectPointPickerLoader } from "./object-point-picker-loader";
import { createObject } from "../../services/device-catalog-api";
import { parseJsonObject } from "../../utils/json-config";
import { useDeviceCatalogStore } from "../../stores/device-catalog-store";
import type { GeoJsonPoint } from "../../types/device-management.types";

export function ObjectForm({ onCreated }: { readonly onCreated: () => void }) {
  const catalogs = useDeviceCatalogStore((state) => state.catalogs);
  const setObjects = useDeviceCatalogStore((state) => state.setObjects);
  const objects = useDeviceCatalogStore((state) => state.objects);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [status, setStatus] = useState("active");
  const [attrs, setAttrs] = useState("{}");
  const [point, setPoint] = useState<GeoJsonPoint>({ type: "Point", coordinates: [106.7, 10.77] });
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = parseJsonObject(attrs);
    if (!parsed.value) {
      setError("Thuộc tính mở rộng phải là JSON object hợp lệ.");
      return;
    }
    if (!typeId) {
      setError("Chọn object type.");
      return;
    }
    try {
      const result = await createObject({
        code,
        name,
        objectTypeId: typeId,
        location: point,
        status,
        attrs: parsed.value,
      });
      setObjects([result.item, ...objects]);
      onCreated();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tạo object");
    }
  };
  return (
    <form className="form-grid" onSubmit={submit}>
      <h2>Tạo vị trí lắp đặt</h2>
      <div className="two-columns">
        <div>
          <Label htmlFor="object-code">Mã object</Label>
          <Input
            id="object-code"
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="object-name">Tên object</Label>
          <Input
            id="object-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      </div>
      <div className="two-columns">
        <div>
          <Label htmlFor="object-type">Object type</Label>
          <select
            id="object-type"
            className="input"
            required
            value={typeId}
            onChange={(event) => setTypeId(event.target.value)}
          >
            <option value="">Chọn type</option>
            {catalogs?.objectTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="object-status">Trạng thái</Label>
          <select
            id="object-status"
            className="input"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {catalogs?.objectStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ObjectPointPickerLoader value={point} onChange={setPoint} />
      <JsonObjectEditor
        id="object-attrs"
        label="Thuộc tính mở rộng (JSON)"
        value={attrs}
        onChange={setAttrs}
      />
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit">Lưu object</Button>
    </form>
  );
}
