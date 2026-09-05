"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { getCatalogs, getSessionContext } from "../services/catalog-api";
import { listObjects } from "../services/device-catalog-api";
import { useDeviceCatalogStore } from "../stores/device-catalog-store";
import { useDeviceManagementAccessStore } from "../stores/device-management-access-store";
import { useDeviceManagementUiStore } from "../stores/device-management-ui-store";
import { startDeviceManagementMock } from "../mock-browser";
import { useDeviceList } from "../hooks/use-device-list";
import { DeviceFilters } from "./device-list/device-filters";
import { DeviceTable } from "./device-list/device-table";
import { ObjectForm } from "./device-form/object-form";
import { DeviceForm } from "./device-form/device-form";
import { DeviceDetail } from "./device-detail";
export function DeviceManagementPage() {
  const setCatalogs = useDeviceCatalogStore((state) => state.setCatalogs);
  const setObjects = useDeviceCatalogStore((state) => state.setObjects);
  const devices = useDeviceCatalogStore((state) => state.devices);
  const selected = useDeviceCatalogStore((state) => state.selectedDeviceId);
  const error = useDeviceCatalogStore((state) => state.error);
  const context = useDeviceManagementAccessStore((state) => state.context);
  const setContext = useDeviceManagementAccessStore((state) => state.setContext);
  const objectOpen = useDeviceManagementUiStore((state) => state.createObjectOpen);
  const deviceOpen = useDeviceManagementUiStore((state) => state.createDeviceOpen);
  const openObject = useDeviceManagementUiStore((state) => state.openObject);
  const openDevice = useDeviceManagementUiStore((state) => state.openDevice);
  const { reload } = useDeviceList();
  useEffect(() => {
    let active = true;
    void startDeviceManagementMock()
      .then(async () => {
        const [catalog, session, objects] = await Promise.all([
          getCatalogs(),
          getSessionContext(),
          listObjects(),
        ]);
        if (!active) return;
        setCatalogs(catalog);
        setContext(session);
        setObjects(objects.items);
        await reload();
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [reload, setCatalogs, setContext, setObjects]);
  const selectedDevice = devices.find((item) => item.id === selected) ?? null;
  return (
    <main className="devices-page">
      <header className="devices-header">
        <div>
          <p className="eyebrow">CADPRO · DEVICE MANAGEMENT</p>
          <h1>Quản lý thiết bị</h1>
          <p>Danh mục vị trí, cấu hình feature và hiệu chỉnh camera PTZ.</p>
        </div>
        <nav>
          <Link className="primary-link" href="/map">
            Bản đồ realtime
          </Link>
          {context?.permissions.includes("enforcement.approve") ? (
            <Link className="primary-link" href="/devices/approvals">
              Phê duyệt enforcement
            </Link>
          ) : null}
        </nav>
      </header>
      <section className="device-actions">
        <DeviceFilters />
        {context?.permissions.includes("object.write") ? (
          <Dialog open={objectOpen} onOpenChange={openObject}>
            <DialogTrigger asChild>
              <Button variant="outline">Tạo object</Button>
            </DialogTrigger>
            <DialogContent>
              <ObjectForm
                onCreated={() => {
                  openObject(false);
                  void reload();
                }}
              />
            </DialogContent>
          </Dialog>
        ) : null}
        {context?.permissions.includes("device.write") ? (
          <Dialog open={deviceOpen} onOpenChange={openDevice}>
            <DialogTrigger asChild>
              <Button>Tạo device</Button>
            </DialogTrigger>
            <DialogContent>
              <DeviceForm
                onCreated={() => {
                  openDevice(false);
                  void reload();
                }}
              />
            </DialogContent>
          </Dialog>
        ) : null}
      </section>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="device-management-layout">
        <section>
          <DeviceTable />
        </section>
        {selectedDevice ? (
          <DeviceDetail device={selectedDevice} />
        ) : (
          <aside className="device-detail empty-detail">Chọn một device để xem chi tiết.</aside>
        )}
      </div>
    </main>
  );
}
