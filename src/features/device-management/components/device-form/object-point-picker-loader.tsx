"use client";
import dynamic from "next/dynamic";
export const ObjectPointPickerLoader = dynamic(
  () => import("./object-point-picker").then((module) => module.ObjectPointPicker),
  {
    ssr: false,
    loading: () => (
      <div
        className={
          "point-map h-[260px] overflow-hidden [border:1px_solid_#d6dad3] rounded-[0.6rem] [&_.leaflet-container]:w-full [&_.leaflet-container]:h-full map-skeleton w-full h-full min-h-[480px]"
        }
      >
        Đang tải bản đồ chọn điểm…
      </div>
    ),
  }
);
