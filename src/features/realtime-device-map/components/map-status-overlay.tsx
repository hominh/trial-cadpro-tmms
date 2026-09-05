"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { DeviceStoreStatus } from "../stores/device-state-store";

export function MapStatusOverlay({ status, count, unlocatedCount, lastSuccessAt, error, tooDense }: { status: DeviceStoreStatus; count: number; unlocatedCount: number; lastSuccessAt: number | null; error: string | null; tooDense: { matched: number; maxItems: number } | null }) {
  if (status === "loading" && count === 0) return <div className="map-overlay"><Skeleton className="map-loading" /><span>Đang tải thiết bị trong viewport…</span></div>;
  if (status === "tooDense") return <div className="map-overlay"><Alert><AlertTitle>Viewport có quá nhiều thiết bị</AlertTitle><AlertDescription>{tooDense?.matched ?? "Hơn 5.000"} thiết bị vượt giới hạn {tooDense?.maxItems ?? 5000}. Hãy zoom in hoặc thêm bộ lọc.</AlertDescription></Alert></div>;
  if (status === "error") return <div className="map-overlay"><Alert><AlertTitle>Không tải được dữ liệu</AlertTitle><AlertDescription>{error ?? "Vui lòng thử lại."}</AlertDescription></Alert></div>;
  return <div className="map-status" role="status" aria-live="polite"><strong>{count.toLocaleString("vi-VN")}</strong> thiết bị{unlocatedCount ? ` · ${unlocatedCount} chưa có vị trí` : ""}{status === "stale" ? ` · dữ liệu cũ${lastSuccessAt ? ` từ ${new Date(lastSuccessAt).toLocaleTimeString("vi-VN")}` : ""}` : ""}</div>;
}
