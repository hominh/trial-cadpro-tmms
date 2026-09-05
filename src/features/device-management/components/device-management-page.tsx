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
    <main className={"devices-page max-w-[1440px] m-[0_auto] p-[2rem]"}>
      <header
        className={
          "devices-header flex items-start justify-between gap-8 [border-bottom:1px_solid_#d6dad3] pb-[1.5rem] [&_h1]:m-[0.3rem_0] [&_h1]:tracking-[-0.04em] [&_p:not(.eyebrow)]:text-[#5b6b65] [&_nav]:flex [&_nav]:flex-wrap [&_nav]:gap-[0.6rem] [&_nav]:items-end [@media(max-width:940px)]:[&&&]:flex-col"
        }
      >
        <div>
          <p
            className={
              "eyebrow [font:700_0.75rem/1_ui-monospace,_monospace] tracking-[0.2em] text-[#0b6b53]"
            }
          >
            CADPRO · DEVICE MANAGEMENT
          </p>
          <h1>Quản lý thiết bị</h1>
          <p>Danh mục vị trí, cấu hình feature và hiệu chỉnh camera PTZ.</p>
        </div>
        <nav>
          <Link
            className={
              "primary-link min-h-[44px] inline-flex items-center justify-center rounded-[0.5rem] [border:1px_solid_transparent] p-[0.65rem_1rem] no-underline cursor-pointer w-fit text-white [background:#10211d]"
            }
            href="/map"
          >
            Bản đồ realtime
          </Link>
          {context?.permissions.includes("enforcement.approve") ? (
            <Link
              className={
                "primary-link min-h-[44px] inline-flex items-center justify-center rounded-[0.5rem] [border:1px_solid_transparent] p-[0.65rem_1rem] no-underline cursor-pointer w-fit text-white [background:#10211d]"
              }
              href="/devices/approvals"
            >
              Phê duyệt enforcement
            </Link>
          ) : null}
        </nav>
      </header>
      <section
        className={
          "device-actions flex flex-wrap gap-[0.6rem] items-end justify-between m-[1.5rem_0]"
        }
      >
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
        <p className={"field-error text-[#b42318] text-[0.82rem]"} role="alert">
          {error}
        </p>
      ) : null}
      <div
        className={
          "device-management-layout grid grid-cols-[minmax(0,_1fr)_minmax(320px,_0.38fr)] gap-5 items-start [@media(max-width:940px)]:[&&&]:grid-cols-[1fr]"
        }
      >
        <section>
          <DeviceTable />
        </section>
        {selectedDevice ? (
          <DeviceDetail device={selectedDevice} />
        ) : (
          <aside
            className={
              "device-detail sticky top-[1rem] [border:1px_solid_#d6dad3] rounded-[0.8rem] [background:rgba(255,_255,_252,_0.94)] p-[1.15rem] [@media(max-width:940px)]:[&&&]:static empty-detail text-[#5b6b65]"
            }
          >
            Chọn một device để xem chi tiết.
          </aside>
        )}
      </div>
    </main>
  );
}
