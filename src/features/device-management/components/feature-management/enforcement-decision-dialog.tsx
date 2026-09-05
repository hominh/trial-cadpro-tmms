"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { decideEnforcementRequest } from "../../services/device-feature-api";
import { useDeviceFeatureStore } from "../../stores/device-feature-store";
import type { EnforcementRequest } from "../../types/device-management.types";
export function EnforcementDecisionDialog({
  request,
  onClose,
}: {
  readonly request: EnforcementRequest;
  readonly onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const replace = useDeviceFeatureStore((state) => state.replaceFeature);
  const setRequests = useDeviceFeatureStore((state) => state.setRequests);
  const requests = useDeviceFeatureStore((state) => state.requests);
  const decide = async (decision: "approve" | "reject") => {
    const result = await decideEnforcementRequest(
      request.id,
      { decision, note: note || null },
      request.etag
    );
    replace(result.feature);
    setRequests(requests.filter((item) => item.id !== request.id));
    onClose();
  };
  return (
    <div
      className={
        "inline-dialog grid gap-[0.65rem] mt-[0.8rem] [border:1px_solid_#e5c891] rounded-[0.6rem] [background:#fffbeb] p-[0.8rem]"
      }
    >
      <h3>Quyết định yêu cầu</h3>
      <Input
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Ghi chú (tùy chọn)"
      />
      <div className={"inline-actions flex flex-wrap gap-[0.6rem] items-end"}>
        <Button variant="outline" onClick={() => void decide("reject")}>
          Từ chối
        </Button>
        <Button onClick={() => void decide("approve")}>Phê duyệt</Button>
      </div>
    </div>
  );
}
