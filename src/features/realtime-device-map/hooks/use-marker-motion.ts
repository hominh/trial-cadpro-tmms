"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Marker } from "leaflet";
import type { DeviceId } from "../types/device-map.types";
import { createMotionPlan, interpolateAngle, interpolatePoint, type LatLngValue } from "../utils/motion";

interface Track {
  marker: Marker;
  from: LatLngValue;
  to: LatLngValue;
  startedAt: number;
  durationMs: number;
  fromCourse: number;
  toCourse: number;
}

export interface MotionTarget {
  id: DeviceId; marker: Marker; fromConfirmed: LatLngValue; to: LatLngValue; fromObservedAtMs: number; toObservedAtMs: number;
  fromCourse: number | null; toCourse: number | null;
}

export function useMarkerMotion() {
  const tracks = useRef(new Map<DeviceId, Track>());
  const frame = useRef<number | null>(null);

  const tick = useCallback((now: number) => {
    for (const [id, track] of tracks.current) {
      const progress = track.durationMs <= 0 ? 1 : (now - track.startedAt) / track.durationMs;
      const point = interpolatePoint(track.from, track.to, progress);
      track.marker.setLatLng(point);
      const inner = track.marker.getElement()?.querySelector<HTMLElement>("[data-marker-heading]");
      if (inner) inner.style.transform = `rotate(${interpolateAngle(track.fromCourse, track.toCourse, progress)}deg)`;
      if (progress >= 1) tracks.current.delete(id);
    }
    frame.current = tracks.current.size ? requestAnimationFrame(tick) : null;
  }, []);

  const retarget = useCallback((target: MotionTarget) => {
    const currentLatLng = target.marker.getLatLng();
    const from = { lat: currentLatLng.lat, lng: currentLatLng.lng };
    const plan = createMotionPlan(target.fromConfirmed, target.to, target.fromObservedAtMs, target.toObservedAtMs);
    if (plan.snap || plan.durationMs === 0) {
      tracks.current.delete(target.id);
      target.marker.setLatLng(target.to);
      return;
    }
    tracks.current.set(target.id, { marker: target.marker, from, to: target.to, startedAt: performance.now(), durationMs: plan.durationMs, fromCourse: target.fromCourse ?? 0, toCourse: target.toCourse ?? target.fromCourse ?? 0 });
    if (frame.current === null) frame.current = requestAnimationFrame(tick);
  }, [tick]);

  const remove = useCallback((id: DeviceId) => { tracks.current.delete(id); }, []);

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    tracks.current.clear();
  }, []);

  return { retarget, remove };
}
