// ======================================================
// HALAMAN PEMANTAUAN RUTE TRUK
// MODUL 3 - ASYNCHRONOUS PROGRAMMING & API
// ======================================================

import React, { useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "./_layout";

import { getRoute } from "../services/routeService";

import type { OSRMRoute } from "../types/route";

import {
  contohResolve,
  contohReject,
  ujiPromiseThen,
} from "../utils/asyncUtils";

// Koordinat Alun-Alun Kota Malang
const TITIK_AWAL = {
  longitude: 112.6308013,
  latitude: -7.9825246,
};

// Koordinat Kampus III UMM
const TITIK_TUJUAN = {
  longitude: 112.597351,
  latitude: -7.921546,
};

export default function RuteScreen() {
  const { themeMode } = useAppTheme();

  const isDark = themeMode === "dark";

  const colors = {
    background: isDark ? "#121212" : "#F5F5F5",
    card: isDark ? "#1E1E1E" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#222222",
    secondary: isDark ? "#BBBBBB" : "#666666",
    border: isDark ? "#383838" : "#E5E7EB",
    primary: "#C62828",
  };

  const [route, setRoute] = useState<OSRMRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [promiseMessage, setPromiseMessage] = useState("");

  // Mengambil data rute dari API menggunakan async/await
  const hitungRute = async () => {
    try {
      setLoading(true);
      setError("");
      setRoute(null);

      const hasil = await getRoute(TITIK_AWAL, TITIK_TUJUAN);

      setRoute(hasil);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data rute."
      );
    } finally {
      setLoading(false);
    }
  };

  // Menguji Promise.resolve() dan .then()
  const tesResolve = () => {
    contohResolve()
      .then((hasil) => {
        setPromiseMessage(hasil);
      })
      .catch((err: Error) => {
        setPromiseMessage(err.message);
      });
  };

  // Menguji Promise.reject() dan .catch()
  const tesReject = () => {
    contohReject()
      .then((hasil) => {
        setPromiseMessage(hasil);
      })
      .catch((err: Error) => {
        setPromiseMessage(err.message);
      });
  };

  // Mengubah durasi detik menjadi jam dan menit
  const formatDurasi = (detik: number) => {
    const totalMenit = Math.round(detik / 60);

    const jam = Math.floor(totalMenit / 60);
    const menit = totalMenit % 60;

    if (jam > 0) {
      return `${jam} jam ${menit} menit`;
    }

    return `${menit} menit`;
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        🚚 Pemantauan Rute Truk
      </Text>

      <Text style={[styles.subtitle, { color: colors.secondary }]}>
        Hitung jarak dan estimasi waktu perjalanan menggunakan API OSRM.
      </Text>

      {/* INFORMASI TITIK AWAL */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={styles.locationEmoji}>📍</Text>

        <Text style={[styles.label, { color: colors.secondary }]}>
          TITIK AWAL
        </Text>

        <Text style={[styles.location, { color: colors.text }]}>
          Alun-Alun Kota Malang
        </Text>

        <Text style={[styles.coordinate, { color: colors.secondary }]}>
          -7.9825246, 112.6308013
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={styles.locationEmoji}>🏁</Text>

        <Text style={[styles.label, { color: colors.secondary }]}>
          TITIK TUJUAN
        </Text>

        <Text style={[styles.location, { color: colors.text }]}>
          Kampus III Universitas Muhammadiyah Malang
        </Text>

        <Text style={[styles.coordinate, { color: colors.secondary }]}>
          -7.921546, 112.597351
        </Text>
      </View>

      {/* TOMBOL HITUNG RUTE */}
      <Pressable
        style={[
          styles.button,
          { backgroundColor: colors.primary },
          loading && styles.disabledButton,
        ]}
        onPress={hitungRute}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Menghitung Rute..." : "Hitung Rute Perjalanan"}
        </Text>
      </Pressable>

      {/* INDIKATOR LOADING */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />

          <Text style={[styles.infoText, { color: colors.secondary }]}>
            Mengambil data dari server API...
          </Text>
        </View>
      )}

      {/* PESAN ERROR */}
      {error !== "" && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>Gagal mengambil data rute.</Text>

          <Text style={styles.errorDescription}>{error}</Text>
        </View>
      )}

      {/* HASIL API */}
      {route !== null && (
        <View
          style={[
            styles.resultCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.resultTitle, { color: colors.text }]}>
            Hasil Perhitungan Rute
          </Text>

          <Text style={[styles.resultLabel, { color: colors.secondary }]}>
            Jarak Perjalanan
          </Text>

          <Text style={styles.resultValue}>
            {(route.distance / 1000).toFixed(2)} km
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.resultLabel, { color: colors.secondary }]}>
            Estimasi Durasi
          </Text>

          <Text style={styles.resultValue}>
            {formatDurasi(route.duration)}
          </Text>

          <Text style={[styles.infoText, { color: colors.secondary }]}>
            Data dihitung berdasarkan rute jalan yang tersedia pada layanan
            OSRM.
          </Text>
        </View>
      )}

      {/* DEMONSTRASI PROMISE */}
      {/*}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.resultTitle, { color: colors.text }]}>
          Praktik Promise Modul 3
        </Text>

        <Text style={[styles.infoText, { color: colors.secondary }]}>
          Bagian ini digunakan untuk menguji resolve(), reject(), dan .then().
        </Text>

        <Pressable
          style={styles.secondaryButton}
          onPress={tesResolve}
        >
          <Text style={styles.buttonText}>
            Uji Promise.resolve()
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={tesReject}
        >
          <Text style={styles.buttonText}>
            Uji Promise.reject()
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            ujiPromiseThen();
            setPromiseMessage(
              "Promise .then() dijalankan. Periksa log terminal."
            );
          }}
        >
          <Text style={styles.buttonText}>
            Uji .then() dan .catch()
          </Text>
        </Pressable>

        {promiseMessage !== "" && (
          <Text style={[styles.promiseMessage, { color: colors.text }]}>
            {promiseMessage}
          </Text>
        )}
      </View>
      */}

      <Text style={[styles.footer, { color: colors.secondary }]}>
        TrukKita Mobile | Modul 3 - Asynchronous Programming & API
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  card: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  locationEmoji: {
    fontSize: 25,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
  },
  location: {
    fontSize: 15,
    fontWeight: "bold",
    lineHeight: 22,
  },
  coordinate: {
    fontSize: 12,
    marginTop: 5,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 18,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    marginBottom: 18,
    gap: 10,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10,
  },
  errorCard: {
    backgroundColor: "#FEE2E2",
    padding: 15,
    borderRadius: 10,
    marginBottom: 18,
  },
  errorText: {
    color: "#B91C1C",
    fontWeight: "bold",
    marginBottom: 5,
  },
  errorDescription: {
    color: "#7F1D1D",
    fontSize: 13,
  },
  resultCard: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 15,
  },
  resultLabel: {
    fontSize: 13,
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#C62828",
  },
  secondaryButton: {
    backgroundColor: "#555555",
    padding: 12,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 12,
  },
  promiseMessage: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 15,
  },
  footer: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },
});