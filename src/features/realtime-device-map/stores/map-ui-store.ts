import { create } from "zustand";
import { DEFAULT_FILTERS, type ConnectivityFilter, type DeviceId, type DeviceMapFilters, type ViewportBounds } from "../types/device-map.types";
import { normalizeBounds } from "../utils/bbox";

interface MapUiStore {
  selectedDeviceId: DeviceId | null;
  viewportBounds: ViewportBounds | null;
  filters: DeviceMapFilters;
  detailPanelOpen: boolean;
  setViewportBounds: (bounds: ViewportBounds) => void;
  setDeviceTypes: (types: ReadonlySet<string>) => void;
  setStatus: (status: ConnectivityFilter) => void;
  setQuery: (query: string) => void;
  selectDevice: (id: DeviceId | null) => void;
  closeDetails: () => void;
  reconcileSelection: (visibleIds: ReadonlySet<DeviceId>) => void;
  reset: () => void;
}

const initial = { selectedDeviceId: null, viewportBounds: null, filters: DEFAULT_FILTERS, detailPanelOpen: false };

export const useMapUiStore = create<MapUiStore>((set) => ({
  ...initial,
  setViewportBounds: (viewportBounds) => set({ viewportBounds: normalizeBounds(viewportBounds) }),
  setDeviceTypes: (deviceTypes) => set((state) => ({ filters: { ...state.filters, deviceTypes: new Set(deviceTypes) } })),
  setStatus: (status) => set((state) => ({ filters: { ...state.filters, status } })),
  setQuery: (query) => set((state) => ({ filters: { ...state.filters, query: query.slice(0, 100) } })),
  selectDevice: (selectedDeviceId) => set({ selectedDeviceId, detailPanelOpen: selectedDeviceId !== null }),
  closeDetails: () => set({ detailPanelOpen: false }),
  reconcileSelection: (visibleIds) => set((state) => state.selectedDeviceId && !visibleIds.has(state.selectedDeviceId) ? { selectedDeviceId: null, detailPanelOpen: false } : state),
  reset: () => set({ ...initial, filters: { ...DEFAULT_FILTERS, deviceTypes: new Set() } }),
}));
