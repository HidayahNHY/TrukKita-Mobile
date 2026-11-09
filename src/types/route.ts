// ======================================================
// INTERFACE DATA RESPONS API RUTE TRUK
// ======================================================

// Struktur satu data rute dari API OSRM
export interface OSRMRoute {
  distance: number;
  duration: number;
}

// Struktur respons keseluruhan dari API OSRM
export interface OSRMResponse {
  code: string;
  message?: string;
  routes: OSRMRoute[];
}