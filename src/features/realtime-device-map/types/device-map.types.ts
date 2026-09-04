export type DeviceId = string & { readonly __brand: "DeviceId" };

export interface GeoPoint {
  readonly type: "Point";
  readonly coordinates: readonly [longitude: number, latitude: number];
}

export interface ViewportBounds {
  readonly west: number;
  readonly south: number;
  readonly east: number;
  readonly north: number;
}

export type ConnectivityFilter = "all" | "online" | "offline";

export interface DeviceMapFilters {
  readonly deviceTypes: ReadonlySet<string>;
  readonly status: ConnectivityFilter;
  readonly query: string;
}

export interface DeviceTypeSummary {
  readonly code: string;
  readonly name: string;
  readonly iconId: string | null;
  readonly uiPanel: string | null;
}

export type DeviceMobility = "fixed" | "mobile";
export type PositionSource = "object_location" | "device_state_valid_gps";

export interface DeviceState {
  readonly deviceId: DeviceId;
  readonly code: string;
  readonly name: string;
  readonly deviceType: DeviceTypeSummary;
  readonly mobility: DeviceMobility;
  readonly position: GeoPoint;
  readonly positionSource: PositionSource;
  readonly positionObservedAt: string;
  readonly positionVersion: number;
  readonly stateVersion: number;
  readonly lastSeenAt: string;
  readonly online: boolean;
  readonly speedKph: number | null;
  readonly courseDeg: number | null;
  readonly isStatic: boolean;
  readonly latestGpsStatus: string | null;
  readonly alertLevel: string;
  readonly activePresetId: string | null;
  readonly presetSource: string | null;
}

export interface NormalizedMapQuery {
  readonly bbox: readonly [number, number, number, number];
  readonly deviceTypes: readonly string[];
  readonly status: ConnectivityFilter;
  readonly query: string | null;
}

export interface DeviceMapSnapshot {
  readonly snapshotId: string;
  readonly generatedAt: string;
  readonly query: NormalizedMapQuery;
  readonly offlineThresholdSeconds: 30;
  readonly returned: number;
  readonly unlocatedCount: number;
  readonly complete: true;
  readonly pollAfterMs: number;
  readonly items: readonly DeviceState[];
}

export interface ProblemResponse {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly code?: string;
  readonly detail?: string;
}

export interface ViewportTooDenseProblem extends ProblemResponse {
  readonly status: 422;
  readonly code: "VIEWPORT_TOO_DENSE";
  readonly matched: number;
  readonly maxItems: 5000;
}

export type DeviceMapErrorKind =
  | "invalidQuery"
  | "tooDense"
  | "rateLimited"
  | "network"
  | "server"
  | "contract"
  | "cancelled";

export interface DeviceMapError {
  readonly kind: DeviceMapErrorKind;
  readonly message: string;
  readonly status?: number;
  readonly retryAfterSeconds?: number;
  readonly matched?: number;
  readonly maxItems?: number;
}

export const asDeviceId = (value: string): DeviceId => value as DeviceId;

export const DEFAULT_FILTERS: DeviceMapFilters = {
  deviceTypes: new Set<string>(),
  status: "all",
  query: "",
};
