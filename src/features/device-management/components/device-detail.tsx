"use client";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listFeatures, listFeatureHistory } from "../services/device-feature-api";
import { listPresets } from "../services/device-preset-api";
import { useDeviceFeatureStore } from "../stores/device-feature-store";
import { useDevicePresetStore } from "../stores/device-preset-store";
import type { DeviceRecord } from "../types/device-management.types";
import { DeviceFeatureList } from "./feature-management/device-feature-list";
import { FeatureHistory } from "./feature-management/feature-history";
import { PresetForm } from "./preset-calibration/preset-form";
import { PresetList } from "./preset-calibration/preset-list";
export function DeviceDetail({ device }: { readonly device: DeviceRecord }) {
  const setFeatures = useDeviceFeatureStore((state) => state.setFeatures);
  const setHistory = useDeviceFeatureStore((state) => state.setHistory);
  const setPresets = useDevicePresetStore((state) => state.setPresets);
  useEffect(() => {
    void listFeatures(device.id).then(setFeatures);
    void listFeatureHistory(device.id).then((result) => setHistory(result.items));
    if (device.deviceType.ptzConstraints)
      void listPresets(device.id).then((result) => setPresets(result.items));
  }, [device.id, device.deviceType.ptzConstraints, setFeatures, setHistory, setPresets]);
  return (
    <aside className="device-detail">
      <p className="eyebrow">{device.deviceType.name}</p>
      <h2>{device.name}</h2>
      <p>
        {device.code} · {device.status}
      </p>
      <Tabs defaultValue="features">
        <TabsList>
          <TabsTrigger value="features">Feature</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
          {device.deviceType.ptzConstraints ? (
            <TabsTrigger value="presets">Preset</TabsTrigger>
          ) : null}
        </TabsList>
        <TabsContent value="features">
          <DeviceFeatureList deviceId={device.id} />
        </TabsContent>
        <TabsContent value="history">
          <FeatureHistory />
        </TabsContent>
        {device.deviceType.ptzConstraints ? (
          <TabsContent value="presets">
            <PresetList />
            <PresetForm deviceId={device.id} />
          </TabsContent>
        ) : null}
      </Tabs>
    </aside>
  );
}
