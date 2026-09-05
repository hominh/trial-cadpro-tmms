"use client";
import { Button } from "@/components/ui/button";
import { useDeviceFeatureStore } from "../../stores/device-feature-store";
import { useDeviceManagementAccessStore } from "../../stores/device-management-access-store";
import { EnforcementDecisionDialog } from "./enforcement-decision-dialog";
import { useState } from "react";
import type { EnforcementRequest } from "../../types/device-management.types";
export function EnforcementApprovalQueue() {
  const requests = useDeviceFeatureStore((state) => state.requests);
  const context = useDeviceManagementAccessStore((state) => state.context);
  const [selected, setSelected] = useState<EnforcementRequest | null>(null);
  if (!context?.permissions.includes("enforcement.approve"))
    return <p>Bạn không có quyền phê duyệt.</p>;
  return (
    <section>
      <h2>Yêu cầu enforcement chờ duyệt</h2>
      {requests.length === 0 ? (
        <p>Không có yêu cầu chờ duyệt.</p>
      ) : (
        requests.map((request) => (
          <article className="approval-card" key={request.id}>
            <strong>{request.feature.name}</strong>
            <p>{request.reason}</p>
            <small>Người gửi: {request.requestedBy.displayName}</small>
            <Button
              disabled={request.requestedBy.id === context.actor.id}
              onClick={() => setSelected(request)}
            >
              Quyết định
            </Button>
          </article>
        ))
      )}
      {selected ? (
        <EnforcementDecisionDialog request={selected} onClose={() => setSelected(null)} />
      ) : null}
    </section>
  );
}
