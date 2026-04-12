'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CatchMarkerLayer from './CatchMarkerLayer';
import { mapTokens } from '@/lib/mapTokens';
import type { Catch } from '@/types/catch';

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 1.2 });
  }, [map, lat, lng]);
  return null;
}

/** Leaflet behöver invalidateSize när containern får slutlig höjd (flex/layout). */
function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const t = window.setTimeout(() => map.invalidateSize(), 200);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(t);
    };
  }, [map]);
  return null;
}

interface Props {
  catches: Catch[];
  onMapClick: (lat: number, lng: number) => void;
  focusLat?: number;
  focusLng?: number;
}

export default function CatchMap({ catches, onMapClick, focusLat, focusLng }: Props) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        // Permission denied — ingen användarmarkör
      },
    );
  }, []);

  return (
    <MapContainer
      className="skitfiske-map"
      center={[62.0, 15.0]}
      zoom={5}
      style={{ height: '100%', width: '100%', background: '#d4dadc' }}
      zoomControl
    >
      <MapResizeFix />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CatchMarkerLayer catches={catches} onMapClick={onMapClick} />
      {userPos && (
        <>
          <CircleMarker
            center={userPos}
            radius={14}
            pathOptions={{
              color: mapTokens.accentLight,
              fillColor: mapTokens.userRing,
              fillOpacity: 0.2,
              weight: 1,
            }}
          />
          <CircleMarker
            center={userPos}
            radius={6}
            pathOptions={{
              color: mapTokens.accent,
              fillColor: mapTokens.accent,
              fillOpacity: 0.9,
              weight: 2,
            }}
          />
        </>
      )}
      {focusLat !== undefined && focusLng !== undefined && (
        <FlyTo lat={focusLat} lng={focusLng} />
      )}
    </MapContainer>
  );
}
