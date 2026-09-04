import { createContext } from "react";
import type { Admin } from "./types";

export interface AuthContextValue {
  admin: Admin | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
}

// Kept apart from AuthProvider so that file only exports a component and
// Vite's fast refresh keeps working.
export const AuthContext = createContext<AuthContextValue | null>(null);
