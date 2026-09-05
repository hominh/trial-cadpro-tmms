import type {
  Actor,
  DeviceFeature,
  DevicePreset,
  DeviceRecord,
  DeviceType,
  EnforcementRequest,
  Feature,
  FeatureHistoryEvent,
  JsonObject,
  ObjectRecord,
  ObjectType,
  Page,
  PtzConstraints,
} from "../types/device-management.types";
import {
  asDeviceId,
  asEnforcementRequestId,
  asObjectId,
  asPresetId,
} from "../types/device-management.types";

type Raw = Record<string, unknown>;
const record = (value: unknown): Raw =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Raw) : {};
const string = (value: unknown): string => (typeof value === "string" ? value : "");
const nullableString = (value: unknown): string | null =>
  typeof value === "string" ? value : null;
const boolean = (value: unknown): boolean => value === true;
const number = (value: unknown): number => (typeof value === "number" ? value : 0);
const json = (value: unknown): JsonObject => record(value) as JsonObject;
const array = (value: unknown): readonly unknown[] => (Array.isArray(value) ? value : []);
export const mapActor = (raw: unknown): Actor => {
  const value = record(raw);
  return { id: string(value.id), displayName: string(value.display_name) };
};
export const mapObjectType = (raw: unknown): ObjectType => {
  const value = record(raw);
  const rawAttrs = value.default_attrs ?? value.defaultAttrs;
  return {
    id: string(value.id),
    code: string(value.code),
    name: string(value.name),
    defaultAttrs: rawAttrs ? json(rawAttrs) : null,
  };
};
export const mapFeature = (raw: unknown): Feature => {
  const value = record(raw);
  return {
    id: string(value.id),
    code: string(value.code),
    name: string(value.name),
    isEnforcement: boolean(value.is_enforcement),
    defaultConfig: json(value.default_config),
  };
};
export const mapPtz = (raw: unknown): PtzConstraints | null => {
  if (!raw) return null;
  const value = record(raw);
  const constraint = (input: unknown) => {
    const item = record(input);
    return { min: number(item.min), max: number(item.max), step: number(item.step) };
  };
  return { pan: constraint(value.pan), tilt: constraint(value.tilt), zoom: constraint(value.zoom) };
};
export const mapDeviceType = (raw: unknown): DeviceType => {
  const value = record(raw);
  return {
    id: string(value.id),
    code: string(value.code),
    name: string(value.name),
    iconId: nullableString(value.icon_id),
    uiPanel: nullableString(value.ui_panel),
    capabilities: array(value.capabilities).map(mapFeature),
    ptzConstraints: mapPtz(value.ptz_constraints),
  };
};
export const mapObject = (raw: unknown): ObjectRecord => {
  const value = record(raw);
  const location = record(value.location);
  const coordinates = array(location.coordinates);
  return {
    id: asObjectId(string(value.id)),
    code: string(value.code),
    name: string(value.name),
    objectType: mapObjectType(value.object_type),
    location: { type: "Point", coordinates: [number(coordinates[0]), number(coordinates[1])] },
    status: string(value.status),
    attrs: json(value.attrs),
    version: number(value.version),
    createdAt: string(value.created_at),
    updatedAt: string(value.updated_at),
    deletedAt: nullableString(value.deleted_at),
  };
};
export const mapDevice = (raw: unknown): DeviceRecord => {
  const value = record(raw);
  const object = record(value.object);
  return {
    id: asDeviceId(string(value.id)),
    code: string(value.code),
    name: string(value.name),
    serial: nullableString(value.serial),
    deviceType: mapDeviceType(value.device_type),
    object: {
      id: asObjectId(string(object.id)),
      code: string(object.code),
      name: string(object.name),
      objectType: mapObjectType(object.object_type),
    },
    config: json(value.config),
    status: string(value.status),
    lastSeenAt: nullableString(value.last_seen_at),
    version: number(value.version),
    createdAt: string(value.created_at),
    updatedAt: string(value.updated_at),
    deletedAt: nullableString(value.deleted_at),
  };
};
export const mapFeatureState = (raw: unknown): DeviceFeature => {
  const value = record(raw);
  const pending = value.pending_request ? record(value.pending_request) : null;
  return {
    deviceId: asDeviceId(string(value.device_id)),
    feature: mapFeature(value.feature),
    isEnabled: boolean(value.is_enabled),
    config: json(value.config),
    pendingRequest: pending
      ? {
          id: asEnforcementRequestId(string(pending.id)),
          status: "pending",
          requestedAt: string(pending.requested_at),
          requestedBy: mapActor(pending.requested_by),
          reason: string(pending.reason),
          etag: string(pending.etag),
        }
      : null,
    version: number(value.version),
    etag: string(value.etag),
    updatedAt: string(value.updated_at),
    updatedBy: value.updated_by ? mapActor(value.updated_by) : null,
  };
};
export const mapRequest = (raw: unknown): EnforcementRequest => {
  const value = record(raw);
  const status = string(value.status);
  return {
    id: asEnforcementRequestId(string(value.id)),
    deviceId: asDeviceId(string(value.device_id)),
    feature: mapFeature(value.feature),
    requestedConfig: json(value.requested_config),
    reason: string(value.reason),
    status: status === "approved" || status === "rejected" ? status : "pending",
    requestedAt: string(value.requested_at),
    requestedBy: mapActor(value.requested_by),
    decidedAt: nullableString(value.decided_at),
    decidedBy: value.decided_by ? mapActor(value.decided_by) : null,
    decisionNote: nullableString(value.decision_note),
    version: number(value.version),
    etag: string(value.etag),
  };
};
export const mapHistory = (raw: unknown): FeatureHistoryEvent => {
  const value = record(raw);
  const type = string(value.event_type);
  const eventType: FeatureHistoryEvent["eventType"] =
    type === "enabled" ||
    type === "disabled" ||
    type === "config_changed" ||
    type === "approval_requested" ||
    type === "approved" ||
    type === "rejected"
      ? type
      : "config_changed";
  return {
    id: string(value.id),
    deviceId: asDeviceId(string(value.device_id)),
    feature: mapFeature(value.feature),
    eventType,
    before: value.before ? json(value.before) : null,
    after: value.after ? json(value.after) : null,
    reason: nullableString(value.reason),
    approvalRequestId: value.approval_request_id
      ? asEnforcementRequestId(string(value.approval_request_id))
      : null,
    validFrom: string(value.valid_from),
    actor: mapActor(value.actor),
  };
};
export const mapPreset = (raw: unknown): DevicePreset => {
  const value = record(raw);
  const zone = value.enforcement_zone ? record(value.enforcement_zone) : null;
  const ring = zone
    ? array(array(zone.coordinates)[0]).map((point) => {
        const coordinates = array(point);
        return [number(coordinates[0]), number(coordinates[1])] as [number, number];
      })
    : [];
  return {
    id: asPresetId(string(value.id)),
    deviceId: asDeviceId(string(value.device_id)),
    presetNo: number(value.preset_no),
    name: string(value.name),
    pan: typeof value.pan === "number" ? value.pan : null,
    tilt: typeof value.tilt === "number" ? value.tilt : null,
    zoom: typeof value.zoom === "number" ? value.zoom : null,
    enforcementZone: zone ? { type: "Polygon", coordinates: [ring] } : null,
    laneLabel: nullableString(value.lane_label),
    approach: nullableString(value.approach),
    isCalibrated: boolean(value.is_calibrated),
    calibratedAt: nullableString(value.calibrated_at),
    calibratedBy: value.calibrated_by ? mapActor(value.calibrated_by) : null,
    version: number(value.version),
    createdAt: string(value.created_at),
    updatedAt: string(value.updated_at),
    deletedAt: nullableString(value.deleted_at),
  };
};
export function mapPage<T>(raw: unknown, mapper: (value: unknown) => T): Page<T> {
  const value = record(raw);
  const meta = record(value.page);
  return {
    items: array(value.items).map(mapper),
    page: {
      limit: number(meta.limit),
      hasMore: boolean(meta.has_more),
      nextCursor: nullableString(meta.next_cursor),
    },
  };
}
