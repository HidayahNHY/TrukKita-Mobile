import {
    CUSTOMER_DESTINATION,
    FALLBACK_ROUTE,
    fetchTrackingRoute,
    fetchTrackingRouteWithPromise,
    readableTrackingError,
    TRUCK_START,
} from "@/services/trackingService";
import type { MapCoordinate, TrackingRoute } from "@/types/tracking";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import MapView, { Marker, Polyline, type Region } from "react-native-maps";
import { useAppTheme } from "./_layout";

const INITIAL_REGION: Region = {
  latitude: -7.9675,
  longitude: 112.6227,
  latitudeDelta: 0.065,
  longitudeDelta: 0.065,
};

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function PemantauanScreen() {
  const params = useLocalSearchParams<{
    name?: string | string[];
    capacity?: string | string[];
  }>();
  const { themeMode } = useAppTheme();
  const isDark = themeMode === "dark";

  const truckName = getParam(params.name) || "Fuso";
  const truckCapacity = getParam(params.capacity) || "± 8 Ton";

  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [route, setRoute] = useState<TrackingRoute>(FALLBACK_ROUTE);
  const [loadingRoute, setLoadingRoute] = useState(true);
  const [routeMessage, setRouteMessage] = useState<string | null>(null);
  const [progressIndex, setProgressIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const routeCoordinates = route.coordinates;
  const lastIndex = Math.max(0, routeCoordinates.length - 1);
  const safeIndex = Math.min(progressIndex, lastIndex);
  const truckPosition: MapCoordinate =
    routeCoordinates[safeIndex] ?? TRUCK_START;
  const progressPercent =
    lastIndex === 0 ? 0 : Math.round((safeIndex / lastIndex) * 100);
  const isDelivered = lastIndex > 0 && safeIndex >= lastIndex;
  const stepSize = Math.max(1, Math.floor(lastIndex / 10));

  const colors = useMemo(
    () => ({
      background: isDark ? "#121212" : "#F5F7FA",
      surface: isDark ? "#1E1E1E" : "#FFFFFF",
      text: isDark ? "#FFFFFF" : "#1E293B",
      secondary: isDark ? "#BBBBBB" : "#64748B",
      border: isDark ? "#383838" : "#E2E8F0",
      soft: isDark ? "#292929" : "#F1F5F9",
      primary: "#C62828",
      blue: isDark ? "#93C5FD" : "#1D4ED8",
      green: isDark ? "#86EFAC" : "#15803D",
    }),
    [isDark],
  );

  const applyRoute = useCallback((result: TrackingRoute) => {
    setRoute(result);
    setProgressIndex(0);
    setIsSimulating(false);
    setRouteMessage(
      result.source === "OSRM"
        ? null
        : "Rute simulasi sedang digunakan. Jarak dan waktu di bawah hanya untuk demonstrasi.",
    );
  }, []);

  /** Penerapan async/await untuk mengambil rute ketika halaman dibuka. */
  useEffect(() => {
    let isMounted = true;

    const loadInitialRoute = async () => {
      try {
        setLoadingRoute(true);
        const result = await fetchTrackingRoute();
        if (isMounted) applyRoute(result);
      } catch (error: unknown) {
        if (isMounted) {
          setRoute(FALLBACK_ROUTE);
          setRouteMessage(readableTrackingError(error));
        }
      } finally {
        if (isMounted) setLoadingRoute(false);
      }
    };

    void loadInitialRoute();
    return () => {
      isMounted = false;
    };
  }, [applyRoute]);

  /** Sesuaikan area peta agar titik asal, jalur, dan konsumen terlihat. */
  useEffect(() => {
    if (mapReady && routeCoordinates.length > 1) {
      mapRef.current?.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 45, right: 42, bottom: 45, left: 42 },
        animated: true,
      });
    }
  }, [mapReady, routeCoordinates]);

  /** Gerakkan marker setiap 1,2 detik saat pengguna memulai simulasi. */
  useEffect(() => {
    if (!isSimulating || lastIndex < 1) return;

    const interval = setInterval(() => {
      setProgressIndex((current) => Math.min(lastIndex, current + stepSize));
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating, lastIndex, stepSize]);

  useEffect(() => {
    if (isDelivered) setIsSimulating(false);
  }, [isDelivered]);

  /** Penerapan .then() dan .catch() untuk memuat ulang rute. */
  const refreshRoute = () => {
    setLoadingRoute(true);
    fetchTrackingRouteWithPromise()
      .then((result) => applyRoute(result))
      .catch((error: unknown) => {
        setRoute(FALLBACK_ROUTE);
        setProgressIndex(0);
        setIsSimulating(false);
        setRouteMessage(readableTrackingError(error));
      })
      .finally(() => setLoadingRoute(false));
  };

  const advanceTruck = () => {
    setIsSimulating(false);
    setProgressIndex((current) => {
      if (current >= lastIndex) return 0;
      return Math.min(lastIndex, current + stepSize);
    });
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      setIsSimulating(false);
      return;
    }
    if (isDelivered) setProgressIndex(0);
    setIsSimulating(true);
  };

  const openNavigation = () => {
    const url =
      "https://www.google.com/maps/dir/?api=1" +
      `&origin=${TRUCK_START.latitude},${TRUCK_START.longitude}` +
      `&destination=${CUSTOMER_DESTINATION.latitude},${CUSTOMER_DESTINATION.longitude}` +
      "&travelmode=driving";

    void Linking.openURL(url).catch(() => {
      setRouteMessage("Tidak dapat membuka aplikasi peta dari perangkat ini.");
    });
  };

  const statusText = isDelivered
    ? "Barang tiba di lokasi konsumen"
    : progressPercent === 0
      ? "Truk siap diberangkatkan"
      : progressPercent >= 65
        ? "Truk mendekati lokasi konsumen"
        : "Truk dalam perjalanan";

  const statusColor = isDelivered ? colors.green : colors.primary;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>TRUKKITA • LIVE TRACKING DEMO</Text>
        <Text style={styles.heroTitle}>Pemantauan Pengiriman</Text>
        <Text style={styles.heroDescription}>
          Pantau posisi truk, jalur perjalanan, dan titik tujuan konsumen dalam
          satu peta.
        </Text>
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>
            SIMULASI — bukan GPS realtime
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.summaryCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.summaryTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.secondary }]}>
              NOMOR PENGIRIMAN
            </Text>
            <Text style={[styles.orderId, { color: colors.text }]}>
              TRK-DEMO-001
            </Text>
          </View>
          <View style={styles.truckIconBox}>
            <Text style={styles.truckIcon}>🚚</Text>
          </View>
        </View>

        <Text style={[styles.truckTitle, { color: colors.text }]}>
          {truckName}
        </Text>
        <Text style={[styles.truckCapacity, { color: colors.secondary }]}>
          Kapasitas {truckCapacity}
        </Text>

        <View
          style={[
            styles.statusPill,
            { backgroundColor: isDark ? "#332424" : "#FCE8E8" },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>

        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.secondary }]}>
            Progres perjalanan
          </Text>
          <Text style={[styles.progressValue, { color: colors.text }]}>
            {progressPercent}%
          </Text>
        </View>
        <View
          style={[styles.progressTrack, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: isDelivered ? "#15803D" : colors.primary,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.mapHeadingRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Peta Rute Pengiriman
          </Text>
          <Text
            style={[styles.sectionDescription, { color: colors.secondary }]}
          >
            Gudang demo → lokasi konsumen
          </Text>
        </View>
        {loadingRoute ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : null}
      </View>

      <View style={[styles.mapFrame, { borderColor: colors.border }]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          onMapReady={() => setMapReady(true)}
          mapType="standard"
          showsCompass
          showsScale
        >
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#C62828"
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />

          <Marker
            coordinate={TRUCK_START}
            title="Gudang TrukKita (titik demo)"
            description="Titik awal pengiriman simulasi"
            pinColor="#2563EB"
          />

          <Marker
            coordinate={CUSTOMER_DESTINATION}
            title="Lokasi Konsumen (titik demo)"
            description="Tujuan pengantaran barang"
            pinColor="#16A34A"
          />

          <Marker
            coordinate={truckPosition}
            title={`Truk ${truckName}`}
            description="Posisi truk dalam simulasi demo"
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={5}
          >
            <View style={styles.truckMarker}>
              <Text style={styles.truckMarkerText}>🚚</Text>
            </View>
          </Marker>
        </MapView>
      </View>

      <View style={styles.legendRow}>
        <Legend
          color="#2563EB"
          text="Gudang / titik awal"
          textColor={colors.secondary}
        />
        <Legend
          color="#16A34A"
          text="Konsumen / tujuan"
          textColor={colors.secondary}
        />
        <Legend
          color="#C62828"
          text="Jalur pengiriman"
          textColor={colors.secondary}
        />
      </View>

      {routeMessage ? (
        <View
          style={[
            styles.notice,
            {
              backgroundColor: isDark ? "#332B1B" : "#FFF7E6",
              borderColor: isDark ? "#6B5428" : "#F5D58A",
            },
          ]}
        >
          <Text style={[styles.noticeTitle, { color: colors.text }]}>
            Info rute
          </Text>
          <Text style={[styles.noticeText, { color: colors.secondary }]}>
            {routeMessage}
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.metricsCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Metric
          label="Jarak rute"
          value={`${route.distanceKm.toFixed(1)} km`}
          textColor={colors.text}
        />
        <View
          style={[styles.metricDivider, { backgroundColor: colors.border }]}
        />
        <Metric
          label="Estimasi perjalanan"
          value={`${Math.max(1, Math.round(route.durationMinutes))} menit`}
          textColor={colors.text}
        />
        <View
          style={[styles.metricDivider, { backgroundColor: colors.border }]}
        />
        <Metric
          label="Sumber rute"
          value={route.source === "OSRM" ? "API OSRM" : "Simulasi"}
          textColor={colors.text}
        />
      </View>

      <View style={styles.controlSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Kontrol Demo
        </Text>
        <Text style={[styles.sectionDescription, { color: colors.secondary }]}>
          Jalankan gerakan otomatis atau pindahkan posisi truk satu tahap untuk
          menjelaskan alurnya.
        </Text>

        <Pressable
          accessibilityRole="button"
          style={styles.primaryButton}
          onPress={toggleSimulation}
        >
          <Text style={styles.primaryButtonText}>
            {isSimulating
              ? "Ⅱ  Hentikan Simulasi"
              : isDelivered
                ? "▶  Ulangi Simulasi"
                : "▶  Mulai Simulasi Truk"}
          </Text>
        </Pressable>

        <View style={styles.secondaryButtonRow}>
          <Pressable
            accessibilityRole="button"
            style={[
              styles.secondaryButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={advanceTruck}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              {isDelivered ? "↺  Reset Posisi" : "➜  Posisi Berikutnya"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={[
              styles.secondaryButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={refreshRoute}
            disabled={loadingRoute}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              {loadingRoute ? "Memuat..." : "↻  Muat Ulang API"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          style={styles.navigationButton}
          onPress={openNavigation}
        >
          <Text style={styles.navigationButtonText}>
            Buka Petunjuk Arah di Google Maps ↗
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.noteCard,
          { backgroundColor: colors.soft, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.noteTitle, { color: colors.text }]}>
          Catatan untuk demonstrasi
        </Text>
        <Text style={[styles.noteText, { color: colors.secondary }]}>
          Titik awal dan lokasi konsumen di halaman ini adalah koordinat contoh
          di Malang. Marker truk bergerak secara simulasi; aplikasi belum
          mengambil GPS sopir atau mengirim posisi ke server. OSRM memberikan
          rute berkendara umum, bukan estimasi lalu lintas realtime atau
          pembatasan dimensi truk.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        style={[styles.backButton, { borderColor: colors.border }]}
        onPress={() => router.replace("/")}
      >
        <Text style={[styles.backButtonText, { color: colors.text }]}>
          ← Kembali ke Beranda
        </Text>
      </Pressable>

      <Text style={[styles.attribution, { color: colors.secondary }]}>
        Rute: OSRM public demo API. Peta dasar disediakan oleh layanan peta pada
        perangkat.
      </Text>
    </ScrollView>
  );
}

type MetricProps = {
  label: string;
  value: string;
  textColor: string;
};

function Metric({ label, value, textColor }: MetricProps) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color: textColor }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

type LegendProps = {
  color: string;
  text: string;
  textColor: string;
};

function Legend({ color, text, textColor }: LegendProps) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 30 },
  hero: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 24,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  heroEyebrow: {
    color: "#FCA5A5",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  heroTitle: { color: "#FFFFFF", fontSize: 25, fontWeight: "900" },
  heroDescription: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  demoBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#7F1D1D",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
  },
  demoBadgeText: { color: "#FEE2E2", fontSize: 10, fontWeight: "800" },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: { fontSize: 10, letterSpacing: 1.1, fontWeight: "800" },
  orderId: { fontSize: 16, fontWeight: "900", marginTop: 5 },
  truckIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FCE8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  truckIcon: { fontSize: 29 },
  truckTitle: { fontSize: 18, fontWeight: "800", marginTop: 12 },
  truckCapacity: { fontSize: 12, marginTop: 4 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginTop: 14,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 7 },
  statusText: { fontSize: 12, fontWeight: "800" },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 8,
  },
  progressLabel: { fontSize: 12 },
  progressValue: { fontSize: 12, fontWeight: "900" },
  progressTrack: { height: 8, borderRadius: 6, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 6 },
  mapHeadingRow: {
    marginHorizontal: 18,
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  sectionDescription: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  mapFrame: {
    marginHorizontal: 14,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  map: { width: "100%", height: 330 },
  truckMarker: {
    backgroundColor: "#FFFFFF",
    borderColor: "#C62828",
    borderWidth: 2,
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  truckMarkerText: { fontSize: 24 },
  legendRow: {
    marginHorizontal: 18,
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 10 },
  notice: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  noticeTitle: { fontSize: 12, fontWeight: "800", marginBottom: 4 },
  noticeText: { fontSize: 11, lineHeight: 17 },
  metricsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  metric: { flex: 1, alignItems: "center", paddingHorizontal: 4 },
  metricValue: { fontSize: 14, fontWeight: "900", textAlign: "center" },
  metricLabel: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
  },
  metricDivider: { width: 1, height: 35 },
  controlSection: { marginHorizontal: 16, marginTop: 24 },
  primaryButton: {
    backgroundColor: "#C62828",
    paddingVertical: 14,
    borderRadius: 11,
    alignItems: "center",
    marginTop: 14,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  secondaryButtonRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: { fontSize: 11, fontWeight: "800", textAlign: "center" },
  navigationButton: {
    borderWidth: 1,
    borderColor: "#C62828",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
    alignItems: "center",
  },
  navigationButtonText: { fontSize: 12, color: "#C62828", fontWeight: "800" },
  noteCard: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  noteTitle: { fontSize: 13, fontWeight: "900", marginBottom: 7 },
  noteText: { fontSize: 11, lineHeight: 18 },
  backButton: {
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 11,
    padding: 13,
    alignItems: "center",
  },
  backButtonText: { fontSize: 13, fontWeight: "800" },
  attribution: {
    fontSize: 9,
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 14,
  },
});
