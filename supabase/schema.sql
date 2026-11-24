-- ==============================================================================
-- TRUKKITA MOBILE - SKEMA BASIS DATA & ROW LEVEL SECURITY (RLS)
-- Modul 4: Database & Autentikasi
-- ==============================================================================

-- 1. Buat Tabel Pesanan Truk (orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    truck_name TEXT NOT NULL,
    capacity TEXT NOT NULL,
    price BIGINT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_price BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Menunggu Konfirmasi' CHECK (
        status IN (
            'Menunggu Konfirmasi',
            'Diproses',
            'Dalam Pengiriman',
            'Selesai',
            'Dibatalkan'
        )
    ),
    origin_address TEXT DEFAULT 'Gudang Logistik Pusat TrukKita, Malang',
    destination_address TEXT DEFAULT 'Alamat Pemesan',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan Keamanan Tingkat Baris (Row Level Security / RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Keamanan (RLS Policies) - Multitenancy Berbasis auth.uid()

-- Kebijakan SELECT: Pengguna hanya dapat membaca data pesanan miliknya sendiri
CREATE POLICY "Pengguna hanya melihat pesanan sendiri"
    ON public.orders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Kebijakan INSERT: Pengguna hanya dapat membuat pesanan atas namanya sendiri
CREATE POLICY "Pengguna hanya membuat pesanan sendiri"
    ON public.orders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Kebijakan UPDATE: Pengguna hanya dapat memperbarui (misal membatalkan) pesanan miliknya
CREATE POLICY "Pengguna hanya memperbarui pesanan sendiri"
    ON public.orders
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Kebijakan DELETE: Pengguna hanya dapat menghapus riwayat pesanan miliknya
CREATE POLICY "Pengguna hanya menghapus pesanan sendiri"
    ON public.orders
    FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Indeks untuk optimasi query berdasarkan user_id dan status
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
