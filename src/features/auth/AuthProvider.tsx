import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, setUnauthorizedHandler, tokenStore } from "@/shared/api";
import type { Admin, AdminSession } from "./types";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStore.clear();
    setAdmin(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setAdmin(null));
  }, []);

  // Restore the session on load so a refresh does not bounce to login.
  useEffect(() => {
    if (!tokenStore.get()) {
      setIsLoading(false);
      return;
    }

    api
      .get<Admin>("/admin/auth/me")
      .then(setAdmin)
      .catch(() => tokenStore.clear())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await api.post<{ email: string }>("/admin/auth/login", {
      email,
      password,
    });
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const session = await api.post<AdminSession>("/admin/auth/verify-otp", {
      email,
      otp,
    });

    const { token, ...profile } = session;
    tokenStore.set(token);
    setAdmin(profile);
  }, []);

  const value = useMemo(
    () => ({ admin, isLoading, login, verifyOtp, logout }),
    [admin, isLoading, login, verifyOtp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
