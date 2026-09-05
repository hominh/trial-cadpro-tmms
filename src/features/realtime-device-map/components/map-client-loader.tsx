"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const DeviceMap = dynamic(() => import("./device-map").then((module) => module.DeviceMap), {
  ssr: false,
  loading: () => <Skeleton className="map-skeleton" aria-label="Đang tải bản đồ" />,
});

export function MapClientLoader() {
  return <DeviceMap />;
}
