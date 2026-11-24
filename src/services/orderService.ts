import { supabase } from "./supabase";

export type OrderStatus =
  | "Menunggu Konfirmasi"
  | "Diproses"
  | "Dalam Pengiriman"
  | "Selesai"
  | "Dibatalkan";

export interface TruckOrder {
  id: string;
  user_id?: string;
  truck_name: string;
  capacity: string;
  price: number;
  quantity: number;
  total_price: number;
  status: OrderStatus;
  origin_address?: string;
  destination_address?: string;
  notes?: string;
  created_at: string;
}

export type CreateOrderInput = {
  truck_name: string;
  capacity: string;
  price: number;
  quantity: number;
  total_price: number;
  origin_address?: string;
  destination_address?: string;
  notes?: string;
};

// Penyimpanan cadangan lokal untuk lingkungan demo tanpa konfigurasi .env Supabase aktif
const localOrderMemoryStore: TruckOrder[] = [
  {
    id: "demo-order-1",
    truck_name: "Colt Diesel",
    capacity: "± 4 Ton",
    price: 350000,
    quantity: 1,
    total_price: 350000,
    status: "Dalam Pengiriman",
    origin_address: "Gudang Logistik Pusat TrukKita, Malang",
    destination_address: "Jl. Ijen No. 12, Klojen, Malang",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "demo-order-2",
    truck_name: "Pickup",
    capacity: "± 1 Ton",
    price: 200000,
    quantity: 2,
    total_price: 400000,
    status: "Selesai",
    origin_address: "Pusat Distribusi Singosari",
    destination_address: "Ruko Dinoyo Indah Kav. 3, Malang",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

/**
 * Mengambil daftar riwayat pesanan pengguna.
 * Jika Supabase aktif, menggunakan query SELECT dengan Row Level Security (RLS).
 */
export async function fetchOrders(): Promise<TruckOrder[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Gagal mengambil data dari Supabase, beralih ke cache lokal:", error.message);
      return [...localOrderMemoryStore];
    }

    return (data as TruckOrder[]) ?? [];
  }

  // Fallback lokal jika Supabase belum terkonfigurasi di .env
  return [...localOrderMemoryStore];
}

/**
 * Membuat pesanan baru ke Supabase Cloud Database.
 * Menyertakan RLS check otomatis melalui user_id dari sesi aktif.
 */
export async function createOrder(
  input: CreateOrderInput,
  userId?: string
): Promise<TruckOrder> {
  const newOrder: TruckOrder = {
    id: `ord-${Date.now()}`,
    user_id: userId,
    truck_name: input.truck_name,
    capacity: input.capacity,
    price: input.price,
    quantity: input.quantity,
    total_price: input.total_price,
    status: "Menunggu Konfirmasi",
    origin_address:
      input.origin_address ?? "Gudang Logistik Pusat TrukKita, Malang",
    destination_address: input.destination_address ?? "Alamat Pemesan",
    notes: input.notes,
    created_at: new Date().toISOString(),
  };

  if (supabase && userId) {
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          user_id: userId,
          truck_name: input.truck_name,
          capacity: input.capacity,
          price: input.price,
          quantity: input.quantity,
          total_price: input.total_price,
          status: "Menunggu Konfirmasi",
          origin_address: newOrder.origin_address,
          destination_address: newOrder.destination_address,
          notes: newOrder.notes,
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn("Gagal menyimpan ke Supabase, menyimpan ke cache lokal:", error.message);
      localOrderMemoryStore.unshift(newOrder);
      return newOrder;
    }

    return data as TruckOrder;
  }

  localOrderMemoryStore.unshift(newOrder);
  return newOrder;
}

/**
 * Memperbarui status pesanan (misal Pembatalan Pesanan oleh pengguna).
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<boolean> {
  if (supabase) {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.warn("Gagal mengupdate status di Supabase:", error.message);
      // Update lokal jika cloud gagal
      const found = localOrderMemoryStore.find((o) => o.id === orderId);
      if (found) found.status = newStatus;
      return true;
    }

    return true;
  }

  const found = localOrderMemoryStore.find((o) => o.id === orderId);
  if (found) {
    found.status = newStatus;
    return true;
  }
  return false;
}

/**
 * Menghapus pesanan dari riwayat (DELETE).
 */
export async function deleteOrder(orderId: string): Promise<boolean> {
  if (supabase) {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      console.warn("Gagal menghapus pesanan di Supabase:", error.message);
      const index = localOrderMemoryStore.findIndex((o) => o.id === orderId);
      if (index !== -1) localOrderMemoryStore.splice(index, 1);
      return true;
    }

    return true;
  }

  const index = localOrderMemoryStore.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    localOrderMemoryStore.splice(index, 1);
    return true;
  }
  return false;
}
