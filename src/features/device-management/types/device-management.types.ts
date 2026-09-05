export type Brand<T, Name extends string> = T & { readonly __brand: Name };
export type ObjectId = Brand<string, "ObjectId">;
export type DeviceId = Brand<string, "DeviceId">;
export type PresetId = Brand<string, "PresetId">;
export type EnforcementRequestId = Brand<string, "EnforcementRequestId">;
export const asObjectId = (value: string): ObjectId => value as ObjectId;
export const asDeviceId = (value: string): DeviceId => value as DeviceId;
export const asPresetId = (value: string): PresetId => value as PresetId;
export const asEnforcementRequestId = (value: string): EnforcementRequestId =>
  value as EnforcementRequestId;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };
export type JsonObject = { readonly [key: string]: JsonValue };
export interface GeoJsonPoint {
  readonly type: "Point";
  readonly coordinates: readonly [longitude: number, latitude: number];
}
export interface GeoJsonPolygon {
  readonly type: "Polygon";
  readonly coordinates: readonly (readonly (readonly [number, number])[])[];
}
export interface Actor {
  readonly id: string;
  readonly displayName: string;
}
export type Permission =
  | "object.read"
  | "object.write"
  | "object.delete"
  | "device.read"
  | "device.write"
  | "device.delete"
  | "feature.write"
  | "enforcement.request"
  | "enforcement.approve"
  | "preset.write"
  | "preset.delete"
  | "audit.read";
export interface SessionContext {
  readonly actor: Actor;
  readonly permissions: readonly Permission[];
}
export interface PageMeta {
  readonly limit: number;
  readonly hasMore: boolean;
  readonly nextCursor: string | null;
}
export interface Page<T> {
  readonly items: readonly T[];
  readonly page: PageMeta;
}
export interface ObjectType {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}
export interface NumericConstraint {
  readonly min: number;
  readonly max: number;
  readonly step: number;
}
export interface PtzConstraints {
  readonly pan: NumericConstraint;
  readonly tilt: NumericConstraint;
  readonly zoom: NumericConstraint;
}
export interface Feature {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly isEnforcement: boolean;
  readonly defaultConfig: JsonObject;
}
export interface DeviceType {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly iconId: string | null;
  readonly uiPanel: string | null;
  readonly capabilities: readonly Feature[];
  readonly ptzConstraints: PtzConstraints | null;
}
export interface Catalogs {
  readonly objectTypes: readonly ObjectType[];
  readonly deviceTypes: readonly DeviceType[];
  readonly objectStatuses: readonly string[];
  readonly deviceStatuses: readonly string[];
}
export interface ObjectSummary {
  readonly id: ObjectId;
  readonly code: string;
  readonly name: string;
  readonly objectType: ObjectType;
}
export interface ObjectRecord extends ObjectSummary {
  readonly location: GeoJsonPoint;
  readonly status: string;
  readonly attrs: JsonObject;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
export interface DeviceRecord {
  readonly id: DeviceId;
  readonly code: string;
  readonly name: string;
  readonly serial: string | null;
  readonly deviceType: DeviceType;
  readonly object: ObjectSummary;
  readonly config: JsonObject;
  readonly status: string;
  readonly lastSeenAt: string | null;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
export interface ObjectWrite {
  readonly code: string;
  readonly name: string;
  readonly objectTypeId: string;
  readonly location: GeoJsonPoint;
  readonly status: string;
  readonly attrs: JsonObject;
}
export interface DeviceWrite {
  readonly code: string;
  readonly name: string;
  readonly serial: string | null;
  readonly deviceTypeId: string;
  readonly objectId: ObjectId;
  readonly config: JsonObject;
  readonly status: string;
}
export interface EnforcementRequestSummary {
  readonly id: EnforcementRequestId;
  readonly status: "pending";
  readonly requestedAt: string;
  readonly requestedBy: Actor;
  readonly reason: string;
  readonly etag: string;
}
export interface DeviceFeature {
  readonly deviceId: DeviceId;
  readonly feature: Feature;
  readonly isEnabled: boolean;
  readonly config: JsonObject;
  readonly pendingRequest: EnforcementRequestSummary | null;
  readonly version: number;
  readonly etag: string;
  readonly updatedAt: string;
  readonly updatedBy: Actor | null;
}
export interface DeviceFeatureWrite {
  readonly isEnabled: boolean;
  readonly config: JsonObject;
  readonly reason?: string | null;
}
export interface EnforcementRequest {
  readonly id: EnforcementRequestId;
  readonly deviceId: DeviceId;
  readonly feature: Feature;
  readonly requestedConfig: JsonObject;
  readonly reason: string;
  readonly status: "pending" | "approved" | "rejected";
  readonly requestedAt: string;
  readonly requestedBy: Actor;
  readonly decidedAt: string | null;
  readonly decidedBy: Actor | null;
  readonly decisionNote: string | null;
  readonly version: number;
  readonly etag: string;
}
export interface EnforcementDecision {
  readonly decision: "approve" | "reject";
  readonly note: string | null;
}
export interface FeatureHistoryEvent {
  readonly id: string;
  readonly deviceId: DeviceId;
  readonly feature: Feature;
  readonly eventType:
    "enabled" | "disabled" | "config_changed" | "approval_requested" | "approved" | "rejected";
  readonly before: JsonObject | null;
  readonly after: JsonObject | null;
  readonly reason: string | null;
  readonly approvalRequestId: EnforcementRequestId | null;
  readonly validFrom: string;
  readonly actor: Actor;
}
export interface PresetWrite {
  readonly presetNo: number;
  readonly name: string;
  readonly pan: number | null;
  readonly tilt: number | null;
  readonly zoom: number | null;
  readonly enforcementZone: GeoJsonPolygon | null;
  readonly laneLabel: string | null;
  readonly approach: string | null;
}
export interface DevicePreset extends PresetWrite {
  readonly id: PresetId;
  readonly deviceId: DeviceId;
  readonly isCalibrated: boolean;
  readonly calibratedAt: string | null;
  readonly calibratedBy: Actor | null;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
export interface Problem {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly code?: string;
  readonly detail?: string;
  readonly fieldErrors?: readonly { readonly field: string; readonly message: string }[];
}
export interface DeviceFilters {
  readonly objectId?: ObjectId;
  readonly objectTypeId?: string;
  readonly deviceTypeId?: string;
  readonly status?: string;
  readonly search?: string;
  readonly cursor?: string | null;
  readonly limit?: number;
}
