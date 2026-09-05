"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestEnforcement } from "../../services/device-feature-api";
import { useDeviceFeatureStore } from "../../stores/device-feature-store";
import type { DeviceFeature } from "../../types/device-management.types";
export function EnforcementRequestDialog({
  deviceId,
  feature,
  onClose,
}: {
  readonly deviceId: string;
  readonly feature: DeviceFeature;
  readonly onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const replace = useDeviceFeatureStore((state) => state.replaceFeature);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reason.trim()) {
      setError("Lý do là bắt buộc.");
      return;
    }
    try {
      const request = await requestEnforcement(
        deviceId,
        feature.feature.code,
        reason,
        feature.config
      );
      replace({
        ...feature,
        pendingRequest: {
          id: request.id,
          status: "pending",
          requestedAt: request.requestedAt,
          requestedBy: request.requestedBy,
          reason: request.reason,
          etag: request.etag,
        },
      });
      onClose();
    } catch (value) {
      setError(value instanceof Error ? value.message : "Không gửi được yêu cầu");
    }
  };
  return (
    <form
      className={
        "inline-dialog grid gap-[0.65rem] mt-[0.8rem] [border:1px_solid_#e5c891] rounded-[0.6rem] [background:#fffbeb] p-[0.8rem]"
      }
      onSubmit={submit}
    >
      <h4>Yêu cầu bật {feature.feature.name}</h4>
      <Label htmlFor="approval-reason">Lý do</Label>
      <Input
        id="approval-reason"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        required
      />
      {error ? (
        <p role="alert" className={"field-error text-[#b42318] text-[0.82rem]"}>
          {error}
        </p>
      ) : null}
      <div className={"inline-actions flex flex-wrap gap-[0.6rem] items-end"}>
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit">Gửi phê duyệt</Button>
      </div>
    </form>
  );
}
