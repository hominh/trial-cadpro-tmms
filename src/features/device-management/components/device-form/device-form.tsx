"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JsonObjectEditor } from "./json-object-editor";
import { ObjectPicker } from "./object-picker";
import { createDevice } from "../../services/device-catalog-api";
import { parseJsonObject } from "../../utils/json-config";
import { useDeviceCatalogStore } from "../../stores/device-catalog-store";
import { asObjectId } from "../../types/device-management.types";
export function DeviceForm({ onCreated }: { readonly onCreated: () => void }) {
  const catalogs = useDeviceCatalogStore((state) => state.catalogs);
  const upsert = useDeviceCatalogStore((state) => state.upsertDevice);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [serial, setSerial] = useState("");
  const [typeId, setTypeId] = useState("");
  const [objectId, setObjectId] = useState("");
  const [status, setStatus] = useState("active");
  const [config, setConfig] = useState("{}");
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = parseJsonObject(config);
    if (!parsed.value || !typeId || !objectId) {
      setError("Hãy điền đầy đủ device type, object và JSON config.");
      return;
    }
    try {
      const result = await createDevice({
        code,
        name,
        serial: serial || null,
        deviceTypeId: typeId,
        objectId: asObjectId(objectId),
        config: parsed.value,
        status,
      });
      upsert(result.item);
      onCreated();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tạo device");
    }
  };
  return (
    <form className="form-grid" onSubmit={submit}>
      <h2>Tạo thiết bị</h2>
      <div className="two-columns">
        <div>
          <Label htmlFor="device-code">Mã device</Label>
          <Input
            id="device-code"
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="device-name">Tên device</Label>
          <Input
            id="device-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      </div>
      <div className="two-columns">
        <div>
          <Label htmlFor="device-serial">Serial</Label>
          <Input
            id="device-serial"
            value={serial}
            onChange={(event) => setSerial(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="device-type-form">Device type</Label>
          <select
            id="device-type-form"
            className="input"
            required
            value={typeId}
            onChange={(event) => setTypeId(event.target.value)}
          >
            <option value="">Chọn type</option>
            {catalogs?.deviceTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ObjectPicker value={objectId} onChange={setObjectId} />
      <div>
        <Label htmlFor="device-status-form">Trạng thái</Label>
        <select
          id="device-status-form"
          className="input"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {catalogs?.deviceStatuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <JsonObjectEditor
        id="device-config"
        label="Cấu hình (JSON)"
        value={config}
        onChange={setConfig}
      />
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit">Lưu device</Button>
    </form>
  );
}
