import { describe, expect, it } from "vitest";
import { parseJsonObject } from "./json-config";
describe("parseJsonObject", () => {
  it("accepts JSON objects", () =>
    expect(parseJsonObject('{"lane":1}').value).toEqual({ lane: 1 }));
  it("rejects arrays and syntax errors", () => {
    expect(parseJsonObject("[]").error).toBeTruthy();
    expect(parseJsonObject('{\n"a": }').line).toBe(2);
  });
});
