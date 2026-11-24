import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../services/supabase";

type AuthContextValue = {
  isConfigured: boolean;
  isLoading: boolean;
  initializationError: string | null;
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan autentikasi. Silakan coba lagi.";
}

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(supabase !== null);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
        setInitializationError(null);
        setIsLoading(false);
      }
    });

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) {
          return;
        }

        if (error) {
          setInitializationError(error.message);
          return;
        }

        setSession(data.session);
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setInitializationError(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextValue = {
    isConfigured: supabase !== null,
    isLoading,
    initializationError,
    session,
    user: session?.user ?? null,
    signIn: async (email, password) => {
      if (!supabase) {
        throw new Error("Konfigurasi Supabase belum tersedia.");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    },
    signUp: async (email, password, fullName) => {
      if (!supabase) {
        throw new Error("Konfigurasi Supabase belum tersedia.");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        throw error;
      }

      return data.session === null;
    },
    signOut: async () => {
      if (!supabase) {
        throw new Error("Konfigurasi Supabase belum tersedia.");
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  }

  return context;
}
