import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";

import { createContext, useContext, useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { AuthProvider, useAuth } from "../contexts/AuthContext";
import SecureVaultDemo from "../components/SecureVaultDemo";

// Tipe tema aplikasi
type ThemeMode = "light" | "dark";

// Tipe data untuk Theme Context
type ThemeContextType = {
  themeMode: ThemeMode;
  toggleTheme: () => void;
};

// Membuat Theme Context
const ThemeContext = createContext<ThemeContextType>({
  themeMode: "light",
  toggleTheme: () => {},
});

// Hook untuk menggunakan tema di halaman lain
export const useAppTheme = () => useContext(ThemeContext);

function AppLayout() {
  const auth = useAuth();
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showVaultDemo, setShowVaultDemo] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isDark = themeMode === "dark";

  // Fungsi mengganti tema
  const toggleTheme = () => {
    setThemeMode((current) => (current === "light" ? "dark" : "light"));
  };

  // Warna berdasarkan tema
  const colors = {
    background: isDark ? "#121212" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#222222",
    secondary: isDark ? "#BBBBBB" : "#666666",
    border: isDark ? "#383838" : "#E5E7EB",
  };

  const handleSignOut = async () => {
    setSignOutError("");
    setIsSigningOut(true);

    try {
      await auth.signOut();
      setSettingsVisible(false);
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : "Gagal keluar dari akun.",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  if (auth.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#C62828" size="large" />
        <Text style={styles.loadingText}>Memulihkan sesi TrukKita...</Text>
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        {/* NAVIGASI APLIKASI */}
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerRight: () => (
              <Pressable
                onPress={() => setSettingsVisible(true)}
                style={styles.settingsButton}
                accessibilityLabel="Buka pengaturan tema"
              >
                <Text style={styles.settingsIcon}>⚙️</Text>
              </Pressable>
            ),
          }}
        >
          <Stack.Protected guard={!auth.user}>
            <Stack.Screen
              name="auth"
              options={{ title: "Masuk TrukKita", headerShown: false }}
            />
          </Stack.Protected>

          <Stack.Protected guard={Boolean(auth.user)}>
            <Stack.Screen
              name="index"
              options={{ title: "TrukKita", headerShown: true }}
            />
            <Stack.Screen name="detail" options={{ title: "Detail Truk" }} />
            <Stack.Screen
              name="riwayat"
              options={{ title: "Riwayat Pesanan" }}
            />
            <Stack.Screen
              name="rute"
              options={{ title: "Pemantauan Rute Truk" }}
            />
            <Stack.Screen
              name="pemantauan"
              options={{ title: "Pemantauan Pengiriman" }}
            />
            <Stack.Screen name="explore" options={{ title: "Jelajahi" }} />
          </Stack.Protected>
        </Stack>

        {/* MODAL PENGATURAN */}
        <Modal
          visible={settingsVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSettingsVisible(false)}
        >
          <View style={styles.overlay}>
            <View
              style={[
                styles.settingsCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* HEADER PENGATURAN */}
              <View style={styles.settingsHeader}>
                <Text style={[styles.settingsTitle, { color: colors.text }]}>
                  ⚙️ Pengaturan
                </Text>

                <Pressable
                  onPress={() => setSettingsVisible(false)}
                  accessibilityLabel="Tutup pengaturan"
                >
                  <Text
                    style={[styles.closeButton, { color: colors.secondary }]}
                  >
                    ✕
                  </Text>
                </Pressable>
              </View>

              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />

              {/* PENGATURAN TEMA */}
              <View style={styles.themeRow}>
                <View style={styles.themeInfo}>
                  <Text style={styles.themeEmoji}>{isDark ? "🌙" : "☀️"}</Text>

                  <View style={styles.themeTextContainer}>
                    <Text style={[styles.themeTitle, { color: colors.text }]}>
                      Mode {isDark ? "Gelap" : "Terang"}
                    </Text>

                    <Text
                      style={[
                        styles.themeDescription,
                        { color: colors.secondary },
                      ]}
                    >
                      {isDark
                        ? "Tampilan gelap aktif"
                        : "Tampilan terang aktif"}
                    </Text>
                  </View>
                </View>

                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{
                    false: "#D1D5DB",
                    true: "#E57373",
                  }}
                  thumbColor={isDark ? "#C62828" : "#FFFFFF"}
                  accessibilityLabel="Ganti mode terang atau gelap"
                />
              </View>

              <View style={styles.accountSection}>
                <Text style={[styles.accountText, { color: colors.secondary }]}>
                  Masuk sebagai {auth.user?.email}
                </Text>
                {signOutError !== "" && (
                  <Text style={styles.signOutError}>{signOutError}</Text>
                )}
                <Pressable
                  accessibilityRole="button"
                  disabled={isSigningOut}
                  onPress={handleSignOut}
                  style={[
                    styles.signOutButton,
                    isSigningOut && styles.disabledButton,
                  ]}
                >
                  <Text style={styles.signOutButtonText}>
                    {isSigningOut ? "Sedang keluar..." : "Keluar dari akun"}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.vaultToggleBtn}
                  onPress={() => setShowVaultDemo((prev) => !prev)}
                >
                  <Text style={styles.vaultToggleText}>
                    {showVaultDemo ? "Sembunyikan Demo Codelab 1" : "🔐 Uji Codelab 1 (Secure Vault)"}
                  </Text>
                </Pressable>

                {showVaultDemo && <SecureVaultDemo />}
              </View>

              {/* TOMBOL SELESAI */}
              <Pressable
                style={styles.doneButton}
                onPress={() => setSettingsVisible(false)}
              >
                <Text style={styles.doneButtonText}>Selesai</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

// STYLE
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { color: "#64748B", fontSize: 14 },
  settingsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  settingsIcon: {
    fontSize: 22,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  settingsCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    elevation: 8,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 22,
    paddingHorizontal: 4,
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  themeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  themeEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  themeTextContainer: {
    flex: 1,
  },
  accountSection: {
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    marginTop: 18,
    paddingTop: 16,
  },
  accountText: { fontSize: 12, marginBottom: 10 },
  signOutError: { color: "#B91C1C", fontSize: 12, marginBottom: 10 },
  signOutButton: {
    alignItems: "center",
    borderColor: "#C62828",
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 11,
  },
  disabledButton: { opacity: 0.55 },
  signOutButtonText: { color: "#C62828", fontSize: 14, fontWeight: "700" },
  vaultToggleBtn: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#334155",
    alignItems: "center",
  },
  vaultToggleText: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "600",
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 12,
  },
  doneButton: {
    backgroundColor: "#C62828",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
