import { api } from "@/api/client";

export const citasService = {
  crear: (data: { idPaciente?: string; idAsignacionBloque: number }) =>
    api.post<{ message: string; codigo: string; data: null }>("/citas", data),

  actualizar: (data: { idCita: string; accion: "CANCELAR" | "REPROGRAMAR"; motivoActualizacion: string; idAsignacionBloqueNuevo?: number }) =>
    api.put<{ message: string; codigo: string; data: null }>("/citas", data),

  getSecretaria: (params: { soloHoy?: boolean; search?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params.soloHoy !== undefined) query.set("soloHoy", String(params.soloHoy));
    if (params.search) query.set("search", params.search);
    if (params.page !== undefined) query.set("page", String(params.page));
    return api.get<{ message: string; codigo: string; data: { content: any[]; page: number; size: number; totalElements: number; totalPages: number } }>(`/citas/secretaria?${query}`);
  },

  getMisProximas: () =>
    api.get<{ message: string; codigo: string; data: any[] }>("/citas/me/proximas"),

  getMiHistorial: (page = 0) =>
    api.get<{ message: string; codigo: string; data: { content: any[]; page: number; size: number; totalElements: number; totalPages: number } }>(`/citas/me/historial?page=${page}`),

  getAgenda: (fecha: string) =>
    api.get<{ message: string; codigo: string; data: any[] }>(`/citas/agenda?fecha=${fecha}`),
};
