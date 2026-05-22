"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Prospect {
  id: string;
  name: string;
  sector: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  website?: string;
  score: number;
  priority: "hot" | "warm" | "cold";
  status: string;
  pitch?: string;
  notes?: string;
}

interface ProspectsMapProps {
  prospects: Prospect[];
  onSelect: (prospect: Prospect) => void;
  selected?: Prospect | null;
}

function makeIcon(priority: string) {
  const color = priority === "hot" ? "#ef4444" : priority === "warm" ? "#f97316" : "#9ca3af";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

// Montpellier coordinates for prospects without GPS data
const CITY_COORDS: Record<string, [number, number]> = {
  montpellier: [43.6117, 3.8767],
  paris: [48.8566, 2.3522],
  lyon: [45.7640, 4.8357],
  marseille: [43.2965, 5.3698],
  bordeaux: [44.8378, -0.5792],
  toulouse: [43.6047, 1.4442],
  nantes: [47.2184, -1.5536],
  nice: [43.7102, 7.2620],
};

function getCityCoords(city: string): [number, number] {
  const key = city.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return CITY_COORDS[key] ?? [43.6117, 3.8767];
}

function jitter(base: [number, number], index: number): [number, number] {
  const angle = (index * 137.5 * Math.PI) / 180;
  const radius = 0.003 + (index % 5) * 0.002;
  return [base[0] + Math.cos(angle) * radius, base[1] + Math.sin(angle) * radius];
}

export default function ProspectsMap({ prospects, onSelect, selected }: ProspectsMapProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const prospectsWithCoords = prospects.map((p, i) => {
    if (p.lat && p.lng) return { ...p, _lat: p.lat, _lng: p.lng };
    const base = getCityCoords(p.city || "montpellier");
    const [lat, lng] = jitter(base, i);
    return { ...p, _lat: lat, _lng: lng };
  });

  const center: [number, number] = prospectsWithCoords.length > 0
    ? [prospectsWithCoords[0]._lat, prospectsWithCoords[0]._lng]
    : [43.6117, 3.8767];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {prospectsWithCoords.map((p) => (
        <Marker
          key={p.id}
          position={[p._lat, p._lng]}
          icon={makeIcon(p.priority)}
          eventHandlers={{ click: () => onSelect(p) }}
        >
          <Popup>
            <div style={{ minWidth: 160 }}>
              <strong style={{ fontSize: 13 }}>{p.name}</strong>
              <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{p.sector}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{p.city}</div>
              <div style={{ marginTop: 6, fontSize: 12 }}>
                Score : <strong>{p.score}</strong>
              </div>
              <button
                onClick={() => onSelect(p)}
                style={{
                  marginTop: 8,
                  padding: "4px 10px",
                  background: "#0ea5e9",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Voir la fiche
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
