import { NextRequest, NextResponse } from 'next/server';
import type { WeatherSnapshot } from '@/lib/weather/types';

export const dynamic = 'force-dynamic';

function parseCoord(raw: string | null): number | null {
  if (raw == null || raw === '') return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: NextRequest) {
  const lat = parseCoord(req.nextUrl.searchParams.get('lat'));
  const lng = parseCoord(req.nextUrl.searchParams.get('lng'));
  if (lat == null || lng == null) {
    return NextResponse.json({ error: 'lat och lng krävs' }, { status: 400 });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'ogiltiga koordinater' }, { status: 400 });
  }

  const marineUrl =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}` +
    '&current=sea_surface_temperature';
  const airUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    '&current=temperature_2m,wind_speed_10m';

  try {
    const [marineRes, airRes] = await Promise.all([
      fetch(marineUrl, { cache: 'no-store' }),
      fetch(airUrl, { cache: 'no-store' }),
    ]);

    const marine = marineRes.ok ? ((await marineRes.json()) as Record<string, unknown>) : null;
    const air = airRes.ok ? ((await airRes.json()) as Record<string, unknown>) : null;

    const currentMarine = marine?.current as Record<string, unknown> | undefined;
    const currentAir = air?.current as Record<string, unknown> | undefined;

    const rawSea = currentMarine?.sea_surface_temperature;
    const rawAir = currentAir?.temperature_2m;
    const rawWind = currentAir?.wind_speed_10m;

    const payload: WeatherSnapshot = {
      seaSurfaceTempC:
        typeof rawSea === 'number' && Number.isFinite(rawSea) ? rawSea : null,
      airTempC: typeof rawAir === 'number' && Number.isFinite(rawAir) ? rawAir : null,
      windSpeedMs:
        typeof rawWind === 'number' && Number.isFinite(rawWind) ? rawWind : null,
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: 'väder kunde inte hämtas' }, { status: 502 });
  }
}
