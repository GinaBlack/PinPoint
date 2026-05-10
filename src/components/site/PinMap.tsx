import { useEffect, useRef, useState } from "react";

type Props = {
  value: { lat: number; lng: number };
  onChange?: (v: { lat: number; lng: number }) => void;
  markers?: Array<{ id: string; lat: number; lng: number; label?: string }>;
  height?: number | string;
  interactive?: boolean;
  zoom?: number;
};

/**
 * SSR-safe Leaflet map. Dynamically imports leaflet on mount.
 * - Click anywhere to move the pin (when interactive)
 * - Drag the pin to fine-tune
 */
export function PinMap({
  value,
  onChange,
  markers,
  height = 360,
  interactive = true,
  zoom = 16,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const extraLayerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // init
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      // ensure leaflet css
      if (typeof document !== "undefined" && !document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        touchZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
      }).setView([value.lat, value.lng], zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;transform:translate(-50%,-100%);">
            <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,oklch(0.48 0.13 160),oklch(0.66 0.16 158));display:grid;place-items:center;box-shadow:0 8px 20px -6px oklch(0.48 0.13 160 / 0.6);border:3px solid white;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="oklch(0.48 0.13 160)"/></svg>
            </div>
            <div style="width:2px;height:8px;background:oklch(0.48 0.13 160);margin:0 auto;"></div>
          </div>`,
        iconSize: [34, 42],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([value.lat, value.lng], {
        draggable: interactive,
        icon: pinIcon,
      }).addTo(map);

      if (interactive) {
        marker.on("dragend", () => {
          const p = marker.getLatLng();
          onChangeRef.current?.({ lat: p.lat, lng: p.lng });
        });
        map.on("click", (e: any) => {
          marker.setLatLng(e.latlng);
          onChangeRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }

      mapRef.current = map;
      markerRef.current = marker;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync external value
  useEffect(() => {
    if (!ready || !markerRef.current || !mapRef.current) return;
    markerRef.current.setLatLng([value.lat, value.lng]);
  }, [value.lat, value.lng, ready]);

  // extra markers
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    (async () => {
      const L = (await import("leaflet")).default;
      if (extraLayerRef.current) {
        extraLayerRef.current.clearLayers();
      } else {
        extraLayerRef.current = L.layerGroup().addTo(mapRef.current);
      }
      (markers ?? []).forEach((m) => {
        L.circleMarker([m.lat, m.lng], {
          radius: 6,
          color: "oklch(0.78 0.14 75)",
          fillColor: "oklch(0.78 0.14 75)",
          fillOpacity: 0.9,
          weight: 2,
        })
          .bindTooltip(m.label ?? "")
          .addTo(extraLayerRef.current);
      });
    })();
  }, [markers, ready]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border border-border bg-muted relative z-0"
      style={{ height }}
      aria-label="Map"
    />
  );
}

export function useMyLocation(fallback = { lat: 4.0511, lng: 9.7679 }) {
  const [pos, setPos] = useState(fallback);
  const [requested, setRequested] = useState(false);

  const request = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setRequested(true);
    navigator.geolocation.getCurrentPosition(
      (g) => setPos({ lat: g.coords.latitude, lng: g.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return { pos, setPos, request, requested };
}