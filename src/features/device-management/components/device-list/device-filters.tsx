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
    <div className="device-filters">
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
          className="input"
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
          className="input"
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
