"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMapUiStore } from "../stores/map-ui-store";

const deviceTypes = [
  ["all", "Tất cả loại"],
  ["lpr_camera", "Camera LPR"],
  ["bus_gps", "GPS xe buýt"],
  ["env_multi", "Cảm biến môi trường"],
  ["signal_ctrl", "Tủ tín hiệu"],
] as const;

export function DeviceMapFilters() {
  const filters = useMapUiStore((state) => state.filters);
  const setQuery = useMapUiStore((state) => state.setQuery);
  const setStatus = useMapUiStore((state) => state.setStatus);
  const setDeviceTypes = useMapUiStore((state) => state.setDeviceTypes);
  const [query, setLocalQuery] = useState(filters.query);
  useEffect(() => {
    const id = window.setTimeout(() => setQuery(query), 250);
    return () => window.clearTimeout(id);
  }, [query, setQuery]);
  const selectedType = [...filters.deviceTypes][0] ?? "all";
  return (
    <div
      className={
        "map-filters flex items-center gap-[0.55rem] [@media(max-width:760px)]:[&&&]:overflow-x-auto [@media(max-width:760px)]:[&&&]:pb-[0.1rem]"
      }
      aria-label="Bộ lọc thiết bị"
    >
      <label
        className={
          "search-field relative flex items-center [&_>_svg]:absolute [&_>_svg]:left-[0.75rem] [&_>_svg]:z-[1] [&_>_svg]:text-[#5b6b65] [&_.input]:w-[min(280px,_28vw)] [&_.input]:pl-[2.2rem] [@media(max-width:760px)]:[&_.input]:w-[240px]"
        }
      >
        <Search size={16} aria-hidden="true" />
        <span className="sr-only">Tìm theo mã hoặc tên thiết bị</span>
        <Input
          value={query}
          onChange={(event) => setLocalQuery(event.target.value)}
          placeholder="Tìm mã hoặc tên…"
        />
      </label>
      <Select
        value={selectedType}
        onValueChange={(value) => setDeviceTypes(value === "all" ? new Set() : new Set([value]))}
      >
        <SelectTrigger aria-label="Loại thiết bị">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {deviceTypes.map(([value, label]) => (
            <SelectItem value={value} key={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.status}
        onValueChange={(value) => setStatus(value as "all" | "online" | "offline")}
      >
        <SelectTrigger aria-label="Trạng thái kết nối">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Mọi trạng thái</SelectItem>
          <SelectItem value="online">Online</SelectItem>
          <SelectItem value="offline">Offline</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
