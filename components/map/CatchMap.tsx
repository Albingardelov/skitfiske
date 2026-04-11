'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CatchMarkerLayer from './CatchMarkerLayer';
import type { Catch } from '@/types/catch';

// Fix Leaflet default icon broken by webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  catches: Catch[];
  onMapClick: (lat: number, lng: number) => void;
}

export default function CatchMap({ catches, onMapClick }: Props) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserPos([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  return (
    <MapContainer
      center={[62.0, 15.0]}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <CatchMarkerLayer catches={catches} onMapClick={onMapClick} />
      {userPos && (
        <CircleMarker
          center={userPos}
          radius={8}
          pathOptions={{ color: '#1976d2', fillColor: '#1976d2', fillOpacity: 0.8 }}
        />
      )}
    </MapContainer>
  );
}
