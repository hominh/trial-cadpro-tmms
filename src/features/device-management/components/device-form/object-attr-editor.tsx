"use client";

import { useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { JsonObject } from "../../types/device-management.types";
import { coerceAttrsToTemplate, getAttrTemplate } from "../../utils/object-attr-templates";
import { useDeviceCatalogStore } from "../../stores/device-catalog-store";

export interface ObjectAttrEditorProps {
  readonly typeId: string;
  readonly value: JsonObject | null;
  readonly onChange: (value: JsonObject) => void;
  readonly rawValue?: string;
  readonly onRawChange?: (value: string) => void;
}

/**
 * Render attrs theo template của Object type.
 * - Key cố định (không sửa), chỉ sửa value.
 * - Khi đổi type, tự coerce attrs theo template mới và báo lên cha qua onChange.
 * - Nếu type chưa có template -> fallback hiển thị hint + không render field nào (cha giữ logic JSON tự do nếu cần).
 */
export function ObjectAttrEditor({
  typeId,
  value,
  onChange,
  rawValue,
  onRawChange,
}: ObjectAttrEditorProps) {
  const catalogs = useDeviceCatalogStore((state) => state.catalogs);
  const template = useMemo(
    () => getAttrTemplate(typeId, catalogs?.objectTypes ?? null),
    [typeId, catalogs?.objectTypes]
  );

  // Khi đổi type/template, coerce value hiện tại theo template mới
  useEffect(() => {
    if (!template) return;
    const coerced = coerceAttrsToTemplate(value, template);
    // chỉ push lên nếu khác value hiện tại để tránh loop
    const isSame =
      value !== null &&
      template.every(
        (f) =>
          (value as Record<string, unknown>)[f.key] === (coerced as Record<string, unknown>)[f.key]
      ) &&
      Object.keys(value).length === template.length;
    if (!isSame) onChange(coerced);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi template/type đổi
  }, [template]);

  if (!typeId) {
    return (
      <p className={"field-hint m-0 text-[#5b6b65] text-[0.8rem]"}>
        Chọn Object type để nhập thuộc tính mở rộng.
      </p>
    );
  }

  if (!template) {
    // Fallback: chưa có template cho type này -> vẫn cho nhập JSON tự do nếu cha truyền raw handlers
    if (rawValue !== undefined && onRawChange) {
      // cha sẽ tự render JsonObjectEditor bên ngoài, ở đây chỉ báo
      return (
        <p className={"field-hint m-0 text-[#5b6b65] text-[0.8rem]"}>
          Chưa có template cho type này. Nhập JSON tự do ở ô bên dưới.
        </p>
      );
    }
    return (
      <p className={"field-hint m-0 text-[#5b6b65] text-[0.8rem]"}>
        Chưa có template cho object type này.
      </p>
    );
  }

  // đảm bảo value luôn đủ key theo template để render
  const displayAttrs = coerceAttrsToTemplate(value, template);

  const setField = (key: string, fieldType: string, raw: string, checked?: boolean) => {
    let next: unknown = raw;
    if (fieldType === "number") next = raw === "" ? "" : Number(raw);
    if (fieldType === "boolean") next = checked ?? false;
    onChange({ ...displayAttrs, [key]: next as never });
  };

  return (
    <fieldset className={"field grid gap-[0.35rem]"}>
      <legend className="field-label">Thuộc tính mở rộng</legend>
      <div className={"form-grid grid gap-3 [&_h2]:m-0 [&_h3]:m-0"}>
        {template.map((field) => {
          const current = (displayAttrs as Record<string, unknown>)[field.key];
          const id = `object-attr-${field.key}`;
          if (field.type === "boolean") {
            return (
              <div key={field.key} className="field-row">
                <Label htmlFor={id}>{field.label}</Label>
                <input
                  id={id}
                  type="checkbox"
                  checked={current === true}
                  onChange={(e) => setField(field.key, field.type, "", e.target.checked)}
                />
              </div>
            );
          }
          return (
            <div key={field.key} className={"field grid gap-[0.35rem]"}>
              <Label htmlFor={id}>
                {field.label} <span className="field-key">({field.key})</span>
              </Label>
              <Input
                id={id}
                type={field.type === "number" ? "number" : "text"}
                value={String(current ?? "")}
                placeholder={field.placeholder}
                onChange={(e) => setField(field.key, field.type, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
