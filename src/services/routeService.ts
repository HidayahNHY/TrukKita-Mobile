// ======================================================
// SERVICE UNTUK MENGAMBIL DATA RUTE DARI API OSRM
// ======================================================

import type { OSRMResponse, OSRMRoute } from "../types/route";

// Fungsi asynchronous untuk mengambil data rute
export const getRoute = async (
  origin: { longitude: number; latitude: number },
  destination: { longitude: number; latitude: number }
): Promise<OSRMRoute> => {
  try {
    // Membuat URL API OSRM
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=false`;

    // Mengirim permintaan ke API
    const response = await fetch(url);

    // Memeriksa respons HTTP
    if (!response.ok) {
      throw new Error("Gagal menghubungi server API");
    }

    // Mengubah respons menjadi JSON
    const data: OSRMResponse = await response.json();

    // Memeriksa status respons API
    if (data.code !== "Ok" || data.routes.length === 0) {
      throw new Error(data.message || "Data rute tidak ditemukan");
    }

    // Mengembalikan data rute pertama
    return data.routes[0];

  } catch (error) {
    console.error("Kesalahan mengambil data rute:", error);
    throw error;
  }
};