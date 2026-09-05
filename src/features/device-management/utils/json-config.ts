import type { JsonObject, JsonValue } from "../types/device-management.types";

export interface JsonParseResult {
  readonly value: JsonObject | null;
  readonly error: string | null;
  readonly line: number | null;
  readonly column: number | null;
}
export function parseJsonObject(source: string): JsonParseResult {
  try {
    const parsed: unknown = JSON.parse(source);
    if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object")
      return { value: null, error: "JSON phải là object.", line: null, column: null };
    return { value: parsed as JsonObject, error: null, line: null, column: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "JSON không hợp lệ";
    const match = /position (\d+)/i.exec(message);
    const lineColumn = /line\s+(\d+)\s+column\s+(\d+)/i.exec(message);
    const position = match ? Number(match[1]) : null;
    const before = position === null ? "" : source.slice(0, position);
    const fallbackLine = source.split("\n").length;
    const fallbackColumn = source.length - source.lastIndexOf("\n");
    return {
      value: null,
      error: message,
      line:
        position === null
          ? lineColumn
            ? Number(lineColumn[1])
            : fallbackLine
          : before.split("\n").length,
      column:
        position === null
          ? lineColumn
            ? Number(lineColumn[2])
            : fallbackColumn
          : before.length - before.lastIndexOf("\n"),
    };
  }
}
export function formatJson(value: JsonValue): string {
  return JSON.stringify(value, null, 2);
}
