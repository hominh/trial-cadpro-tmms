"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JsonObjectEditor } from "./json-object-editor";
import { TemplateJsonEditor } from "./template-json-editor";
import { ObjectPointPickerLoader } from "./object-point-picker-loader";
import { createObject } from "../../services/device-catalog-api";
import { parseJsonObject } from "../../utils/json-config";
import { getAttrTemplate, coerceAttrsToTemplate } from "../../utils/object-attr-templates";
import { useDeviceCatalogStore } from "../../stores/device-catalog-store";
import type { GeoJsonPoint, JsonObject } from "../../types/device-management.types";

export function ObjectForm({ onCreated }: { readonly onCreated: () => void }) {
  const catalogs = useDeviceCatalogStore((state) => state.catalogs);
  const setObjects = useDeviceCatalogStore((state) => state.setObjects);
  const objects = useDeviceCatalogStore((state) => state.objects);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [status, setStatus] = useState("active");
  const [attrsJson, setAttrsJson] = useState("{}");
  const [attrsObj, setAttrsObj] = useState<JsonObject | null>(null);
  const [point, setPoint] = useState<GeoJsonPoint>({ type: "Point", coordinates: [106.7, 10.77] });
  const [error, setError] = useState<string | null>(null);

  const template = useMemo(
    () => getAttrTemplate(typeId, catalogs?.objectTypes ?? null),
    [typeId, catalogs?.objectTypes]
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!typeId) {
      setError("Chọn object type.");
      return;
    }
    let finalAttrs: JsonObject;
    if (template) {
      finalAttrs = coerceAttrsToTemplate(attrsObj, template);
    } else {
      const parsed = parseJsonObject(attrsJson);
      if (!parsed.value) {
        setError("Thuộc tính mở rộng phải là JSON object hợp lệ.");
        return;
      }
      finalAttrs = parsed.value;
    }
    try {
      const result = await createObject({
        code,
        name,
        objectTypeId: typeId,
        location: point,
        status,
        attrs: finalAttrs,
      });
      setObjects([result.item, ...objects]);
      onCreated();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tạo object");
    }
  };
  return (
    <form className={"form-grid grid gap-[0.9rem] [&_h2]:m-0 [&_h3]:m-0"} onSubmit={submit}>
      <h2>Tạo vị trí lắp đặt</h2>
      <div
        className={
          "two-columns grid gap-3 grid-cols-2 [@media(max-width:940px)]:[&&&]:grid-cols-[1fr]"
        }
      >
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
      <div
        className={
          "two-columns grid gap-3 grid-cols-2 [@media(max-width:940px)]:[&&&]:grid-cols-[1fr]"
        }
      >
        <div>
          <Label htmlFor="object-type">Object type</Label>
          <select
            id="object-type"
            className={
              "input min-h-[44px] [border:1px_solid_#d6dad3] rounded-[0.5rem] bg-white text-[#10211d] p-[0.6rem_0.75rem] outline-none [&:focus]:[border-color:#0b6b53] [&:focus]:[box-shadow:0_0_0_3px_rgba(11,_107,_83,_0.15)]"
            }
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
            className={
              "input min-h-[44px] [border:1px_solid_#d6dad3] rounded-[0.5rem] bg-white text-[#10211d] p-[0.6rem_0.75rem] outline-none [&:focus]:[border-color:#0b6b53] [&:focus]:[box-shadow:0_0_0_3px_rgba(11,_107,_83,_0.15)]"
            }
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
      {template ? (
        <TemplateJsonEditor
          id="object-attrs"
          label="Thuộc tính mở rộng (JSON)"
          typeId={typeId}
          value={attrsObj}
          onChange={setAttrsObj}
        />
      ) : (
        <JsonObjectEditor
          id="object-attrs"
          label="Thuộc tính mở rộng (JSON)"
          value={attrsJson}
          onChange={setAttrsJson}
        />
      )}
      {error ? (
        <p className={"field-error text-[#b42318] text-[0.82rem]"} role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit">Lưu object</Button>
    </form>
  );
}
