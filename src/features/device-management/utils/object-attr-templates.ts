import type { JsonObject, JsonValue, ObjectType } from "../types/device-management.types";

export type AttrFieldType = "string" | "number" | "boolean";

export interface AttrField {
  readonly key: string;
  readonly label: string;
  readonly type: AttrFieldType;
  readonly placeholder?: string;
  readonly defaultValue: JsonValue;
}

/** Hardcoded template per ObjectType id/code. Sửa trực tiếp tại đây khi muốn đổi template. */
const HARDCODED_TEMPLATES: Record<string, readonly AttrField[]> = {
  junction: [
    { key: "district", label: "Quận/Huyện", type: "string", placeholder: "VD: Quận 1", defaultValue: "" },
    { key: "ward", label: "Phường/Xã", type: "string", placeholder: "VD: Phường Bến Nghé", defaultValue: "" },
    { key: "address", label: "Địa chỉ", type: "string", placeholder: "VD: 123 Lê Lợi", defaultValue: "" },
    { key: "lanes", label: "Số làn đường", type: "number", placeholder: "VD: 4", defaultValue: 4 },
  ],
  depot: [
    { key: "district", label: "Quận/Huyện", type: "string", placeholder: "VD: Quận 7", defaultValue: "" },
    { key: "address", label: "Địa chỉ", type: "string", placeholder: "VD: 456 Nguyễn Văn Linh", defaultValue: "" },
    { key: "capacity", label: "Sức chứa", type: "number", placeholder: "VD: 200", defaultValue: 100 },
    { key: "operator", label: "Đơn vị vận hành", type: "string", placeholder: "VD: Công ty ABC", defaultValue: "" },
  ],
};

function inferField(key: string, value: JsonValue): AttrField {
  const type: AttrFieldType =
    typeof value === "number" ? "number" : typeof value === "boolean" ? "boolean" : "string";
  return { key, label: key, type, defaultValue: value };
}

function fromJsonObject(obj: JsonObject): readonly AttrField[] {
  return Object.entries(obj).map(([key, value]) => inferField(key, value as JsonValue));
}

/**
 * Lấy template cho typeId.
 * Ưu tiên: 1. defaultAttrs từ API (nếu ObjectType có), 2. hardcode theo id/code.
 */
export function getAttrTemplate(
  typeId: string | null | undefined,
  objectTypes?: readonly ObjectType[] | null,
): readonly AttrField[] | null {
  if (!typeId) return null;

  // fallback: nếu API trả defaultAttrs/template trong ObjectType thì dùng luôn
  if (objectTypes) {
    const matched = objectTypes.find((t) => t.id === typeId || t.code === typeId);
    if (matched?.defaultAttrs && Object.keys(matched.defaultAttrs).length > 0) {
      return fromJsonObject(matched.defaultAttrs);
    }
  }

  // hardcode lookup by id or code
  if (HARDCODED_TEMPLATES[typeId]) return HARDCODED_TEMPLATES[typeId]!;
  // thử tìm theo code nếu typeId là id khác
  if (objectTypes) {
    const matched = objectTypes.find((t) => t.id === typeId);
    if (matched && HARDCODED_TEMPLATES[matched.code]) return HARDCODED_TEMPLATES[matched.code]!;
  }
  return null;
}

export function buildDefaultAttrs(template: readonly AttrField[]): JsonObject {
  const obj: Record<string, JsonValue> = {};
  for (const field of template) obj[field.key] = field.defaultValue;
  return obj;
}

/** Merge attrs hiện tại với template: giữ value cũ cho key trùng, điền default cho key thiếu, bỏ key thừa. */
export function coerceAttrsToTemplate(
  rawAttrs: JsonObject | null,
  template: readonly AttrField[],
): JsonObject {
  const obj: Record<string, JsonValue> = {};
  for (const field of template) {
    const existing = rawAttrs?.[field.key];
    if (existing !== undefined && typeof existing === typeof field.defaultValue) {
      obj[field.key] = existing as JsonValue;
    } else if (existing !== undefined && field.type === "number" && typeof existing === "string") {
      const n = Number(existing);
      obj[field.key] = Number.isFinite(n) ? n : field.defaultValue;
    } else if (existing !== undefined && field.type === "string") {
      obj[field.key] = String(existing) as JsonValue;
    } else {
      obj[field.key] = field.defaultValue;
    }
  }
  return obj;
}
