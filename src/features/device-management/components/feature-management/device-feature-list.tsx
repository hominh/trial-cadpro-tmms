"use client";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { updateFeature } from "../../services/device-feature-api";
import { useDeviceFeatureStore } from "../../stores/device-feature-store";
import { EnforcementRequestDialog } from "./enforcement-request-dialog";
import type { DeviceFeature } from "../../types/device-management.types";
export function DeviceFeatureList({ deviceId }: { readonly deviceId: string }) {
  const features = useDeviceFeatureStore((state) => state.features);
  const replace = useDeviceFeatureStore((state) => state.replaceFeature);
  const [requestFor, setRequestFor] = useState<DeviceFeature | null>(null);
  const toggle = async (feature: DeviceFeature) => {
    if (feature.feature.isEnforcement && !feature.isEnabled) {
      setRequestFor(feature);
      return;
    }
    try {
      replace(
        await updateFeature(
          deviceId,
          feature.feature.code,
          { isEnabled: !feature.isEnabled, config: feature.config },
          feature.etag
        )
      );
    } catch {
      /* surface retry through unchanged state */
    }
  };
  return (
    <section>
      <h3>Feature khả dụng</h3>
      <div className="feature-list">
        {features.map((item) => (
          <div key={item.feature.code} className="feature-row">
            <div>
              <strong>{item.feature.name}</strong>
              <small>{item.feature.code}</small>
              {item.feature.isEnforcement ? <Badge>enforcement</Badge> : null}
              {item.pendingRequest ? <Badge>chờ duyệt</Badge> : null}
            </div>
            <Switch
              checked={item.isEnabled}
              disabled={Boolean(item.pendingRequest)}
              onCheckedChange={() => void toggle(item)}
              aria-label={`Bật ${item.feature.name}`}
            />
          </div>
        ))}
      </div>
      {requestFor ? (
        <EnforcementRequestDialog
          deviceId={deviceId}
          feature={requestFor}
          onClose={() => setRequestFor(null)}
        />
      ) : null}
    </section>
  );
}
