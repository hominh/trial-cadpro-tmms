import { create } from "zustand";
import type {
  DeviceFeature,
  EnforcementRequest,
  FeatureHistoryEvent,
} from "../types/device-management.types";
interface FeatureState {
  readonly features: readonly DeviceFeature[];
  readonly history: readonly FeatureHistoryEvent[];
  readonly requests: readonly EnforcementRequest[];
  readonly loading: boolean;
  readonly error: string | null;
  setFeatures: (features: readonly DeviceFeature[]) => void;
  setHistory: (history: readonly FeatureHistoryEvent[]) => void;
  setRequests: (requests: readonly EnforcementRequest[]) => void;
  replaceFeature: (feature: DeviceFeature) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
export const useDeviceFeatureStore = create<FeatureState>((set) => ({
  features: [],
  history: [],
  requests: [],
  loading: false,
  error: null,
  setFeatures: (features) => set({ features, loading: false, error: null }),
  setHistory: (history) => set({ history }),
  setRequests: (requests) => set({ requests }),
  replaceFeature: (feature) =>
    set((state) => ({
      features: state.features.map((item) =>
        item.feature.code === feature.feature.code ? feature : item
      ),
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  reset: () => set({ features: [], history: [], requests: [], loading: false, error: null }),
}));
