export function apiSnapshot(count = 4) {
  const items = Array.from({ length: count }, (_, index) => {
    const mobile = index % 5 < 2;
    const typeCodes = ["lpr_camera", "bus_gps", "env_multi", "signal_ctrl"] as const;
    const code = `DV-${String(index + 1).padStart(5, "0")}`;
    return {
      device_id: `device-${index + 1}`, code, name: `Thiết bị mẫu ${index + 1}`,
      device_type: { code: typeCodes[index % 4], name: typeCodes[index % 4], icon_id: null, ui_panel: null },
      mobility: mobile ? "mobile" : "fixed",
      position: { type: "Point", coordinates: [106.66 + (index % 100) * .0008, 10.74 + Math.floor(index / 100) * .0007] },
      position_source: mobile ? "device_state_valid_gps" : "object_location",
      position_observed_at: "2026-09-04T00:00:15.000Z", position_version: 1, state_version: 1,
      last_seen_at: index % 7 ? "2026-09-04T00:00:15.000Z" : "2026-09-03T23:59:00.000Z",
      online: index % 7 !== 0, speed_kph: mobile ? 32 : null, course_deg: mobile ? 90 : null,
      is_static: false, latest_gps_status: mobile ? "A" : null, alert_level: "normal",
      active_preset_id: index === 0 ? "preset-1" : null, preset_source: index === 0 ? "schedule" : null,
    };
  });
  return { snapshot_id: `snapshot-${count}`, generated_at: "2026-09-04T00:00:20.000Z", query: { bbox: [106.4, 10.5, 107.1, 11.1], device_types: [], status: "all", q: null }, offline_threshold_seconds: 30, returned: count, unlocated_count: 0, complete: true, poll_after_ms: 4000, items };
}
