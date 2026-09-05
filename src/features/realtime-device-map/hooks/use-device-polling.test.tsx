import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSnapshot } from "../../../../tests/fixtures/device-map/device-map.fixtures";
import { useDeviceStateStore } from "../stores/device-state-store";
import { useMapUiStore } from "../stores/map-ui-store";
import { useDevicePolling } from "./use-device-polling";

describe("useDevicePolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useDeviceStateStore.getState().reset();
    useMapUiStore.getState().reset();
    useMapUiStore
      .getState()
      .setViewportBounds({ west: 106.6, south: 10.7, east: 106.9, north: 10.95 });
  });
  it("polls immediately, aborts before replacement and cleans up", async () => {
    const signals: AbortSignal[] = [];
    const fetcher = vi.fn(({ signal }: { signal: AbortSignal }) => {
      signals.push(signal);
      return Promise.resolve({ kind: "snapshot" as const, snapshot: makeSnapshot(1), etag: null });
    });
    const { unmount } = renderHook(() => useDevicePolling({ fetcher, pollMs: 4000 }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    await act(async () => {
      vi.advanceTimersByTime(4000);
      await Promise.resolve();
    });
    expect(signals[0]?.aborted).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(2);
    unmount();
    expect(signals[1]?.aborted).toBe(true);
  });
  it("drops old responses when viewport changes", async () => {
    let resolveFirst:
      | ((value: {
          kind: "snapshot";
          snapshot: ReturnType<typeof makeSnapshot>;
          etag: null;
        }) => void)
      | undefined;
    const fetcher = vi.fn(
      () =>
        new Promise<{ kind: "snapshot"; snapshot: ReturnType<typeof makeSnapshot>; etag: null }>(
          (resolve) => {
            resolveFirst ??= resolve;
          }
        )
    );
    renderHook(() => useDevicePolling({ fetcher }));
    act(() =>
      useMapUiStore
        .getState()
        .setViewportBounds({ west: 106.7, south: 10.7, east: 107, north: 10.95 })
    );
    await act(async () => {
      resolveFirst?.({ kind: "snapshot", snapshot: makeSnapshot(1), etag: null });
      await Promise.resolve();
    });
    expect(useDeviceStateStore.getState().snapshotId).toBeNull();
  });
});
