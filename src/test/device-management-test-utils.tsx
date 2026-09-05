import { afterEach } from "vitest";
import { useDeviceCatalogStore } from "@/features/device-management/stores/device-catalog-store";
import { useDeviceFeatureStore } from "@/features/device-management/stores/device-feature-store";
import { useDeviceManagementAccessStore } from "@/features/device-management/stores/device-management-access-store";
import { useDeviceManagementUiStore } from "@/features/device-management/stores/device-management-ui-store";
import { useDevicePresetStore } from "@/features/device-management/stores/device-preset-store";
export function resetDeviceManagementStores(): void {
  useDeviceCatalogStore.getState().reset();
  useDeviceFeatureStore.getState().reset();
  useDeviceManagementAccessStore.getState().reset();
  useDeviceManagementUiStore.getState().reset();
  useDevicePresetStore.getState().reset();
}
afterEach(resetDeviceManagementStores);
