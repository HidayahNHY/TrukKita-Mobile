
import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  CUSTOMER_DESTINATION,
  FALLBACK_ROUTE,
  fetchTrackingRoute,
  fetchTrackingRouteWithPromise,
  readableTrackingError,
  TRUCK_START,
} from "@/services/trackingService";

import type { TrackingRoute } from "@/types/tracking";
import { useAppTheme } from "./_layout";

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function PemantauanWebScreen() {
  const params = useLocalSearchParams<{
    name?: string | string[];
    capacity?: string | string[];
    truckName?: string | string[];
  }>();

  const { themeMode } = useAppTheme();
  const isDark = themeMode === "dark";

  const truckName =
    getParam(params.truckName) ||
    getParam(params.name) ||
    "Fuso";

  const truckCapacity =
    getParam(params.capacity) || "± 8 Ton";

  const [route, setRoute] =
    useState<TrackingRoute>(FALLBACK_ROUTE);

  const [loadingRoute, setLoadingRoute] = useState(true);

  const [routeMessage, setRouteMessage] =
    useState<string | null>(null);

  const [progressIndex, setProgressIndex] = useState(0);

  const [isSimulating, setIsSimulating] = useState(false);

  // Warna tampilan berdasarkan tema
  const colors = useMemo(
    () => ({
      background: isDark ? "#121212" : "#F5F7FA",
      surface: isDark ? "#1E1E1E" : "#FFFFFF",
      text: isDark ? "#FFFFFF" : "#1E293B",
      secondary: isDark ? "#BBBBBB" : "#64748B",
      border: isDark ? "#383838" : "#E2E8F0",
      soft: isDark ? "#292929" : "#F1F5F9",
      primary: "#C62828",
      green: isDark ? "#86EFAC" : "#15803D",
    }),
    [isDark]
  );

  // Menghitung progres perjalanan
  const lastIndex = Math.max(
    0,
    route.coordinates.length - 1
  );

  const safeIndex = Math.min(
    progressIndex,
    lastIndex
  );

  const progressPercent =
    lastIndex === 0
      ? 0
      : Math.round((safeIndex / lastIndex) * 100);

  const isDelivered =
    lastIndex > 0 && safeIndex >= lastIndex;

  const stepSize = Math.max(
    1,
    Math.floor(lastIndex / 10)
  );

  // Menentukan status pengiriman
  const statusText = isDelivered
    ? "Barang tiba di lokasi konsumen"
    : progressPercent === 0
      ? "Truk siap diberangkatkan"
      : progressPercent >= 65
        ? "Truk mendekati lokasi konsumen"
        : "Truk dalam perjalanan";

  // Memperbarui data rute
  const applyRoute = (result: TrackingRoute) => {
    setRoute(result);
    setProgressIndex(0);
    setIsSimulating(false);

    setRouteMessage(
      result.source === "OSRM"
        ? null
        : "Rute simulasi sedang digunakan. Jarak dan waktu hanya untuk demonstrasi."
    );
  };

  // Mengambil data API menggunakan async/await
  useEffect(() => {
    let isMounted = true;

    const loadRoute = async () => {
      try {
        setLoadingRoute(true);

        const result = await fetchTrackingRoute();

        if (isMounted) {
          applyRoute(result);
        }
      } catch (error: unknown) {
        if (isMounted) {
          setRoute(FALLBACK_ROUTE);
          setRouteMessage(
            readableTrackingError(error)
          );
        }
      } finally {
        if (isMounted) {
          setLoadingRoute(false);
        }
      }
    };

    void loadRoute();

    return () => {
      isMounted = false;
    };
  }, []);

  // Simulasi pergerakan truk
  useEffect(() => {
    if (!isSimulating || lastIndex < 1) {
      return;
    }

    const interval = setInterval(() => {
      setProgressIndex((current) => {
        const next = Math.min(
          lastIndex,
          current + stepSize
        );

        if (next >= lastIndex) {
          setIsSimulating(false);
        }

        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating, lastIndex, stepSize]);

  // Memuat ulang API menggunakan Promise .then()
  const refreshRoute = () => {
    setLoadingRoute(true);

    fetchTrackingRouteWithPromise()
      .then((result) => {
        applyRoute(result);
      })
      .catch((error: unknown) => {
        setRoute(FALLBACK_ROUTE);
        setProgressIndex(0);
        setIsSimulating(false);

        setRouteMessage(
          readableTrackingError(error)
        );
      })
      .finally(() => {
        setLoadingRoute(false);
      });
  };

  // Menjalankan atau menghentikan simulasi
  const toggleSimulation = () => {
    if (isSimulating) {
      setIsSimulating(false);
      return;
    }

    if (isDelivered) {
      setProgressIndex(0);
    }

    setIsSimulating(true);
  };

  // Menggerakkan posisi truk secara manual
  const nextPosition = () => {
    setIsSimulating(false);

    setProgressIndex((current) =>
      current >= lastIndex
        ? 0
        : Math.min(lastIndex, current + stepSize)
    );
  };

  // Membuka petunjuk arah Google Maps
  const openNavigation = () => {
    const url =
      "https://www.google.com/maps/dir/?api=1" +
      `&origin=${TRUCK_START.latitude},${TRUCK_START.longitude}` +
      `&destination=${CUSTOMER_DESTINATION.latitude},${CUSTOMER_DESTINATION.longitude}` +
      "&travelmode=driving";

    void Linking.openURL(url);
  };

  return (
    <ScrollView
      style={{
        backgroundColor: colors.background,
      }}
      contentContainerStyle={styles.content}
    >
      {/* HEADER */}
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>
          TRUKKITA • LIVE TRACKING DEMO
        </Text>

        <Text style={styles.heroTitle}>
          Pemantauan Pengiriman
        </Text>

        <Text style={styles.heroDescription}>
          Pantau informasi pengiriman, progres perjalanan,
          dan lokasi tujuan konsumen melalui browser.
        </Text>

        <Text style={styles.badge}>
          SIMULASI — bukan GPS realtime
        </Text>
      </View>

      {/* INFORMASI PENGIRIMAN */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={{
            color: colors.secondary,
            fontSize: 11,
          }}
        >
          NOMOR PENGIRIMAN
        </Text>

        <Text
          style={[
            styles.orderId,
            { color: colors.text },
          ]}
        >
          TRK-DEMO-001
        </Text>

        <Text
          style={[
            styles.truckTitle,
            { color: colors.text },
          ]}
        >
          {truckName}
        </Text>

        <Text style={{ color: colors.secondary }}>
          Kapasitas {truckCapacity}
        </Text>

        <Text
          style={[
            styles.status,
            { color: colors.primary },
          ]}
        >
          ● {statusText}
        </Text>

        <View style={styles.progressHeader}>
          <Text style={{ color: colors.secondary }}>
            Progres perjalanan
          </Text>

          <Text
            style={{
              color: colors.text,
              fontWeight: "bold",
            }}
          >
            {progressPercent}%
          </Text>
        </View>

        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* INFORMASI RUTE */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          Informasi Rute Pengiriman
        </Text>

        <Text
          style={{
            color: colors.secondary,
            marginTop: 5,
          }}
        >
          Gudang demo → lokasi konsumen
        </Text>
      </View>

      {/* TITIK PERJALANAN */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={styles.locationIcon}>
          📍
        </Text>

        <Text
          style={[
            styles.locationTitle,
            { color: colors.text },
          ]}
        >
          Titik Awal Gudang
        </Text>

        <Text style={{ color: colors.secondary }}>
          {TRUCK_START.latitude},{" "}
          {TRUCK_START.longitude}
        </Text>

        <View style={styles.routeLine} />

        <Text style={styles.locationIcon}>
          🚚
        </Text>

        <Text
          style={[
            styles.locationTitle,
            { color: colors.text },
          ]}
        >
          Posisi Truk dalam Simulasi
        </Text>

        <Text style={{ color: colors.secondary }}>
          Titik perjalanan {safeIndex + 1} dari{" "}
          {route.coordinates.length}
        </Text>

        <View style={styles.routeLine} />

        <Text style={styles.locationIcon}>
          🏁
        </Text>

        <Text
          style={[
            styles.locationTitle,
            { color: colors.text },
          ]}
        >
          Lokasi Konsumen
        </Text>

        <Text style={{ color: colors.secondary }}>
          {CUSTOMER_DESTINATION.latitude},{" "}
          {CUSTOMER_DESTINATION.longitude}
        </Text>

        <Text
          style={[
            styles.mapNotice,
            { color: colors.secondary },
          ]}
        >
          Peta interaktif tersedia pada aplikasi Android.
          Untuk melihat petunjuk arah melalui browser,
          gunakan tombol Google Maps di bawah.
        </Text>
      </View>

      {/* LOADING API */}
      {loadingRoute && (
        <ActivityIndicator
          style={{ marginTop: 15 }}
          size="large"
          color={colors.primary}
        />
      )}

      {/* PESAN KETERANGAN RUTE */}
      {routeMessage && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.soft },
          ]}
        >
          <Text
            style={{
              color: colors.text,
              fontWeight: "bold",
            }}
          >
            Info Rute
          </Text>

          <Text
            style={{
              color: colors.secondary,
              marginTop: 5,
            }}
          >
            {routeMessage}
          </Text>
        </View>
      )}

      {/* JARAK DAN ESTIMASI WAKTU */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            flexDirection: "row",
          },
        ]}
      >
        <View style={styles.metric}>
          <Text
            style={[
              styles.metricValue,
              { color: colors.text },
            ]}
          >
            {route.distanceKm.toFixed(1)} km
          </Text>

          <Text style={{ color: colors.secondary }}>
            Jarak rute
          </Text>
        </View>

        <View style={styles.metric}>
          <Text
            style={[
              styles.metricValue,
              { color: colors.text },
            ]}
          >
            {Math.max(
              1,
              Math.round(route.durationMinutes)
            )}{" "}
            menit
          </Text>

          <Text style={{ color: colors.secondary }}>
            Estimasi waktu
          </Text>
        </View>

        <View style={styles.metric}>
          <Text
            style={[
              styles.metricValue,
              { color: colors.text },
            ]}
          >
            {route.source === "OSRM"
              ? "API OSRM"
              : "Simulasi"}
          </Text>

          <Text style={{ color: colors.secondary }}>
            Sumber rute
          </Text>
        </View>
      </View>

      {/* KONTROL SIMULASI */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          Kontrol Demo
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={toggleSimulation}
          disabled={loadingRoute || lastIndex < 1}
        >
          <Text style={styles.buttonText}>
            {isSimulating
              ? "Hentikan Simulasi"
              : isDelivered
                ? "Ulangi Simulasi"
                : "Mulai Simulasi Truk"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={nextPosition}
          disabled={loadingRoute || lastIndex < 1}
        >
          <Text
            style={{
              color: colors.text,
              fontWeight: "bold",
            }}
          >
            Posisi Berikutnya
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={refreshRoute}
          disabled={loadingRoute}
        >
          <Text
            style={{
              color: colors.text,
              fontWeight: "bold",
            }}
          >
            {loadingRoute ? "Memuat..." : "Muat Ulang API"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.primaryButton}
          onPress={openNavigation}
        >
          <Text style={styles.buttonText}>
            Buka Petunjuk Arah Google Maps
          </Text>
        </Pressable>
      </View>

      {/* KEMBALI KE BERANDA */}
      <Pressable
        style={[
          styles.secondaryButton,
          { borderColor: colors.border },
        ]}
        onPress={() => router.replace("/")}
      >
        <Text
          style={{
            color: colors.text,
            fontWeight: "bold",
          }}
        >
          ← Kembali ke Beranda
        </Text>
      </Pressable>
    </ScrollView>
  );
}

// STYLE
const styles = StyleSheet.create({
  content: {
    paddingBottom: 35,
  },

  hero: {
    backgroundColor: "#1E293B",
    padding: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  eyebrow: {
    color: "#FCA5A5",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 10,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },

  heroDescription: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },

  badge: {
    color: "#FEE2E2",
    backgroundColor: "#7F1D1D",
    alignSelf: "flex-start",
    padding: 8,
    borderRadius: 15,
    marginTop: 15,
    fontSize: 11,
  },

  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
  },

  orderId: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 5,
  },

  truckTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
  },

  status: {
    marginTop: 15,
    fontWeight: "bold",
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 8,
  },

  progressTrack: {
    height: 9,
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
  },

  section: {
    marginHorizontal: 18,
    marginTop: 25,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
  },

  locationIcon: {
    fontSize: 25,
    marginTop: 8,
  },

  locationTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 6,
  },

  routeLine: {
    width: 2,
    height: 25,
    backgroundColor: "#C62828",
    marginLeft: 11,
    marginTop: 5,
  },

  mapNotice: {
    marginTop: 20,
    fontSize: 12,
    lineHeight: 19,
  },

  metric: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 3,
  },

  metricValue: {
    fontSize: 14,
    fontWeight: "900",
  },

  primaryButton: {
    backgroundColor: "#C62828",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  secondaryButton: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
});
