import { asDeviceId, type DeviceMapSnapshot, type DeviceState } from "../../../src/features/realtime-device-map/types/device-map.types";

const TYPE_CODES = ["lpr_camera", "bus_gps", "env_multi", "signal_ctrl", "unknown"] as const;

export function makeDevice(overrides: Partial<DeviceState> = {}): DeviceState {
  const index = overrides.stateVersion ?? 1;
  const mobility = overrides.mobility ?? "mobile";
  return {
    deviceId: overrides.deviceId ?? asDeviceId(`device-${index}`),
    code: overrides.code ?? `DV-${String(index).padStart(4, "0")}`,
    name: overrides.name ?? `Thiết bị ${index}`,
    deviceType: overrides.deviceType ?? { code: mobility === "mobile" ? "bus_gps" : "lpr_camera", name: "Thiết bị", iconId: null, uiPanel: null },
    mobility,
    position: overrides.position ?? { type: "Point", coordinates: [106.7 + index * 0.00001, 10.77 + index * 0.00001] },
    positionSource: overrides.positionSource ?? (mobility === "mobile" ? "device_state_valid_gps" : "object_location"),
    positionObservedAt: overrides.positionObservedAt ?? "2026-09-04T00:00:00.000Z",
    positionVersion: overrides.positionVersion ?? index,
    stateVersion: overrides.stateVersion ?? index,
    lastSeenAt: overrides.lastSeenAt ?? "2026-09-04T00:00:00.000Z",
    online: overrides.online ?? true,
    speedKph: overrides.speedKph ?? (mobility === "mobile" ? 35 : null),
    courseDeg: overrides.courseDeg ?? (mobility === "mobile" ? 90 : null),
    isStatic: overrides.isStatic ?? false,
    latestGpsStatus: overrides.latestGpsStatus ?? (mobility === "mobile" ? "A" : null),
    alertLevel: overrides.alertLevel ?? "normal",
    activePresetId: overrides.activePresetId ?? null,
    presetSource: overrides.presetSource ?? null,
  };
}

export function makeDevices(count: number, seed = 42): DeviceState[] {
  let value = seed >>> 0;
  const random = (): number => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x1_0000_0000;
  };
  return Array.from({ length: count }, (_, index) => {
    const mobile = index % 5 < 2;
    const typeCode = TYPE_CODES[index % TYPE_CODES.length] ?? "unknown";
    return makeDevice({
      deviceId: asDeviceId(`device-${index + 1}`),
      code: `DV-${String(index + 1).padStart(5, "0")}`,
      name: `Thiết bị ${index + 1}`,
      deviceType: { code: typeCode, name: typeCode, iconId: null, uiPanel: null },
      mobility: mobile ? "mobile" : "fixed",
      positionSource: mobile ? "device_state_valid_gps" : "object_location",
      position: { type: "Point", coordinates: [106.58 + random() * 0.35, 10.68 + random() * 0.3] },
      positionVersion: index + 1,
      stateVersion: index + 1,
      online: index % 7 !== 0,
      isStatic: mobile && index % 13 === 0,
      speedKph: mobile ? 20 + Math.round(random() * 40) : null,
      courseDeg: mobile ? Math.round(random() * 359) : null,
    });
  });
}

export function makeSnapshot(count = 4, seed = 42): DeviceMapSnapshot {
  const items = makeDevices(count, seed);
  return {
    snapshotId: `snapshot-${seed}-${count}`,
    generatedAt: "2026-09-04T00:00:20.000Z",
    query: { bbox: [106.58, 10.68, 106.93, 10.98], deviceTypes: [], status: "all", query: null },
    offlineThresholdSeconds: 30,
    returned: items.length,
    unlocatedCount: 0,
    complete: true,
    pollAfterMs: 4000,
    items,
  };
}

export const fixedDevice = makeDevice({ mobility: "fixed", positionSource: "object_location", speedKph: null, courseDeg: null });
export const voidGpsDevice = makeDevice({ stateVersion: 2, latestGpsStatus: "V" });
export const offlineDevice = makeDevice({ stateVersion: 3, online: false, lastSeenAt: "2026-09-03T23:59:00.000Z" });
export const unknownTypeDevice = makeDevice({ stateVersion: 4, deviceType: { code: "unknown", name: "Unknown", iconId: null, uiPanel: null } });
export const makeTwoThousandDevices = (): DeviceState[] => makeDevices(2000, 2000);
export const makeFiveThousandOneDevices = (): DeviceState[] => makeDevices(5001, 5001);
