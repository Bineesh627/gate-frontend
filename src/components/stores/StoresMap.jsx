import React from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { stores as fallbackStores } from "@/lib/gateData";

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
 * @param {Object} props
 * @param {Array<any>} [props.stores]
 */
export default function StoresMap({ stores: propStores } = {}) {
  const displayStores = propStores && propStores.length > 0 ? propStores : fallbackStores;

  return (
    <div className="overflow-hidden rounded-[32px] border border-black/10 shadow-xl">
      <MapContainer
        center={[25.26, 55.33]}
        zoom={9}
        scrollWheelZoom={false}
        style={{ height: "460px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {displayStores.map((s) => (
          <Marker key={s.slug} position={s.coords || [25.26, 55.33]}>
            <Popup>
              <strong>{s.name}</strong>
              <br />
              {s.hours}
              <br />
              <Link to={`/stores/${s.slug}`}>View store page</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
