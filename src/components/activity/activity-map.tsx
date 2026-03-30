"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ActivityMapProps {
  track: Array<[number, number]>;
  height?: number;
}

export function ActivityMap({ track, height = 220 }: ActivityMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || track.length < 2) return;
    if (mapRef.current) return; // already initialized

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
      doubleClickZoom: true,
      touchZoom: true,
    });

    // Dark tiles
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 },
    ).addTo(map);

    // Downsample track for performance
    const step = Math.max(1, Math.floor(track.length / 500));
    const sampled = track.filter((_, i) => i % step === 0);

    // Draw polyline
    const polyline = L.polyline(sampled, {
      color: "#e8ff47",
      weight: 3,
      opacity: 0.9,
      smoothFactor: 1,
    }).addTo(map);

    // Start/end markers
    const startIcon = L.divIcon({
      html: '<div style="width:10px;height:10px;border-radius:50%;background:#81c784;border:2px solid #0d0d0f"></div>',
      iconSize: [10, 10],
      iconAnchor: [5, 5],
      className: "",
    });
    const endIcon = L.divIcon({
      html: '<div style="width:10px;height:10px;border-radius:50%;background:#ff6b35;border:2px solid #0d0d0f"></div>',
      iconSize: [10, 10],
      iconAnchor: [5, 5],
      className: "",
    });

    L.marker(sampled[0], { icon: startIcon }).addTo(map);
    L.marker(sampled[sampled.length - 1], { icon: endIcon }).addTo(map);

    // Fit bounds with padding
    map.fitBounds(polyline.getBounds(), { padding: [20, 20] });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [track]);

  if (!track || track.length < 2) {
    return (
      <div
        className="bg-card border border-border rounded-xl flex items-center justify-center text-muted text-sm"
        style={{ height }}
      >
        Pas de trace GPS
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden border border-border"
      style={{ height }}
    />
  );
}
