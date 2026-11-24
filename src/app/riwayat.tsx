/* eslint-disable react-hooks/set-state-in-effect */
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAppTheme } from "./_layout";
import { useAuth } from "../contexts/AuthContext";
import {
  deleteOrder,
  fetchOrders,
  type OrderStatus,
  type TruckOrder,
  updateOrderStatus,
} from "../services/orderService";

type FilterTab = "Semua" | "Aktif" | "Selesai" | "Dibatalkan";

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
  const auth = useAuth();

  const [orders, setOrders] = useState<TruckOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("Semua");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const colors = {
    background: isDark ? "#121212" : "#F5F7FA",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#1E293B",
    secondary: isDark ? "#BBBBBB" : "#64748B",
    border: isDark ? "#383838" : "#E2E8F0",
    soft: isDark ? "#1E293B" : "#F1F5F9",
    primary: "#C62828",
    cardBg: isDark ? "#18181B" : "#FFFFFF",
  };

  const formatRupiah = (nominal: number) =>
    `Rp${nominal.toLocaleString("id-ID")}`;

  const loadData = useCallback(async (showIndicator = true) => {
    if (showIndicator) setIsLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error("Gagal memuat pesanan:", error);
    } finally {
      if (showIndicator) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    setActionMessage(null);
    void loadData(false);
  };

  // Optimistic UI: Pembatalan Pesanan (UPDATE)
  const handleCancelOrder = async (order: TruckOrder) => {
    Alert.alert(
      "Batalkan Pesanan",
      `Apakah Anda yakin ingin membatalkan pesanan ${order.truck_name}?`,
      [
        { text: "Tidak", style: "cancel" },
        {
          text: "Ya, Batalkan",
          style: "destructive",
          onPress: async () => {
            const previousOrders = [...orders];
            // Optimistic update
            setOrders((prev) =>
              prev.map((o) =>
                o.id === order.id ? { ...o, status: "Dibatalkan" as OrderStatus } : o
              )
            );
            setActionMessage(`Pesanan ${order.truck_name} telah dibatalkan.`);

            const success = await updateOrderStatus(order.id, "Dibatalkan");
            if (!success) {
              // Rollback if failed
              setOrders(previousOrders);
              Alert.alert("Gagal", "Gagal memperbarui status di cloud database.");
            }
          },
        },
      ]
    );
  };

  // Optimistic UI: Penghapusan Pesanan (DELETE)
  const handleDeleteOrder = async (orderId: string) => {
    Alert.alert(
      "Hapus Riwayat",
      "Hapus pesanan ini secara permanen dari basis data cloud?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            const previousOrders = [...orders];
            // Optimistic update
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
            setActionMessage("Pesanan berhasil dihapus dari riwayat.");

            const success = await deleteOrder(orderId);
            if (!success) {
              // Rollback if failed
              setOrders(previousOrders);
              Alert.alert("Gagal", "Gagal menghapus pesanan dari cloud database.");
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Selesai":
        return { bg: isDark ? "#14532D" : "#DCFCE7", text: "#16A34A" };
      case "Dalam Pengiriman":
        return { bg: isDark ? "#1E3A8A" : "#DBEAFE", text: "#2563EB" };
      case "Diproses":
        return { bg: isDark ? "#78350F" : "#FEF3C7", text: "#D97706" };
      case "Dibatalkan":
        return { bg: isDark ? "#7F1D1D" : "#FEE2E2", text: "#DC2626" };
      default:
        return { bg: isDark ? "#374151" : "#F3F4F6", text: "#6B7280" };
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "Aktif") {
      return (
        order.status === "Menunggu Konfirmasi" ||
        order.status === "Diproses" ||
        order.status === "Dalam Pengiriman"
      );
    }
    if (filter === "Selesai") return order.status === "Selesai";
    if (filter === "Dibatalkan") return order.status === "Dibatalkan";
    return true;
  });

  const hasNewOrderParam = Boolean(params.name);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={["#C62828"]}
          tintColor="#C62828"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.ikon}>📋</Text>
        <Text style={styles.judul}>Riwayat Pesanan Cloud</Text>
        <Text style={styles.subjudul}>
          Terintegrasi Supabase Database & Row Level Security (RLS)
        </Text>
      </View>

      {/* Identitas Akun Terautentikasi */}
      <View
        style={[
          styles.accountBar,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.accountInfo}>
          <Text style={[styles.accountLabel, { color: colors.secondary }]}>
            Pengguna Terautentikasi:
          </Text>
          <Text style={[styles.accountEmail, { color: colors.text }]}>
            👤 {auth.user?.email ?? "Pengguna Demo (Lokal)"}
          </Text>
        </View>
        <Text style={styles.rlsBadge}>RLS Aktif 🔒</Text>
      </View>

      {hasNewOrderParam && (
        <View style={styles.bannerBar}>
          <Text style={styles.bannerText}>
            ✓ Pesanan baru berhasil disinkronkan ke Cloud PostgreSQL!
          </Text>
        </View>
      )}

      {actionMessage && (
        <View style={styles.actionBanner}>
          <Text style={styles.actionText}>{actionMessage}</Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {(["Semua", "Aktif", "Selesai", "Dibatalkan"] as FilterTab[]).map(
          (tab) => {
            const active = filter === tab;
            return (
              <Pressable
                key={tab}
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: active
                      ? colors.primary
                      : isDark
                      ? "#27272A"
                      : "#E2E8F0",
                  },
                ]}
                onPress={() => setFilter(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: active
                        ? "#FFFFFF"
                        : isDark
                        ? "#CBD5E1"
                        : "#475569",
                      fontWeight: active ? "bold" : "normal",
                    },
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          }
        )}
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.secondary }]}>
            Memuat pesanan dari Supabase...
          </Text>
        </View>
      ) : filteredOrders.length > 0 ? (
        filteredOrders.map((order) => {
          const badge = getStatusBadge(order.status);
          const canCancel =
            order.status === "Menunggu Konfirmasi" ||
            order.status === "Diproses";

          return (
            <View
              key={order.id}
              style={[
                styles.orderCard,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.orderCardHeader}>
                <View>
                  <Text style={[styles.orderTruckName, { color: colors.text }]}>
                    🚛 {order.truck_name}
                  </Text>
                  <Text
                    style={[styles.orderDate, { color: colors.secondary }]}
                  >
                    {new Date(order.created_at).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </Text>
                </View>
                <View
                  style={[styles.statusPill, { backgroundColor: badge.bg }]}
                >
                  <Text style={[styles.statusPillText, { color: badge.text }]}>
                    {order.status}
                  </Text>
                </View>
              </View>

              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />

              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: colors.secondary }]}
                >
                  Kapasitas:
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {order.capacity}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: colors.secondary }]}
                >
                  Jumlah Armada:
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {order.quantity} unit
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: colors.secondary }]}
                >
                  Total Biaya:
                </Text>
                <Text style={[styles.detailPrice, { color: colors.primary }]}>
                  {formatRupiah(order.total_price)}
                </Text>
              </View>

              {order.origin_address && (
                <Text
                  style={[styles.addressText, { color: colors.secondary }]}
                >
                  📍 {order.origin_address} ➔ {order.destination_address}
                </Text>
              )}

              <View style={styles.actionRow}>
                {canCancel && (
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => void handleCancelOrder(order)}
                  >
                    <Text style={styles.cancelButtonText}>Batalkan</Text>
                  </Pressable>
                )}
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => void handleDeleteOrder(order.id)}
                >
                  <Text style={styles.deleteButtonText}>Hapus</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      ) : (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Belum ada pesanan {filter !== "Semua" ? `dengan status ${filter}` : ""}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.secondary }]}>
            Silakan pilih armada truk di halaman utama untuk membuat pesanan
            baru yang tersimpan di cloud.
          </Text>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.actionBtnText}>Pesan Truk Sekarang</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.bottomNavRow}>
        <Pressable
          style={[styles.navBtn, { borderColor: colors.border }]}
          onPress={() => router.replace("/")}
        >
          <Text style={[styles.navBtnText, { color: colors.text }]}>
            ⬅️ Kembali ke Beranda
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32 },
  header: { backgroundColor: "#1E293B", padding: 24, alignItems: "center" },
  ikon: { fontSize: 44, marginBottom: 8 },
  judul: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subjudul: {
    fontSize: 12,
    color: "#CBD5E1",
    marginTop: 6,
    textAlign: "center",
  },
  accountBar: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accountInfo: { flex: 1 },
  accountLabel: { fontSize: 11 },
  accountEmail: { fontSize: 13, fontWeight: "bold", marginTop: 2 },
  rlsBadge: {
    backgroundColor: "#166534",
    color: "#BBF7D0",
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  bannerBar: {
    backgroundColor: "#15803D",
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  bannerText: { color: "#FFFFFF", fontSize: 12, fontWeight: "bold" },
  actionBanner: {
    backgroundColor: "#1E3A8A",
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  actionText: { color: "#DBEAFE", fontSize: 12 },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  tabText: { fontSize: 12 },
  centerContainer: { padding: 40, alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 13 },
  orderCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderTruckName: { fontSize: 16, fontWeight: "bold" },
  orderDate: { fontSize: 11, marginTop: 4 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusPillText: { fontSize: 11, fontWeight: "bold" },
  divider: { height: 1, marginVertical: 12 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: "600" },
  detailPrice: { fontSize: 15, fontWeight: "bold" },
  addressText: { fontSize: 11, marginTop: 8, lineHeight: 16 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  cancelButtonText: { color: "#DC2626", fontSize: 12, fontWeight: "bold" },
  deleteButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: "#7F1D1D",
  },
  deleteButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "bold" },
  emptyCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  bottomNavRow: { marginHorizontal: 16, marginTop: 18 },
  navBtn: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  navBtnText: { fontWeight: "bold", fontSize: 13 },
});
