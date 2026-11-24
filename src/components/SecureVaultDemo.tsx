import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "trukkita_secure_token";

export default function SecureVaultDemo() {
  const [inputToken, setInputToken] = useState("");
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const saveToken = async () => {
    if (!inputToken.trim()) {
      setStatusMessage("Masukkan token terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(TOKEN_KEY, inputToken.trim());
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, inputToken.trim());
      }
      setStatusMessage("Token berhasil disimpan dengan aman.");
      setInputToken("");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Gagal menyimpan token."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadToken = async () => {
    setIsLoading(true);
    try {
      let token: string | null = null;
      if (Platform.OS === "web") {
        token = localStorage.getItem(TOKEN_KEY);
      } else {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
      }

      setLoadedToken(token);
      setStatusMessage(
        token ? "Token berhasil dimuat dari brankas." : "Tidak ada token yang ditemukan."
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Gagal memuat token."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const wipeToken = async () => {
    setIsLoading(true);
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
      setLoadedToken(null);
      setStatusMessage("Token telah dihapus dari brankas terenkripsi.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Gagal menghapus token."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🔐 Encrypted Vault Demo (Codelab 1)</Text>
      <Text style={styles.badge}>
        Platform: {Platform.OS === "web" ? "Web Browser (localStorage)" : "Mobile (expo-secure-store)"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Masukkan Token Rahasia / Lisensi..."
        placeholderTextColor="#94A3B8"
        value={inputToken}
        onChangeText={setInputToken}
        autoCapitalize="none"
        secureTextEntry
      />

      <View style={styles.buttonRow}>
        <Pressable style={styles.button} onPress={saveToken} disabled={isLoading}>
          <Text style={styles.buttonText}>Save Token</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.secondaryButton]} onPress={loadToken} disabled={isLoading}>
          <Text style={styles.buttonText}>Load Token</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.dangerButton]} onPress={wipeToken} disabled={isLoading}>
          <Text style={styles.buttonText}>Wipe Token</Text>
        </Pressable>
      </View>

      {isLoading && <ActivityIndicator color="#C62828" style={styles.loader} />}

      {statusMessage !== "" && <Text style={styles.status}>{statusMessage}</Text>}

      {loadedToken && (
        <View style={styles.tokenBox}>
          <Text style={styles.tokenLabel}>VAULT VALUE:</Text>
          <Text style={styles.tokenValue}>{loadedToken}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  badge: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#0F172A",
    color: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: "#C62828",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#2563EB",
  },
  dangerButton: {
    backgroundColor: "#DC2626",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  loader: {
    marginTop: 10,
  },
  status: {
    color: "#FCD34D",
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
  },
  tokenBox: {
    marginTop: 12,
    backgroundColor: "#0F172A",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  tokenLabel: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "bold",
  },
  tokenValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginTop: 4,
  },
});
