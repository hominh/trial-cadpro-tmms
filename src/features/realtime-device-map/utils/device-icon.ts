"use client";

import L, { type DivIcon } from "leaflet";

const cache = new Map<string, DivIcon>();
const glyphs: Readonly<Record<string, string>> = {
  lpr_camera: "CAM",
  bus_gps: "BUS",
  env_multi: "ENV",
  signal_ctrl: "SIG",
};

export function getDeviceIcon(input: {
  typeCode: string;
  online: boolean;
  alertLevel: string;
  selected: boolean;
}): DivIcon {
  const glyph = glyphs[input.typeCode] ?? "DEV";
  const alert = input.alertLevel === "normal" ? "normal" : "alert";
  const key = `${glyph}:${input.online}:${alert}:${input.selected}`;
  const existing = cache.get(key);
  if (existing) return existing;
  const icon = L.divIcon({
    className: "device-marker-host",
    html: `<span class="device-marker ${input.online ? "is-online" : "is-offline"} is-${alert} ${input.selected ? "is-selected" : ""}" data-marker-heading><span class="device-marker-glyph">${glyph}</span><span class="device-marker-status" aria-hidden="true"></span></span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
  cache.set(key, icon);
  return icon;
}

export function clearDeviceIconCache(): void {
  cache.clear();
}
