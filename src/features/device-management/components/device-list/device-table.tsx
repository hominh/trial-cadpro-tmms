"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeviceCatalogStore } from "../../stores/device-catalog-store";
export function DeviceTable() {
  const devices = useDeviceCatalogStore((state) => state.devices);
  const selected = useDeviceCatalogStore((state) => state.selectedDeviceId);
  const select = useDeviceCatalogStore((state) => state.select);
  const loading = useDeviceCatalogStore((state) => state.loading);
  if (loading) return <p aria-live="polite">Đang tải danh sách thiết bị…</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã</TableHead>
          <TableHead>Tên</TableHead>
          <TableHead>Vị trí</TableHead>
          <TableHead>Loại</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Last seen</TableHead>
          <TableHead>
            <span className="sr-only">Chọn</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {devices.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7}>Không có thiết bị phù hợp.</TableCell>
          </TableRow>
        ) : (
          devices.map((device) => (
            <TableRow key={device.id} data-selected={selected === device.id}>
              <TableCell>{device.code}</TableCell>
              <TableCell>{device.name}</TableCell>
              <TableCell>{device.object.name}</TableCell>
              <TableCell>{device.deviceType.name}</TableCell>
              <TableCell>
                <span className="badge">{device.status}</span>
              </TableCell>
              <TableCell>
                {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString("vi-VN") : "—"}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => select(device.id)}>
                  Chi tiết
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
