"use client";
import dynamic from "next/dynamic";
export const ObjectPointPickerLoader = dynamic(
  () => import("./object-point-picker").then((module) => module.ObjectPointPicker),
  {
    ssr: false,
    loading: () => <div className="point-map map-skeleton">Đang tải bản đồ chọn điểm…</div>,
  }
);
