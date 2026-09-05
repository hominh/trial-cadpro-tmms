import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { normalizeApiError } from "./client";
describe("normalizeApiError", () => {
  it("preserves stable problem codes and field violations", () => {
    const error = new AxiosError(
      "Conflict",
      "ERR_BAD_REQUEST",
      { headers: new AxiosHeaders() },
      undefined,
      {
        status: 412,
        statusText: "Conflict",
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {
          code: "VERSION_CONFLICT",
          detail: "Stale",
          field_errors: [{ field: "code", message: "duplicate" }],
        },
      }
    );
    const normalized = normalizeApiError(error);
    expect(normalized).toMatchObject({
      status: 412,
      code: "VERSION_CONFLICT",
      fieldErrors: [{ field: "code", message: "duplicate" }],
    });
  });
});
