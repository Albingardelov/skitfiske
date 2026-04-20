// components/map/CatchMarkerLayer.tsx
import { CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import { mapTokens } from '@/lib/mapTokens';
import type { Catch } from '@/types/catch';

interface Props {
  catches: Catch[];
  onMapClick: (lat: number, lng: number) => void;
}

export default function CatchMarkerLayer({ catches, onMapClick }: Props) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  const withCoords = catches.filter((c) => c.lat !== null && c.lng !== null);

  return (
    <>
      {withCoords.map((c) => (
        <CircleMarker
          key={c.id}
          center={[c.lat!, c.lng!]}
          radius={9}
          pathOptions={{
            color: mapTokens.accent,
            fillColor: mapTokens.dotFill,
            fillOpacity: 1,
            weight: 2,
          }}
        >
          <Popup>
            <p className="skitfiske-popup-title">{c.species}</p>
            <p className="skitfiske-popup-meta">
              {c.weight_kg * 1000} g · {c.length_cm} cm
            </p>
            {c.location_text && (
              <p className="skitfiske-popup-caption">{c.location_text}</p>
            )}
            <p className="skitfiske-popup-caption">
              {new Date(c.caught_at).toLocaleString('sv-SE', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {c.image_url && (
              // eslint-disable-next-line @next/next/no-img-element -- Leaflet-popup, extern URL
              <img
                className="skitfiske-popup-img"
                src={c.image_url}
                alt={c.species}
              />
            )}
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
