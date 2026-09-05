import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TYPE_CODES = ["lpr_camera", "bus_gps", "env_multi", "signal_ctrl"] as const;
const TYPE_NAMES = ["Camera LPR", "GPS xe buýt", "Cảm biến môi trường", "Tủ điều khiển tín hiệu"] as const;
const DEVICE_COUNT = 120;

interface Bounds {
  minLongitude: number;
  minLatitude: number;
  maxLongitude: number;
  maxLatitude: number;
}

function parseBounds(value: string | null): Bounds | null {
  if (!value) return null;
  const coordinates = value.split(",").map(Number);
  if (coordinates.length !== 4 || coordinates.some((coordinate) => !Number.isFinite(coordinate))) return null;
  const [minLongitude, minLatitude, maxLongitude, maxLatitude] = coordinates;
  if (minLongitude === undefined || minLatitude === undefined || maxLongitude === undefined || maxLatitude === undefined) return null;
  if (minLongitude >= maxLongitude || minLatitude >= maxLatitude) return null;
  return { minLongitude, minLatitude, maxLongitude, maxLatitude };
}

function createDevice(index: number, timeBucket: number, now: Date) {
  const deviceNumber = index + 1;
  const typeIndex = index % TYPE_CODES.length;
  const typeCode = TYPE_CODES[typeIndex] ?? "lpr_camera";
  const isMobile = typeCode === "bus_gps";
  const isOffline = index % 11 === 0;
  const isStatic = isMobile && index % 17 === 0;
  const baseLongitude = 106.655 + (index % 15) * 0.006;
  const baseLatitude = 10.735 + Math.floor(index / 15) * 0.008;
  const motionPhase = (timeBucket + index) / 5;
  const longitude = baseLongitude + (isMobile && !isStatic ? Math.cos(motionPhase) * 0.0007 : 0);
  const latitude = baseLatitude + (isMobile && !isStatic ? Math.sin(motionPhase) * 0.0007 : 0);
  const observedAt = new Date(now.getTime() - (isOffline ? 45_000 : 1_000)).toISOString();

  return {
    device_id: `mock-device-${deviceNumber}`,
    code: `${typeCode.toUpperCase()}-${String(deviceNumber).padStart(4, "0")}`,
    name: `${TYPE_NAMES[typeIndex] ?? "Thiết bị"} ${deviceNumber}`,
    device_type: { code: typeCode, name: TYPE_NAMES[typeIndex] ?? typeCode, icon_id: null, ui_panel: null },
    mobility: isMobile ? "mobile" : "fixed",
    position: { type: "Point", coordinates: [longitude, latitude] as [number, number] },
    position_source: isMobile ? "device_state_valid_gps" : "object_location",
    position_observed_at: observedAt,
    position_version: isMobile ? timeBucket : 1,
    state_version: isMobile ? timeBucket : 1,
    last_seen_at: observedAt,
    online: !isOffline,
    speed_kph: isMobile && !isStatic ? 32 + (index % 18) : null,
    course_deg: isMobile ? (timeBucket * 12 + index * 19) % 360 : null,
    is_static: isStatic,
    latest_gps_status: isMobile ? "A" : null,
    alert_level: index % 19 === 0 ? "warning" : "normal",
    active_preset_id: index % 13 === 0 ? `preset-${index % 4 + 1}` : null,
    preset_source: index % 13 === 0 ? "schedule" : null,
  };
}

export function GET(request: NextRequest) {
  const bounds = parseBounds(request.nextUrl.searchParams.get("bbox"));
  if (!bounds) {
    return NextResponse.json({ type: "about:blank", title: "Invalid bbox", status: 400, code: "INVALID_BBOX" }, { status: 400 });
  }

  const now = new Date();
  const timeBucket = Math.floor(now.getTime() / 4_000);
  const requestedTypes = new Set((request.nextUrl.searchParams.get("device_types") ?? "").split(",").filter(Boolean));
  const requestedStatus = request.nextUrl.searchParams.get("status") ?? "all";
  const search = (request.nextUrl.searchParams.get("q") ?? "").trim().toLocaleLowerCase("vi");
  const items = Array.from({ length: DEVICE_COUNT }, (_, index) => createDevice(index, timeBucket, now)).filter((device) => {
    const [longitude, latitude] = device.position.coordinates;
    const insideViewport = longitude >= bounds.minLongitude && longitude <= bounds.maxLongitude
      && latitude >= bounds.minLatitude && latitude <= bounds.maxLatitude;
    const matchesType = requestedTypes.size === 0 || requestedTypes.has(device.device_type.code);
    const matchesStatus = requestedStatus === "all" || (requestedStatus === "online" ? device.online : !device.online);
    const matchesSearch = !search || `${device.code} ${device.name}`.toLocaleLowerCase("vi").includes(search);
    return insideViewport && matchesType && matchesStatus && matchesSearch;
  });

  const etag = `W/"mock-${timeBucket}-${items.length}-${requestedStatus}-${[...requestedTypes].join(".")}-${search}"`;
  if (request.headers.get("if-none-match") === etag) return new NextResponse(null, { status: 304, headers: { ETag: etag } });

  return NextResponse.json({
    snapshot_id: `mock-snapshot-${timeBucket}`,
    generated_at: now.toISOString(),
    query: {
      bbox: [bounds.minLongitude, bounds.minLatitude, bounds.maxLongitude, bounds.maxLatitude],
      device_types: [...requestedTypes],
      status: requestedStatus,
      q: search || null,
    },
    offline_threshold_seconds: 30,
    returned: items.length,
    unlocated_count: 0,
    complete: true,
    poll_after_ms: 4_000,
    items,
  }, { headers: { ETag: etag, "Cache-Control": "private, no-cache" } });
}
