// components/map/CatchMarkerLayer.tsx
import { Marker, Popup, useMapEvents } from 'react-leaflet';
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
        <Marker key={c.id} position={[c.lat!, c.lng!]}>
          <Popup>
            <strong>{c.species}</strong>
            <br />
            {c.weight_kg} kg · {c.length_cm} cm
            {c.location_text && (
              <>
                <br />
                {c.location_text}
              </>
            )}
            <br />
            {new Date(c.caught_at).toLocaleString('sv-SE', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {c.image_url && (
              <>
                <br />
                <img src={c.image_url} alt={c.species} style={{ width: 120, marginTop: 4 }} />
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </>
  );
}
