/** Koordinat geografis dalam format React Native Maps. */
export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

/** Bentuk ringkas response OSRM Route API yang digunakan aplikasi. */
export interface OsrmRouteResponse {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry?: {
      coordinates: number[][];
    };
  }>;
}

/** Data rute yang sudah dipetakan agar mudah digunakan komponen UI. */
export interface TrackingRoute {
  coordinates: MapCoordinate[];
  distanceKm: number;
  durationMinutes: number;
  source: 'OSRM' | 'SIMULASI';
}