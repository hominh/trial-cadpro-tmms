"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { DeviceDetailPanel } from "./device-detail-panel";
import { DeviceMapFilters } from "./device-map-filters";
import { DeviceMarkerLayer } from "./device-marker-layer";
import { MapStatusOverlay } from "./map-status-overlay";
import { useDevicePolling } from "../hooks/use-device-polling";
import { useDeviceStateStore } from "../stores/device-state-store";
import { useMapUiStore } from "../stores/map-ui-store";

function ViewportBridge() {
  const setViewportBounds = useMapUiStore((state) => state.setViewportBounds);
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      setViewportBounds({
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth(),
      });
    },
  });
  useEffect(() => {
    const bounds = map.getBounds();
    setViewportBounds({
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
    });
  }, [map, setViewportBounds]);
  return null;
}

function MapRuntime() {
  useDevicePolling();
  const map = useMap();
  const devicesById = useDeviceStateStore((state) => state.devicesById);
  const visibleIds = useDeviceStateStore((state) => state.visibleIds);
  const status = useDeviceStateStore((state) => state.status);
  const error = useDeviceStateStore((state) => state.error);
  const lastSuccessAt = useDeviceStateStore((state) => state.lastSuccessAt);
  const unlocatedCount = useDeviceStateStore((state) => state.unlocatedCount);
  const tooDense = useDeviceStateStore((state) => state.tooDense);
  const reconcileSelection = useMapUiStore((state) => state.reconcileSelection);
  const devices = useMemo(
    () =>
      [...visibleIds].flatMap((id) => {
        const device = devicesById.get(id);
        return device ? [device] : [];
      }),
    [devicesById, visibleIds]
  );
  useEffect(() => reconcileSelection(visibleIds), [reconcileSelection, visibleIds]);
  useEffect(() => {
    map.getContainer().focus({ preventScroll: true });
  }, [map]);
  return (
    <>
      <ViewportBridge />
      <DeviceMarkerLayer devices={devices} />
      <MapStatusOverlay
        status={status}
        count={devices.length}
        unlocatedCount={unlocatedCount}
        lastSuccessAt={lastSuccessAt}
        error={error?.message ?? null}
        tooDense={tooDense}
      />
    </>
  );
}

export function DeviceMap() {
  const tileUrl =
    process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution =
    process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ?? "&copy; OpenStreetMap contributors";
  return (
    <main className="map-page">
      <header className="map-toolbar">
        <div>
          <p className="eyebrow">CADPRO · LIVE MAP</p>
          <h1>Bản đồ thiết bị</h1>
        </div>
        <DeviceMapFilters />
      </header>
      <section className="map-shell" aria-label="Bản đồ thiết bị realtime">
        <MapContainer
          center={[10.7769, 106.7009]}
          zoom={13}
          minZoom={3}
          preferCanvas={false}
          keyboard
          className="leaflet-map"
        >
          <TileLayer attribution={attribution} url={tileUrl} />
          <MapRuntime />
        </MapContainer>
      </section>
      <DeviceDetailPanel />
    </main>
  );
}
