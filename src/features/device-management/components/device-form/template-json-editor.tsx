"use client";

import { useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import type { JsonObject, JsonValue } from "../../types/device-management.types";
import {
  coerceAttrsToTemplate,
  getAttrTemplate,
  type AttrField,
} from "../../utils/object-attr-templates";
import { useDeviceCatalogStore } from "../../stores/device-catalog-store";

export interface TemplateJsonEditorProps {
  readonly id: string;
  readonly label: string;
  readonly typeId: string;
  readonly value: JsonObject | null;
  readonly onChange: (value: JsonObject) => void;
}

function renderStringValue(
  field: AttrField,
  current: JsonValue | undefined,
  onChange: (key: string, value: JsonValue) => void
) {
  return (
    <span className="tje-value-row">
      <span className={"tje-punct text-[#5b6b65]"}>{'"'}</span>
      <span className={"tje-key text-[#0b6b53] font-semibold"}>{field.key}</span>
      <span className={"tje-punct text-[#5b6b65]"}>{'"'}</span>
      <span className={"tje-punct text-[#5b6b65]"}>: </span>
      <span className={"tje-punct text-[#5b6b65]"}>{'"'}</span>
      <input
        className={
          "tje-input inline-block [border:1px_solid_transparent] [border-bottom:1px_dashed_#d6dad3] bg-transparent rounded-[0] p-[0_0.15rem] m-[0_0.05rem] [font:inherit] text-[#10211d] outline-none [&:focus]:[border-bottom-color:#0b6b53] [&:focus]:[background:#eef6f2] tje-input-string [&&]:min-w-[12ch]"
        }
        type="text"
        value={String(current ?? field.defaultValue ?? "")}
        spellCheck={false}
        onChange={(e) => onChange(field.key, e.target.value)}
      />
      <span className={"tje-punct text-[#5b6b65]"}>{'"'}</span>
    </span>
  );
}

function renderNumberValue(
  field: AttrField,
  current: JsonValue | undefined,
  onChange: (key: string, value: JsonValue) => void
) {
  return (
    <span className="tje-value-row">
      <span className={"tje-punct text-[#5b6b65]"}>{'"'}</span>
      <span className={"tje-key text-[#0b6b53] font-semibold"}>{field.key}</span>
      <span className={"tje-punct text-[#5b6b65]"}>{'"'}</span>
      <span className={"tje-punct text-[#5b6b65]"}>: </span>
      <input
        className={
          "tje-input inline-block [border:1px_solid_transparent] [border-bottom:1px_dashed_#d6dad3] bg-transparent rounded-[0] p-[0_0.15rem] m-[0_0.05rem] [font:inherit] text-[#10211d] outline-none [&:focus]:[border-bottom-color:#0b6b53] [&:focus]:[background:#eef6f2] tje-input-number [&&]:w-[6ch]"
        }
        type="number"
        value={
          current === undefined || current === ""
            ? String(field.defaultValue ?? "")
            : String(current)
        }
        onChange={(e) => {
          const num = Number(e.target.value);
          onChange(field.key, Number.isFinite(num) ? num : 0);
        }}
      />
    </span>
  );
}

function renderBooleanValue(
  field: AttrField,
  current: JsonValue | undefined,
  onChange: (key: string, value: JsonValue) => void
) {
  return (
    <span className="tje-value-row">
      <span className={"tje-punct text-[#5b6b65]"}>{'"'}</span>
      <span className={"tje-key text-[#0b6b53] font-semibold"}>{field.key}</span>
      <span className={"tje-punct text-[#5b6b65]"}>{'"'}</span>
      <span className={"tje-punct text-[#5b6b65]"}>: </span>
      <select
        className={
          "tje-input inline-block [border:1px_solid_transparent] [border-bottom:1px_dashed_#d6dad3] bg-transparent rounded-[0] p-[0_0.15rem] m-[0_0.05rem] [font:inherit] text-[#10211d] outline-none [&:focus]:[border-bottom-color:#0b6b53] [&:focus]:[background:#eef6f2] tje-input-boolean [&&]:w-[7ch] [&&]:cursor-pointer"
        }
        value={String(current === true ? "true" : "false")}
        onChange={(e) => onChange(field.key, e.target.value === "true")}
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    </span>
  );
}

export function TemplateJsonEditor({
  id,
  label,
  typeId,
  value,
  onChange,
}: TemplateJsonEditorProps) {
  const catalogs = useDeviceCatalogStore((state) => state.catalogs);

  const template = useMemo(
    () => getAttrTemplate(typeId, catalogs?.objectTypes ?? null),
    [typeId, catalogs?.objectTypes]
  );

  // Khi đổi type, tự coerce sang template mới (giữ value cũ cho key trùng,
  // điền default cho key thiếu)
  useEffect(() => {
    if (!template || template.length === 0) return;
    const coerced = coerceAttrsToTemplate(value, template);
    const same =
      value !== null &&
      Object.keys(coerced).length === Object.keys(value).length &&
      template.every(
        (f) =>
          (value as Record<string, unknown>)[f.key] === (coerced as Record<string, unknown>)[f.key]
      );
    if (!same) onChange(coerced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template]);

  const currentDisplay = template ? coerceAttrsToTemplate(value, template) : (value ?? {});

  const handleField = (key: string, next: JsonValue) => {
    onChange({ ...currentDisplay, [key]: next });
  };

  const renderValue = (field: AttrField) => {
    const current = (currentDisplay as Record<string, JsonValue>)[field.key];
    if (field.type === "number") return renderNumberValue(field, current, handleField);
    if (field.type === "boolean") return renderBooleanValue(field, current, handleField);
    return renderStringValue(field, current, handleField);
  };

  return (
    <div className={"field grid gap-[0.35rem]"}>
      <Label htmlFor={id}>{label}</Label>
      {!template || template.length === 0 ? (
        <p className={"field-hint m-0 text-[#5b6b65] text-[0.8rem]"}>
          Chọn Object type để tự sinh template JSON.
        </p>
      ) : (
        <div
          id={id}
          className={
            "template-json-editor [border:1px_solid_#d6dad3] rounded-[0.5rem] [background:#fbfbf7] p-[0.75rem_1rem] [font:0.85rem/1.6_ui-monospace,_SFMono-Regular,_Menlo,_monospace] text-[#10211d]"
          }
          aria-live="polite"
        >
          <div className={"tje-line whitespace-pre"}>{"{"}</div>
          {template.map((field, index) => (
            <div
              key={field.key}
              className={"tje-line whitespace-pre tje-line-indented pl-[1.5rem]"}
            >
              {renderValue(field)}
              {index < template.length - 1 ? (
                <span className={"tje-punct text-[#5b6b65]"}>,</span>
              ) : null}
            </div>
          ))}
          <div className={"tje-line whitespace-pre"}>{"}"}</div>
        </div>
      )}
    </div>
  );
}
