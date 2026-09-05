"use client";

import L, { type Marker } from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { useMarkerMotion } from "../hooks/use-marker-motion";
import { useMapUiStore } from "../stores/map-ui-store";
import type { DeviceId, DeviceState } from "../types/device-map.types";
import { getDeviceIcon } from "../utils/device-icon";

interface MarkerEntry {
  marker: Marker;
  positionVersion: number;
  observedAtMs: number;
  course: number | null;
  confirmed: { lat: number; lng: number };
}
const pointKey = (device: DeviceState): string =>
  device.position.coordinates.map((value) => value.toFixed(6)).join(":");

export function DeviceMarkerLayer({ devices }: { devices: readonly DeviceState[] }) {
  const map = useMap();
  const registry = useRef(new Map<DeviceId, MarkerEntry>());
  const selectedId = useMapUiStore((state) => state.selectedDeviceId);
  const selectDevice = useMapUiStore((state) => state.selectDevice);
  const [candidates, setCandidates] = useState<readonly DeviceState[]>([]);
  const { retarget, remove: removeMotion } = useMarkerMotion();
  const groups = useMemo(() => {
    const result = new Map<string, DeviceState[]>();
    for (const device of devices)
      result.set(pointKey(device), [...(result.get(pointKey(device)) ?? []), device]);
    return result;
  }, [devices]);

  useEffect(() => {
    const visible = new Set<DeviceId>();
    for (const device of devices) {
      visible.add(device.deviceId);
      const [lng, lat] = device.position.coordinates;
      const target = { lat, lng };
      const icon = getDeviceIcon({
        typeCode: device.deviceType.code,
        online: device.online,
        alertLevel: device.alertLevel,
        selected: selectedId === device.deviceId,
      });
      const existing = registry.current.get(device.deviceId);
      if (!existing) {
        const marker = L.marker(target, {
          icon,
          keyboard: true,
          title: `${device.name} — ${device.online ? "Online" : "Offline"}`,
        }).addTo(map);
        const tooltip = document.createElement("span");
        tooltip.textContent = `${device.name} · ${device.code} · ${device.online ? "Online" : "Offline"}`;
        marker.bindTooltip(tooltip);
        marker.on("click", () => {
          const collocated = groups.get(pointKey(device)) ?? [device];
          if (collocated.length > 1) setCandidates(collocated);
          else selectDevice(device.deviceId);
        });
        registry.current.set(device.deviceId, {
          marker,
          positionVersion: device.positionVersion,
          observedAtMs: Date.parse(device.positionObservedAt),
          course: device.courseDeg,
          confirmed: target,
        });
        continue;
      }
      existing.marker.setIcon(icon);
      if (device.positionVersion > existing.positionVersion) {
        if (device.mobility === "mobile" && !device.isStatic && device.latestGpsStatus !== "V") {
          retarget({
            id: device.deviceId,
            marker: existing.marker,
            fromConfirmed: existing.confirmed,
            to: target,
            fromObservedAtMs: existing.observedAtMs,
            toObservedAtMs: Date.parse(device.positionObservedAt),
            fromCourse: existing.course,
            toCourse: device.courseDeg,
          });
        } else if (device.mobility === "fixed") existing.marker.setLatLng(target);
        registry.current.set(device.deviceId, {
          ...existing,
          positionVersion: device.positionVersion,
          observedAtMs: Date.parse(device.positionObservedAt),
          course: device.courseDeg,
          confirmed: target,
        });
      }
    }
    for (const [id, entry] of registry.current) {
      if (!visible.has(id)) {
        entry.marker.removeFrom(map);
        registry.current.delete(id);
        removeMotion(id);
      }
    }
  }, [devices, groups, map, removeMotion, retarget, selectDevice, selectedId]);

  useEffect(
    () => () => {
      // MapContainer owns bulk layer disposal on route teardown. Avoid 5,000 synchronous DOM removals
      // here; per-snapshot removals above remain explicit while the map stays mounted.
      registry.current.clear();
    },
    []
  );

  return (
    <Popover
      open={candidates.length > 0}
      onOpenChange={(open) => {
        if (!open) setCandidates([]);
      }}
    >
      <PopoverContent className="collocated-picker" aria-label="Chọn thiết bị cùng vị trí">
        <strong>{candidates.length} thiết bị tại vị trí này</strong>
        {candidates.map((device) => (
          <Button
            key={device.deviceId}
            variant="ghost"
            onClick={() => {
              selectDevice(device.deviceId);
              setCandidates([]);
            }}
          >
            {device.name}
            <small>
              {device.code} · {device.online ? "Online" : "Offline"}
            </small>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
