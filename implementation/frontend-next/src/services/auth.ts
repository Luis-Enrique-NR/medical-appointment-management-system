import { api } from "@/api/client";

export const authService = {
  login: (correo: string, password: string) =>
    api.post<{ message: string; codigo: string; data: { token: string } }>("/auth/pub/login", { correo, password }),

  register: (correo: string, password: string) =>
    api.post<{ message: string; codigo: string; data: { correo: string; habilitado: boolean; token: string } }>("/auth/pub/register", { correo, password }),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.patch<{ message: string; codigo: string; data: null }>("/auth/password", { oldPassword, newPassword }),

  registerEmployee: (correo: string, password: string, idRol: number) =>
    api.post<{ message: string; codigo: string; data: null }>("/auth/register/employee", { correo, password, idRol }),
};
