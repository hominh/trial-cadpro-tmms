import { create } from "zustand";
import type { DeviceFilters } from "../types/device-management.types";
interface UiState {
  readonly filters: DeviceFilters;
  readonly createObjectOpen: boolean;
  readonly createDeviceOpen: boolean;
  setFilters: (filters: DeviceFilters) => void;
  setSearch: (search: string) => void;
  openObject: (open: boolean) => void;
  openDevice: (open: boolean) => void;
  reset: () => void;
}
export const useDeviceManagementUiStore = create<UiState>((set) => ({
  filters: { limit: 50 },
  createObjectOpen: false,
  createDeviceOpen: false,
  setFilters: (filters) => set({ filters }),
  setSearch: (search) => set((state) => ({ filters: { ...state.filters, search, cursor: null } })),
  openObject: (createObjectOpen) => set({ createObjectOpen }),
  openDevice: (createDeviceOpen) => set({ createDeviceOpen }),
  reset: () => set({ filters: { limit: 50 }, createObjectOpen: false, createDeviceOpen: false }),
}));
