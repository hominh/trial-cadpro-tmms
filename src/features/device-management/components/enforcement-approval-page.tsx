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
    <main className="devices-page">
      <Link className="primary-link" href="/devices">
        ← Quản lý thiết bị
      </Link>
      <EnforcementApprovalQueue />
    </main>
  );
}
