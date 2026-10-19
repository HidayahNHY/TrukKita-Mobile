import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "./_layout";

export default function RiwayatScreen() {
  const params = useLocalSearchParams<{
    name?: string | string[];
    capacity?: string | string[];
    price?: string | string[];
    quantity?: string | string[];
    total?: string | string[];
  }>();
  const { themeMode } = useAppTheme();
  const isDark = themeMode === "dark";
  const getParam = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const pesanan = useMemo(() => {
    const name = getParam(params.name);
    const capacity = getParam(params.capacity);
    const price = Number(getParam(params.price));
    const quantity = Number(getParam(params.quantity));
    const total = Number(getParam(params.total));
    if (!name || !capacity || price <= 0 || quantity <= 0 || total <= 0)
      return null;
    return { name, capacity, price, quantity, total };
  }, [
    params.name,
    params.capacity,
    params.price,
    params.quantity,
    params.total,
  ]);

  const colors = {
    background: isDark ? "#121212" : "#F5F7FA",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#1E293B",
    secondary: isDark ? "#BBBBBB" : "#64748B",
    border: isDark ? "#383838" : "#E2E8F0",
    soft: isDark ? "#183528" : "#F0FDF4",
  };
  const formatRupiah = (nominal: number) =>
    `Rp${nominal.toLocaleString("id-ID")}`;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.ikon}>📋</Text>
        <Text style={styles.judul}>Ringkasan Pesanan</Text>
        <Text style={styles.subjudul}>Informasi pesanan TrukKita</Text>
      </View>

      {pesanan ? (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[styles.statusContainer, { backgroundColor: colors.soft }]}
          >
            <Text
              style={[styles.status, { color: isDark ? "#86EFAC" : "#15803D" }]}
            >
              ✓ Ringkasan pesanan berhasil dibuat
            </Text>
          </View>
          <Text style={[styles.label, { color: colors.secondary }]}>
            Jenis Truk
          </Text>
          <Text style={[styles.nilai, { color: colors.text }]}>
            {pesanan.name}
          </Text>
          <Text style={[styles.label, { color: colors.secondary }]}>
            Kapasitas
          </Text>
          <Text style={[styles.nilai, { color: colors.text }]}>
            {pesanan.capacity}
          </Text>
          <Text style={[styles.label, { color: colors.secondary }]}>
            Harga per Pesanan
          </Text>
          <Text style={[styles.nilai, { color: colors.text }]}>
            {formatRupiah(pesanan.price)}
          </Text>
          <Text style={[styles.label, { color: colors.secondary }]}>
            Jumlah Pesanan
          </Text>
          <Text style={[styles.nilai, { color: colors.text }]}>
            {pesanan.quantity} pesanan
          </Text>
          <View style={[styles.garis, { backgroundColor: colors.border }]} />
          <Text style={[styles.label, { color: colors.secondary }]}>
            Total Harga
          </Text>
          <Text style={styles.total}>{formatRupiah(pesanan.total)}</Text>
          <Text style={[styles.catatan, { color: colors.secondary }]}>
            Ini adalah ringkasan untuk demonstrasi. Pesanan belum disimpan
            secara permanen, belum ada pembayaran, dan belum ada konfirmasi
            pengiriman.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.tombol}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.teksTombol}>Kembali ke Beranda</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={styles.tombolKembali}
            onPress={() => router.back()}
          >
            <Text style={[styles.teksKembali, { color: colors.secondary }]}>
              Kembali ke Detail
            </Text>
          </Pressable>
        </View>
      ) : (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.kosongJudul, { color: colors.text }]}>
            Belum ada ringkasan pesanan
          </Text>
          <Text style={[styles.catatan, { color: colors.secondary }]}>
            Pilih jenis truk dari halaman beranda, lalu lanjutkan ke detail
            untuk membuat ringkasan pesanan.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.tombol}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.teksTombol}>Pilih Truk</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  header: { backgroundColor: "#1E293B", padding: 30, alignItems: "center" },
  ikon: { fontSize: 52, marginBottom: 10 },
  judul: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subjudul: { fontSize: 14, color: "#CBD5E1", marginTop: 8 },
  card: { margin: 20, padding: 22, borderRadius: 16, borderWidth: 1 },
  statusContainer: { padding: 12, borderRadius: 10, marginBottom: 6 },
  status: { fontSize: 14, fontWeight: "bold" },
  label: { fontSize: 13, marginTop: 14 },
  nilai: { fontSize: 17, fontWeight: "bold", marginTop: 5 },
  garis: { height: 1, marginVertical: 18 },
  total: { fontSize: 25, fontWeight: "bold", color: "#C62828", marginTop: 5 },
  catatan: { fontSize: 12, lineHeight: 19, marginTop: 18 },
  kosongJudul: { fontSize: 18, fontWeight: "bold" },
  tombol: {
    backgroundColor: "#C62828",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
  },
  teksTombol: { color: "#FFFFFF", fontWeight: "bold", fontSize: 15 },
  tombolKembali: { padding: 13, alignItems: "center", marginTop: 5 },
  teksKembali: { fontWeight: "bold" },
});
