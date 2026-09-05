import { create } from "zustand";
import type { DevicePreset } from "../types/device-management.types";
interface PresetState {
  readonly presets: readonly DevicePreset[];
  readonly selectedPresetId: string | null;
  readonly loading: boolean;
  readonly error: string | null;
  setPresets: (presets: readonly DevicePreset[]) => void;
  upsertPreset: (preset: DevicePreset) => void;
  select: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
export const useDevicePresetStore = create<PresetState>((set) => ({
  presets: [],
  selectedPresetId: null,
  loading: false,
  error: null,
  setPresets: (presets) => set({ presets, loading: false, error: null }),
  upsertPreset: (preset) =>
    set((state) => ({
      presets: [preset, ...state.presets.filter((item) => item.id !== preset.id)],
    })),
  select: (selectedPresetId) => set({ selectedPresetId }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  reset: () => set({ presets: [], selectedPresetId: null, loading: false, error: null }),
}));
