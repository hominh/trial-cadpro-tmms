import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAbortableRequest } from "./use-abortable-request";
describe("useAbortableRequest", () => {
  it("aborts a previous request before replacing it", async () => {
    const { result } = renderHook(() => useAbortableRequest());
    const holder: { current: AbortSignal | null } = { current: null };
    const first = result.current.run(async (signal) => {
      holder.current = signal;
      return new Promise<string>(() => undefined);
    });
    const second = result.current.run(async () => "new");
    await expect(second).resolves.toMatchObject({ value: "new" });
    expect(holder.current?.aborted).toBe(true);
    void first.catch(() => undefined);
  });
});
