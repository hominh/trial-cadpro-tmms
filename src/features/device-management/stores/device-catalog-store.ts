import { create } from "zustand";
import type { Catalogs, DeviceRecord, ObjectRecord, Page } from "../types/device-management.types";
interface CatalogState {
  readonly catalogs: Catalogs | null;
  readonly devices: readonly DeviceRecord[];
  readonly objects: readonly ObjectRecord[];
  readonly page: Page<DeviceRecord>["page"] | null;
  readonly selectedDeviceId: string | null;
  readonly loading: boolean;
  readonly error: string | null;
  setCatalogs: (catalogs: Catalogs) => void;
  setDevices: (result: Page<DeviceRecord>) => void;
  setObjects: (objects: readonly ObjectRecord[]) => void;
  upsertDevice: (device: DeviceRecord) => void;
  select: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
export const useDeviceCatalogStore = create<CatalogState>((set) => ({
  catalogs: null,
  devices: [],
  objects: [],
  page: null,
  selectedDeviceId: null,
  loading: false,
  error: null,
  setCatalogs: (catalogs) => set({ catalogs }),
  setDevices: (result) =>
    set((state) => ({
      devices: result.items,
      page: result.page,
      selectedDeviceId:
        state.selectedDeviceId && result.items.some((item) => item.id === state.selectedDeviceId)
          ? state.selectedDeviceId
          : null,
      loading: false,
      error: null,
    })),
  setObjects: (objects) => set({ objects }),
  upsertDevice: (device) =>
    set((state) => ({
      devices: [device, ...state.devices.filter((item) => item.id !== device.id)],
    })),
  select: (selectedDeviceId) => set({ selectedDeviceId }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  reset: () =>
    set({
      catalogs: null,
      devices: [],
      objects: [],
      page: null,
      selectedDeviceId: null,
      loading: false,
      error: null,
    }),
}));
