import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { createContext, useContext, useState } from "react";
import { Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
  themeMode: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  themeMode: "light",
  toggleTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export default function RootLayout() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [settingsVisible, setSettingsVisible] = useState(false);

  const isDark = themeMode === "dark";

  const toggleTheme = () => {
    setThemeMode((current) => (current === "light" ? "dark" : "light"));
  };

  const colors = {
    background: isDark ? "#121212" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#222222",
    secondary: isDark ? "#BBBBBB" : "#666666",
    border: isDark ? "#383838" : "#E5E7EB",
    primary: "#C62828",
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
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
          <Stack.Screen
            name="index"
            options={{
              title: "TrukKita",
              headerShown: true,
            }}
          />

          <Stack.Screen
            name="detail"
            options={{
              title: "Detail Truk",
            }}
          />

          <Stack.Screen
            name="riwayat"
            options={{
              title: "Riwayat Pesanan",
            }}
          />
        </Stack>

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

const styles = StyleSheet.create({
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
