import { http, HttpResponse } from "msw";

const generatedAt = "2026-09-04T00:00:20.000Z";
const baseItem = {
  device_id: "bus-001", code: "BUS-001", name: "Xe buýt 01",
  device_type: { code: "bus_gps", name: "GPS xe buýt", icon_id: null, ui_panel: null },
  mobility: "mobile", position: { type: "Point", coordinates: [106.7, 10.77] },
  position_source: "device_state_valid_gps", position_observed_at: "2026-09-04T00:00:15.000Z",
  position_version: 1, state_version: 1, last_seen_at: "2026-09-04T00:00:15.000Z",
  online: true, speed_kph: 32, course_deg: 90, is_static: false, latest_gps_status: "A",
  alert_level: "normal", active_preset_id: null, preset_source: null,
};

export const deviceMapHandlers = [
  http.get("*/api/v1/map/device-states", ({ request }) => {
    const url = new URL(request.url);
    if (!url.searchParams.get("bbox")) return HttpResponse.json({ type: "about:blank", title: "Invalid bbox", status: 400 }, { status: 400 });
    if (url.searchParams.get("q") === "too-dense") return HttpResponse.json({ type: "about:blank", title: "Viewport too dense", status: 422, code: "VIEWPORT_TOO_DENSE", matched: 5001, max_items: 5000 }, { status: 422 });
    if (url.searchParams.get("q") === "offline-transition") {
      const previousTag = request.headers.get("if-none-match");
      const offline = previousTag === '"snapshot-online-transition"';
      const item = { ...baseItem, online: !offline };
      return HttpResponse.json({ snapshot_id: offline ? "snapshot-offline" : "snapshot-online", generated_at: generatedAt, query: { bbox: [106.6, 10.7, 106.9, 10.95], device_types: [], status: "all", q: "offline-transition" }, offline_threshold_seconds: 30, returned: 1, unlocated_count: 0, complete: true, poll_after_ms: 4000, items: [item] }, { headers: { ETag: offline ? '"snapshot-offline-transition"' : '"snapshot-online-transition"', "Cache-Control": "private, no-cache" } });
    }
    const etag = '"snapshot-online"';
    if (request.headers.get("if-none-match") === etag) return new HttpResponse(null, { status: 304 });
    return HttpResponse.json({ snapshot_id: "snapshot-1", generated_at: generatedAt, query: { bbox: [106.6, 10.7, 106.9, 10.95], device_types: [], status: "all", q: null }, offline_threshold_seconds: 30, returned: 1, unlocated_count: 0, complete: true, poll_after_ms: 4000, items: [baseItem] }, { headers: { ETag: etag, "Cache-Control": "private, no-cache" } });
  }),
];
