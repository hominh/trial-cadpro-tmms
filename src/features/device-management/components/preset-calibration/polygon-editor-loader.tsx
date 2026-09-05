"use client";
import dynamic from "next/dynamic";
export const PolygonEditorLoader = dynamic(
  () => import("./polygon-editor").then((module) => module.PolygonEditor),
  {
    ssr: false,
    loading: () => (
      <div
        className={
          "polygon-map h-[260px] overflow-hidden [border:1px_solid_#d6dad3] rounded-[0.6rem] [&_.leaflet-container]:w-full [&_.leaflet-container]:h-full map-skeleton w-full h-full min-h-[480px]"
        }
      >
        Đang tải trình chỉnh sửa bản đồ…
      </div>
    ),
  }
);
