"use client";
import { useEffect } from "react";
import Link from "next/link";
import { listEnforcementRequests } from "../services/device-feature-api";
import { getSessionContext } from "../services/catalog-api";
import { startDeviceManagementMock } from "../mock-browser";
import { useDeviceFeatureStore } from "../stores/device-feature-store";
import { useDeviceManagementAccessStore } from "../stores/device-management-access-store";
import { EnforcementApprovalQueue } from "./feature-management/enforcement-approval-queue";
export function EnforcementApprovalPage() {
  const setRequests = useDeviceFeatureStore((state) => state.setRequests);
  const setContext = useDeviceManagementAccessStore((state) => state.setContext);
  useEffect(() => {
    void startDeviceManagementMock().then(async () => {
      setContext(await getSessionContext());
      setRequests((await listEnforcementRequests()).items);
    });
  }, [setContext, setRequests]);
  return (
    <main className={"devices-page max-w-[1440px] m-[0_auto] p-[2rem]"}>
      <Link
        className={
          "primary-link min-h-[44px] inline-flex items-center justify-center rounded-[0.5rem] [border:1px_solid_transparent] p-[0.65rem_1rem] no-underline cursor-pointer w-fit text-white [background:#10211d]"
        }
        href="/devices"
      >
        ← Quản lý thiết bị
      </Link>
      <EnforcementApprovalQueue />
    </main>
  );
}
