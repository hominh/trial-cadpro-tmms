import { create } from "zustand";
import type { SessionContext } from "../types/device-management.types";
interface AccessState {
  readonly context: SessionContext | null;
  readonly loading: boolean;
  readonly error: string | null;
  setContext: (context: SessionContext) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
export const useDeviceManagementAccessStore = create<AccessState>((set) => ({
  context: null,
  loading: false,
  error: null,
  setContext: (context) => set({ context, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  reset: () => set({ context: null, loading: false, error: null }),
}));
