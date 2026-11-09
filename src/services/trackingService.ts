import type {
  MapCoordinate,
  OsrmRouteResponse,
  TrackingRoute,
} from '@/types/tracking';

/**
 * Lokasi contoh untuk demo TrukKita di area Malang.
 * Keduanya bukan GPS realtime dan boleh diganti dengan koordinat operasional.
 */
export const TRUCK_START: MapCoordinate = {
  latitude: -7.9826,
  longitude: 112.6308,
};

export const CUSTOMER_DESTINATION: MapCoordinate = {
  latitude: -7.9525,
  longitude: 112.6145,
};

/**
 * Rute cadangan agar layar pemantauan tetap dapat didemokan ketika
 * API OSRM tidak dapat diakses. Titik-titik ini hanya simulasi garis rute.
 */
export const FALLBACK_ROUTE: TrackingRoute = {
  coordinates: [
    TRUCK_START,
    { latitude: -7.9770, longitude: 112.6286 },
    { latitude: -7.9710, longitude: 112.6250 },
    { latitude: -7.9655, longitude: 112.6218 },
    { latitude: -7.9600, longitude: 112.6192 },
    { latitude: -7.9560, longitude: 112.6168 },
    CUSTOMER_DESTINATION,
  ],
  distanceKm: 4.2,
  durationMinutes: 15,
  source: 'SIMULASI',
};

const OSRM_ROUTE_URL =
  'https://router.project-osrm.org/route/v1/driving/' +
  `${TRUCK_START.longitude},${TRUCK_START.latitude};` +
  `${CUSTOMER_DESTINATION.longitude},${CUSTOMER_DESTINATION.latitude}` +
  '?overview=full&geometries=geojson';

/**
 * Custom async function untuk mengambil rute dari API eksternal OSRM.
 * OSRM mengembalikan koordinat GeoJSON dengan urutan [longitude, latitude],
 * kemudian fungsi ini mengubahnya ke format { latitude, longitude }.
 */
export async function fetchTrackingRoute(): Promise<TrackingRoute> {
  const response = await fetch(OSRM_ROUTE_URL);

  if (!response.ok) {
    throw new Error(`API rute gagal diakses (HTTP ${response.status}).`);
  }

  const payload = (await response.json()) as OsrmRouteResponse;
  const bestRoute = payload.routes?.[0];

  if (
    payload.code !== 'Ok' ||
    !bestRoute ||
    !bestRoute.geometry?.coordinates ||
    bestRoute.geometry.coordinates.length < 2
  ) {
    throw new Error('API tidak mengembalikan jalur rute yang valid.');
  }

  const coordinates: MapCoordinate[] = bestRoute.geometry.coordinates
    .filter(
      (point) =>
        Array.isArray(point) &&
        typeof point[0] === 'number' &&
        typeof point[1] === 'number',
    )
    .map(([longitude, latitude]) => ({ latitude, longitude }));

  if (coordinates.length < 2) {
    throw new Error('Koordinat rute tidak cukup untuk ditampilkan.');
  }

  return {
    coordinates,
    distanceKm: bestRoute.distance / 1000,
    durationMinutes: bestRoute.duration / 60,
    source: 'OSRM',
  };
}

/**
 * Pembungkus Promise untuk materi Modul 3.
 * resolve dipanggil jika API berhasil, reject jika terjadi kegagalan.
 */
export function fetchTrackingRouteWithPromise(): Promise<TrackingRoute> {
  return new Promise<TrackingRoute>((resolve, reject) => {
    fetchTrackingRoute()
      .then((route) => resolve(route))
      .catch((error: unknown) => reject(error));
  });
}

export function readableTrackingError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('network request failed')) {
      return 'Koneksi internet tidak tersedia. Aplikasi memakai rute simulasi.';
    }
    return error.message;
  }
  return 'Rute tidak dapat diambil. Aplikasi memakai rute simulasi.';
}