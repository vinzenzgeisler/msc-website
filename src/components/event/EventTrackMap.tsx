import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { eventTrackData } from "./event-track-data";
const cartoBasemapKey = import.meta.env.VITE_CARTO_BASEMAP_KEY;

export function EventTrackMap() {
  const mapNode = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapNode.current) return;

    const map = L.map(mapNode.current, {
      scrollWheelZoom: false,
      attributionControl: true,
      zoomControl: true,
    }).setView([50.86, 14.68], 13);

    const tileUrl = cartoBasemapKey
      ? `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoBasemapKey)}`
      : "https://tile.openstreetmap.de/{z}/{x}/{y}.png";

    L.tileLayer(tileUrl, {
      subdomains: cartoBasemapKey ? "abcd" : "abc",
      maxZoom: 19,
      attribution: cartoBasemapKey
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende',
    }).addTo(map);

    const route = L.geoJSON(eventTrackData, {
      style: { color: "#243b8f", weight: 6, opacity: 0.9 },
    }).addTo(map);
    const bounds = route.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24] });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapNode}
      className="aspect-[4/3] w-full bg-muted"
      role="img"
      aria-label="Interaktive Streckenkarte des Oberlausitzer Dreiecks"
    />
  );
}
