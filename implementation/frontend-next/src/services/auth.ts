import { api } from "@/api/client";

interface AuthResponse {
  message: string;
  codigo: string;
  data: { token: string } | { correo: string; habilitado: boolean; token: string };
}

export const authService = {
  login: (correo: string, password: string) =>
    api.post<AuthResponse>("/auth/pub/login", { correo, password }),

  register: (correo: string, password: string) =>
    api.post<AuthResponse>("/auth/pub/register", { correo, password }),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.patch<{ message: string; codigo: string; data: null }>("/auth/password", { oldPassword, newPassword }),

  registerEmployee: (correo: string, password: string, idRol: number) =>
    api.post<{ message: string; codigo: string; data: null }>("/auth/register/employee", { correo, password, idRol }),
};
