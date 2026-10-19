import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "./_layout";

export default function DetailScreen() {
  const params = useLocalSearchParams<{
    name?: string | string[];
    capacity?: string | string[];
    price?: string | string[];
  }>();
  const { themeMode } = useAppTheme();
  const isDark = themeMode === "dark";

  const namaTruk = Array.isArray(params.name) ? params.name[0] : params.name;
  const kapasitasParam = Array.isArray(params.capacity) ? params.capacity[0] : params.capacity;
  const hargaParam = Array.isArray(params.price) ? params.price[0] : params.price;
  const detail = useMemo(() => ({
    name: namaTruk || "Pickup",
    capacity: kapasitasParam || "± 1 Ton",
    price: Number(hargaParam) > 0 ? Number(hargaParam) : 200000,
  }), [namaTruk, kapasitasParam, hargaParam]);

  const [jumlahPesanan, setJumlahPesanan] = useState(1);
  useEffect(() => {
    setJumlahPesanan(1);
  }, [detail.name]);

  const totalHarga = detail.price * jumlahPesanan;
  const colors = {
    background: isDark ? "#121212" : "#F5F7FA",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#222222",
    secondary: isDark ? "#BBBBBB" : "#64748B",
    primary: "#C62828",
    border: isDark ? "#383838" : "#E2E8F0",
    soft: isDark ? "#2A2A2A" : "#F1F5F9",
  };
  const formatRupiah = (nominal: number) => `Rp${nominal.toLocaleString("id-ID")}`;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.header, { backgroundColor: isDark ? "#1E293B" : "#1E293B" }]}>
        <Text style={styles.ikon}>🚛</Text>
        <Text style={styles.judul}>{detail.name}</Text>
        <Text style={styles.subjudul}>Detail Pilihan Truk TrukKita</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.secondary }]}>Jenis Truk</Text>
        <Text style={[styles.nilai, { color: colors.text }]}>{detail.name}</Text>

        <Text style={[styles.label, { color: colors.secondary }]}>Kapasitas Muatan</Text>
        <Text style={[styles.nilai, { color: colors.text }]}>{detail.capacity}</Text>

        <Text style={[styles.label, { color: colors.secondary }]}>Harga per Pesanan</Text>
        <Text style={[styles.harga, { color: colors.primary }]}>{formatRupiah(detail.price)}</Text>

        <View style={[styles.garis, { backgroundColor: colors.border }]} />

        <Text style={[styles.label, { color: colors.secondary }]}>Jumlah Pesanan</Text>
        <View style={styles.jumlahContainer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kurangi jumlah pesanan"
            style={[styles.tombolJumlah, { backgroundColor: colors.soft, borderColor: colors.border }]}
            onPress={() => setJumlahPesanan((jumlah) => Math.max(1, jumlah - 1))}
          >
            <Text style={[styles.teksTombolJumlah, { color: colors.text }]}>−</Text>
          </Pressable>
          <Text style={[styles.jumlah, { color: colors.text }]}>{jumlahPesanan}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tambah jumlah pesanan"
            style={[styles.tombolJumlah, { backgroundColor: colors.soft, borderColor: colors.border }]}
            onPress={() => setJumlahPesanan((jumlah) => Math.min(99, jumlah + 1))}
          >
            <Text style={[styles.teksTombolJumlah, { color: colors.text }]}>+</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { color: colors.secondary }]}>Total Harga</Text>
        <Text style={[styles.total, { color: colors.primary }]}>{formatRupiah(totalHarga)}</Text>
        <Text style={[styles.catatan, { color: colors.secondary }]}>Harga ini merupakan estimasi demo per pesanan. Biaya tambahan, jarak, dan ketersediaan truk belum dihitung.</Text>

        <Pressable
          accessibilityRole="button"
          style={styles.tombolPesan}
          onPress={() => router.push({
            pathname: "/riwayat",
            params: {
              name: detail.name,
              capacity: detail.capacity,
              price: String(detail.price),
              quantity: String(jumlahPesanan),
              total: String(totalHarga),
            },
          })}
        >
          <Text style={styles.teksTombolPesan}>Lanjutkan Pesanan</Text>
        </Pressable>

        <Pressable accessibilityRole="button" style={styles.tombolKembali} onPress={() => router.back()}>
          <Text style={[styles.teksKembali, { color: colors.secondary }]}>Kembali</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  header: { padding: 30, alignItems: "center" },
  ikon: { fontSize: 60, marginBottom: 10 },
  judul: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF", textAlign: "center" },
  subjudul: { fontSize: 14, color: "#CBD5E1", marginTop: 8, textAlign: "center" },
  card: { margin: 20, padding: 22, borderRadius: 16, borderWidth: 1 },
  label: { fontSize: 13, marginTop: 14 },
  nilai: { fontSize: 18, fontWeight: "bold", marginTop: 5 },
  harga: { fontSize: 19, fontWeight: "bold", marginTop: 5 },
  garis: { height: 1, marginVertical: 18 },
  jumlahContainer: { flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 8 },
  tombolJumlah: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  teksTombolJumlah: { fontSize: 24, fontWeight: "bold" },
  jumlah: { fontSize: 20, fontWeight: "bold", marginHorizontal: 25 },
  total: { fontSize: 25, fontWeight: "bold", marginTop: 5 },
  catatan: { fontSize: 12, lineHeight: 18, marginTop: 12 },
  tombolPesan: { backgroundColor: "#C62828", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 25 },
  teksTombolPesan: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
  tombolKembali: { padding: 13, alignItems: "center", marginTop: 5 },
  teksKembali: { fontWeight: "bold" },
});

