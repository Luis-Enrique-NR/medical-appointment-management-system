"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authService } from "@/services/auth";
import type { Role } from "@/lib/types";

interface User {
  role: Role;
  userName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function mapRolToRole(idRol: number): Role {
  if (idRol === 1) return "secretary";
  if (idRol === 2) return "doctor";
  return "patient";
}

function extractUser(token: string): User | null {
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  const idRol = (payload.idRol ?? payload.rol ?? 0) as number;
  const correo = (payload.sub ?? payload.correo ?? "") as string;
  const nombre = (payload.nombre ?? payload.sub ?? "") as string;
  return {
    role: mapRolToRole(idRol),
    userName: nombre || correo,
    email: correo,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const u = extractUser(token);
      if (u) setUser(u);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (correo: string, password: string) => {
    const res = await authService.login(correo, password);
    const token = (res.data as { token: string }).token;
    localStorage.setItem("token", token);
    const u = extractUser(token);
    if (!u) throw new Error("No se pudo extraer la información del usuario");
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
