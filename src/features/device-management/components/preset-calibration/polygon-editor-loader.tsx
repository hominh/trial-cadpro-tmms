"use client";
import dynamic from "next/dynamic";
export const PolygonEditorLoader = dynamic(
  () => import("./polygon-editor").then((module) => module.PolygonEditor),
  {
    ssr: false,
    loading: () => <div className="polygon-map map-skeleton">Đang tải trình chỉnh sửa bản đồ…</div>,
  }
);
