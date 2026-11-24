import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "../contexts/AuthContext";

type AuthMode = "signIn" | "signUp";

export default function AuthScreen() {
  const { isConfigured, initializationError, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const isSignUp = mode === "signUp";

  const submit = async () => {
    setErrorMessage("");
    setNotice("");

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password || (isSignUp && !fullName.trim())) {
      setErrorMessage("Lengkapi semua kolom terlebih dahulu.");
      return;
    }

    if (isSignUp && password.length < 6) {
      setErrorMessage("Kata sandi harus terdiri dari minimal 6 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        const requiresEmailConfirmation = await signUp(
          normalizedEmail,
          password,
          fullName.trim(),
        );
        if (requiresEmailConfirmation) {
          setNotice(
            "Pendaftaran berhasil. Periksa email untuk konfirmasi akun.",
          );
          setMode("signIn");
          setPassword("");
        }
      } else {
        await signIn(normalizedEmail, password);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Autentikasi gagal. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.logo}>🚚 TrukKita</Text>
          <Text style={styles.title}>
            {isSignUp ? "Buat akun baru" : "Selamat datang kembali"}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? "Daftar untuk mulai menggunakan layanan TrukKita."
              : "Masuk untuk memesan dan memantau layanan truk Anda."}
          </Text>

          {!isConfigured && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>
                Autentikasi belum dikonfigurasi
              </Text>
              <Text style={styles.warningText}>
                Isi EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY
                di file .env, lalu mulai ulang Expo.
              </Text>
            </View>
          )}

          {initializationError && (
            <Text style={styles.errorText}>
              Gagal memulihkan sesi: {initializationError}
            </Text>
          )}

          {isSignUp && (
            <TextInput
              accessibilityLabel="Nama lengkap"
              autoCapitalize="words"
              editable={!isSubmitting}
              onChangeText={setFullName}
              placeholder="Nama lengkap"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={fullName}
            />
          )}
          <TextInput
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isSubmitting}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={email}
          />
          <TextInput
            accessibilityLabel="Kata sandi"
            autoCapitalize="none"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            editable={!isSubmitting}
            onChangeText={setPassword}
            placeholder="Kata sandi"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          {errorMessage !== "" && (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {errorMessage}
            </Text>
          )}
          {notice !== "" && <Text style={styles.noticeText}>{notice}</Text>}

          <Pressable
            accessibilityRole="button"
            disabled={!isConfigured || isSubmitting}
            onPress={submit}
            style={[
              styles.submitButton,
              (!isConfigured || isSubmitting) && styles.disabledButton,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isSignUp ? "Daftar" : "Masuk"}
              </Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={() => {
              setMode(isSignUp ? "signIn" : "signUp");
              setErrorMessage("");
              setNotice("");
            }}
            style={styles.modeButton}
          >
            <Text style={styles.modeButtonText}>
              {isSignUp
                ? "Sudah punya akun? Masuk"
                : "Belum punya akun? Daftar"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#F5F7FA" },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
  },
  card: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 440,
    padding: 24,
    width: "100%",
  },
  logo: {
    color: "#C62828",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 28,
  },
  title: { color: "#1E293B", fontSize: 25, fontWeight: "700" },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
    marginTop: 8,
  },
  warningBox: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
  },
  warningTitle: { color: "#9A3412", fontSize: 13, fontWeight: "700" },
  warningText: { color: "#9A3412", fontSize: 12, lineHeight: 18, marginTop: 5 },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CBD5E1",
    borderRadius: 10,
    borderWidth: 1,
    color: "#1E293B",
    fontSize: 15,
    minHeight: 50,
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  noticeText: {
    color: "#15803D",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#C62828",
    borderRadius: 10,
    justifyContent: "center",
    minHeight: 50,
    marginTop: 6,
  },
  disabledButton: { opacity: 0.55 },
  submitButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  modeButton: { alignItems: "center", paddingVertical: 18 },
  modeButtonText: { color: "#C62828", fontSize: 14, fontWeight: "600" },
});
