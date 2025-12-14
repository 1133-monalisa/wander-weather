"use client";

import React, { useEffect, useMemo, useRef } from "react";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";

// --- Types ---
export type Pin = {
  lat: number;
  lon: number;
  label?: string;
  popup?: string;
  category?: "food" | "activity" | "stay";
};

// --- Icons ---
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const RedIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// --- Component: Handles Auto-Focus Logic ---
function MapController({
  center,
  zoom,
  selectedIndex,
  pins,
}: {
  center: LatLngExpression;
  zoom: number;
  selectedIndex: number | null;
  pins: Pin[];
}) {
  const map = useMap();
  const markerRefs = useRef<(L.Marker | null)[]>([]);

  // 1. Handle Flying to Global Center (Initial Load)
  useEffect(() => {
    if (selectedIndex === null) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map, selectedIndex]);

  // 2. Handle Flying to Selected Pin & Opening Popup
  useEffect(() => {
    if (selectedIndex !== null && pins[selectedIndex]) {
      const pin = pins[selectedIndex];
      map.flyTo([pin.lat, pin.lon], 15, { duration: 1.2 });

      const marker = markerRefs.current[selectedIndex];
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 300);
      }
    }
  }, [selectedIndex, pins, map]);

  return (
    <>
      {pins.map((p, i) => (
        <Marker
          key={`pin-${i}`}
          position={[p.lat, p.lon]}
          icon={RedIcon}
          ref={(ref) => {
            markerRefs.current[i] = ref;
          }}
          eventHandlers={{
            click: () => {},
          }}
        >
          <Popup className="font-sans">
            <div className="text-sm">
              <div className="font-bold text-slate-900">{p.label}</div>
              <div className="text-xs text-slate-500 mt-1">{p.popup}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// --- Main Component ---
export default function MapView({
  lat,
  lon,
  label,
  pins = [],
  selectedIndex = null,
  heightClassName = "h-[400px]",
  zoom = 13,
  showCircle = true,
  circleRadius = 2000,
}: {
  lat?: number | null;
  lon?: number | null;
  label?: string;
  pins?: Pin[];
  selectedIndex?: number | null;
  heightClassName?: string;
  zoom?: number;
  showCircle?: boolean;
  circleRadius?: number;
}) {
  const hasMain = typeof lat === "number" && typeof lon === "number";

  const center: LatLngExpression = useMemo(() => {
    if (hasMain) return [lat!, lon!];
    return [28.3949, 84.124];
  }, [hasMain, lat, lon]);

  const mapKey = hasMain ? `${lat}-${lon}` : "default-map-key";

  return (
    <div
      className={`w-full ${heightClassName} rounded-md overflow-hidden border border-slate-200 relative z-0`}
    >
      <style>{`.leaflet-container img { max-width: none !important; }`}</style>

      <MapContainer
        key={mapKey}
        center={center}
        zoom={hasMain ? zoom : 7}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* 1. Main Location Marker (Blue) */}
        {hasMain && (
          <Marker position={[lat!, lon!]} icon={DefaultIcon}>
            <Popup>
              <div className="font-bold text-slate-900">
                {label ?? "City Center"}
              </div>
              <div className="text-xs text-slate-500">Main Search Location</div>
            </Popup>
          </Marker>
        )}

        {/* 2. Radius Circle around Main */}
        {showCircle && hasMain && (
          <Circle
            center={[lat!, lon!]}
            radius={circleRadius}
            pathOptions={{
              color: "#0ea5e9",
              fillColor: "#0ea5e9",
              fillOpacity: 0.08,
              weight: 1,
            }}
          />
        )}

        {/* 3. Logic Controller + Red Pins */}
        <MapController
          center={center}
          zoom={hasMain ? zoom : 7}
          selectedIndex={selectedIndex}
          pins={pins}
        />
      </MapContainer>
    </div>
  );
}
