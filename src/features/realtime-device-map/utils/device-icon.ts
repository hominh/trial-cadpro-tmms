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
    className: "device-marker-host bg-none border-0",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" class="overflow-visible"><g data-marker-heading transform="rotate(0 19 19)"><foreignObject width="38" height="38" class="overflow-visible"><span xmlns="http://www.w3.org/1999/xhtml" class="device-marker relative w-[38px] h-[38px] grid place-items-center [border:2px_solid_white] rounded-[50%_50%_50%_8px] [background:#0b6b53] text-white [box-shadow:0_5px_16px_rgba(16,_33,_29,_0.3)] origin-center [contain:layout_paint] [&.is-offline]:[background:#68726e] [&.is-alert::after]:[content:'!'] [&.is-alert::after]:absolute [&.is-alert::after]:top-[-6px] [&.is-alert::after]:right-[-6px] [&.is-alert::after]:w-[17px] [&.is-alert::after]:h-[17px] [&.is-alert::after]:rounded-[50%] [&.is-alert::after]:[background:#b42318] [&.is-alert::after]:[font:800_11px/17px_system-ui] [&.is-alert::after]:text-center [&.is-selected]:[outline:3px_solid_#f2b63d] [&.is-selected]:[outline-offset:2px] motion-reduce:[&&&]:[transition:none] ${input.online ? "is-online" : "is-offline"} is-${alert} ${input.selected ? "is-selected" : ""}"><span class="device-marker-glyph [font:800_9px/1_ui-monospace,_monospace] tracking-[-0.03em]">${glyph}</span><span class="device-marker-status absolute left-[-1px] bottom-[-1px] w-[10px] h-[10px] [border:2px_solid_white] rounded-[50%] [background:#28a06a] [.is-offline_&]:[background:#9da5a1]" aria-hidden="true"></span></span></foreignObject></g></svg>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
  cache.set(key, icon);
  return icon;
}

export function clearDeviceIconCache(): void {
  cache.clear();
}
