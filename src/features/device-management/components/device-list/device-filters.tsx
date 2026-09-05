"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeviceManagementUiStore } from "../../stores/device-management-ui-store";
import { useDeviceCatalogStore } from "../../stores/device-catalog-store";

export function DeviceFilters() {
  const filters = useDeviceManagementUiStore((state) => state.filters);
  const setFilters = useDeviceManagementUiStore((state) => state.setFilters);
  const setSearch = useDeviceManagementUiStore((state) => state.setSearch);
  const catalogs = useDeviceCatalogStore((state) => state.catalogs);
  const [query, setQuery] = useState(filters.search ?? "");
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query), 250);
    return () => window.clearTimeout(timer);
  }, [query, setSearch]);
  return (
    <div
      className={"device-filters flex flex-wrap gap-[0.65rem] items-end [&_>_div]:min-w-[150px]"}
    >
      <div>
        <Label htmlFor="device-search">Tìm thiết bị</Label>
        <Input
          id="device-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Mã hoặc tên"
        />
      </div>
      <div>
        <Label htmlFor="device-status">Trạng thái</Label>
        <select
          id="device-status"
          className={
            "input min-h-[44px] [border:1px_solid_#d6dad3] rounded-[0.5rem] bg-white text-[#10211d] p-[0.6rem_0.75rem] outline-none [&:focus]:[border-color:#0b6b53] [&:focus]:[box-shadow:0_0_0_3px_rgba(11,_107,_83,_0.15)]"
          }
          value={filters.status ?? ""}
          onChange={(event) =>
            setFilters({ ...filters, status: event.target.value || undefined, cursor: null })
          }
        >
          <option value="">Tất cả</option>
          {catalogs?.deviceStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="device-type">Loại thiết bị</Label>
        <select
          id="device-type"
          className={
            "input min-h-[44px] [border:1px_solid_#d6dad3] rounded-[0.5rem] bg-white text-[#10211d] p-[0.6rem_0.75rem] outline-none [&:focus]:[border-color:#0b6b53] [&:focus]:[box-shadow:0_0_0_3px_rgba(11,_107,_83,_0.15)]"
          }
          value={filters.deviceTypeId ?? ""}
          onChange={(event) =>
            setFilters({ ...filters, deviceTypeId: event.target.value || undefined, cursor: null })
          }
        >
          <option value="">Tất cả</option>
          {catalogs?.deviceTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
