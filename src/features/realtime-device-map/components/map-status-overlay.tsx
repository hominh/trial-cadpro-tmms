"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { DeviceStoreStatus } from "../stores/device-state-store";

export function MapStatusOverlay({
  status,
  count,
  unlocatedCount,
  lastSuccessAt,
  error,
  tooDense,
}: {
  status: DeviceStoreStatus;
  count: number;
  unlocatedCount: number;
  lastSuccessAt: number | null;
  error: string | null;
  tooDense: { matched: number; maxItems: number } | null;
}) {
  if (status === "loading" && count === 0)
    return (
      <div
        className={
          "map-overlay absolute z-[900] top-[1rem] left-[50%] w-[min(360px,_calc(100%_-_2rem))] [transform:translateX(-50%)] grid gap-[0.45rem] rounded-[0.7rem] [background:rgba(255,_255,_252,_0.94)] p-[0.75rem] [box-shadow:0_12px_32px_rgba(16,_33,_29,_0.14)]"
        }
      >
        <Skeleton className={"map-loading [&&]:h-[6px] [&&]:rounded-[999px]"} />
        <span>Đang tải thiết bị trong viewport…</span>
      </div>
    );
  if (status === "tooDense")
    return (
      <div
        className={
          "map-overlay absolute z-[900] top-[1rem] left-[50%] w-[min(360px,_calc(100%_-_2rem))] [transform:translateX(-50%)] grid gap-[0.45rem] rounded-[0.7rem] [background:rgba(255,_255,_252,_0.94)] p-[0.75rem] [box-shadow:0_12px_32px_rgba(16,_33,_29,_0.14)]"
        }
      >
        <Alert>
          <AlertTitle>Viewport có quá nhiều thiết bị</AlertTitle>
          <AlertDescription>
            {tooDense?.matched ?? "Hơn 5.000"} thiết bị vượt giới hạn {tooDense?.maxItems ?? 5000}.
            Hãy zoom in hoặc thêm bộ lọc.
          </AlertDescription>
        </Alert>
      </div>
    );
  if (status === "error")
    return (
      <div
        className={
          "map-overlay absolute z-[900] top-[1rem] left-[50%] w-[min(360px,_calc(100%_-_2rem))] [transform:translateX(-50%)] grid gap-[0.45rem] rounded-[0.7rem] [background:rgba(255,_255,_252,_0.94)] p-[0.75rem] [box-shadow:0_12px_32px_rgba(16,_33,_29,_0.14)]"
        }
      >
        <Alert>
          <AlertTitle>Không tải được dữ liệu</AlertTitle>
          <AlertDescription>{error ?? "Vui lòng thử lại."}</AlertDescription>
        </Alert>
      </div>
    );
  return (
    <div
      className={
        "map-status absolute z-[900] left-[1rem] bottom-[1rem] [border:1px_solid_#d6dad3] rounded-[999px] [background:rgba(255,_255,_252,_0.94)] p-[0.55rem_0.8rem] text-[0.8rem] [box-shadow:0_8px_28px_rgba(16,_33,_29,_0.12)]"
      }
      role="status"
      aria-live="polite"
    >
      <strong>{count.toLocaleString("vi-VN")}</strong> thiết bị
      {unlocatedCount ? ` · ${unlocatedCount} chưa có vị trí` : ""}
      {status === "stale"
        ? ` · dữ liệu cũ${lastSuccessAt ? ` từ ${new Date(lastSuccessAt).toLocaleTimeString("vi-VN")}` : ""}`
        : ""}
    </div>
  );
}
