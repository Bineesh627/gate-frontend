import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapPin, Navigation } from "lucide-react";

// Fix default icon paths for Leaflet with bundlers
if (L.Icon.Default.prototype && '_getIconUrl' in L.Icon.Default.prototype) {
  delete L.Icon.Default.prototype._getIconUrl;
}
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/**
 * StoreMapPicker
 * A map component using Leaflet + OpenStreetMap to let admin pick
 * a store's geographic location by clicking on the map or dragging the marker.
 *
 * Props:
 *  lat    - initial latitude (number/string)
 *  lng    - initial longitude (number/string)
 *  onChange(lat, lng) - called when position changes
 */
export default function StoreMapPicker({ lat, lng, onChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const currentLat = parseFloat(lat) || 25.1121;
  const currentLng = parseFloat(lng) || 55.1965;

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([currentLat, currentLng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([currentLat, currentLng], { draggable: true }).addTo(map);

    marker.on("dragend", (e) => {
      const { lat: newLat, lng: newLng } = e.target.getLatLng();
      onChange(newLat.toFixed(6), newLng.toFixed(6));
    });

    map.on("click", (e) => {
      const { lat: newLat, lng: newLng } = e.latlng;
      marker.setLatLng([newLat, newLng]);
      onChange(newLat.toFixed(6), newLng.toFixed(6));
    });

    // Invalidate map size after render to avoid grey tiles
    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current && map.getContainer()) {
        try {
          map.invalidateSize();
        } catch {}
      }
    }, 250);

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };

  }, []);

  // Sync marker if lat/lng props change from outside
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current && mapInstanceRef.current.getContainer()) {
      const newPos = [parseFloat(lat) || 25.1121, parseFloat(lng) || 55.1965];
      try {
        markerRef.current.setLatLng(newPos);
        mapInstanceRef.current.setView(newPos, mapInstanceRef.current.getZoom());
      } catch {}
    }
  }, [lat, lng]);

  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat: newLat, lon: newLng } = data[0];
        const parsedLat = parseFloat(newLat).toFixed(6);
        const parsedLng = parseFloat(newLng).toFixed(6);
        onChange(parsedLat, parsedLng);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([parseFloat(parsedLat), parseFloat(parsedLng)], 15);
        }
      } else {
        setSearchError("Location not found. Try a more specific search.");
      }
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <label htmlFor="store-map-search" className="sr-only">
            Search location on map
          </label>
          <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            id="store-map-search"
            name="mapSearch"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleSearch(e);
              }
            }}
            placeholder="Search address or place name (e.g. Al Barsha Dubai)..."
            aria-label="Search address or place name on map"
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#007BB5] bg-white"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-2 bg-[#007BB5] text-white text-xs font-bold rounded-xl hover:bg-[#006899] disabled:opacity-50 transition-colors"
        >
          {searching ? "Searching..." : "Find on Map"}
        </button>
      </div>

      {searchError && (
        <p className="text-xs text-red-500 font-medium">{searchError}</p>
      )}

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="w-full rounded-2xl border border-slate-200 overflow-hidden shadow-inner relative z-0"
        style={{ height: "320px", minHeight: "320px" }}
      />

      {/* Coordinates display */}
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
        <MapPin className="h-3.5 w-3.5 text-[#E65100] flex-shrink-0" />
        <span className="font-medium">Selected Coordinates:</span>
        <span className="font-bold text-slate-800 font-mono">
          {parseFloat(lat || 25.1121).toFixed(6)}, {parseFloat(lng || 55.1965).toFixed(6)}
        </span>
        <span className="ml-auto text-slate-400 italic text-[11px] hidden sm:inline">
          Click anywhere on map or drag marker to reposition
        </span>
      </div>
    </div>
  );
}
