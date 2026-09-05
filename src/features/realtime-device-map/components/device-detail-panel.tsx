"use client";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDeviceStateStore } from "../stores/device-state-store";
import { useMapUiStore } from "../stores/map-ui-store";

export function DeviceDetailPanel() {
  const id = useMapUiStore((state) => state.selectedDeviceId);
  const open = useMapUiStore((state) => state.detailPanelOpen);
  const close = useMapUiStore((state) => state.closeDetails);
  const device = useDeviceStateStore((state) => (id ? state.devicesById.get(id) : undefined));
  return (
    <Sheet
      open={open && Boolean(device)}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <SheetContent aria-describedby="device-detail-description">
        <SheetHeader>
          <SheetTitle>{device?.name ?? "Thiết bị"}</SheetTitle>
          <SheetDescription id="device-detail-description">
            Thông tin trạng thái gần nhất
          </SheetDescription>
        </SheetHeader>
        {device && (
          <dl className="device-detail-grid" data-testid="complete-device-detail">
            <Detail label="Mã" value={device.code} />
            <Detail label="Loại" value={device.deviceType.name} />
            <Detail
              label="Kết nối"
              value={
                <Badge className={device.online ? "online-badge" : "offline-badge"}>
                  {device.online ? "Online" : "Offline"}
                </Badge>
              }
            />
            <Detail label="Last seen" value={new Date(device.lastSeenAt).toLocaleString("vi-VN")} />
            <Detail label="Cảnh báo" value={device.alertLevel} />
            <Detail label="Preset active" value={device.activePresetId ?? "—"} />
            <Detail label="Nguồn preset" value={device.presetSource ?? "—"} />
            {device.mobility === "mobile" && (
              <>
                <Detail
                  label="Tốc độ"
                  value={device.speedKph === null ? "—" : `${device.speedKph} km/h`}
                />
                <Detail
                  label="Hướng"
                  value={device.courseDeg === null ? "—" : `${device.courseDeg}°`}
                />
              </>
            )}
          </dl>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
