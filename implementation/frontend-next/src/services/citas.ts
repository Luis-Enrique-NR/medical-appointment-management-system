import { api } from "@/api/client";

interface Cita {
  idCita: string;
  idPaciente: string;
  dniPaciente: string;
  paciente: string;
  codigoCita: string;
  medico: string;
  especialidad: string;
  fecha: string;
  hora: string;
  codigoConsultorio: string;
  idAsignacionBloque: number;
  estadoCita: string;
  fechaCreacion: string;
}

interface PaginatedCitas {
  content: Cita[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

type AccionCita = "CANCELAR" | "REPROGRAMAR";

interface CitaInput {
  idPaciente?: string;
  idAsignacionBloque: number;
}

interface ActualizarCitaInput {
  idCita: string;
  accion: AccionCita;
  motivoActualizacion: string;
  idAsignacionBloqueNuevo?: number;
}

export const citasService = {
  crear: (data: CitaInput) =>
    api.post<{ message: string; codigo: string; data: null }>("/citas", data),

  actualizar: (data: ActualizarCitaInput) =>
    api.put<{ message: string; codigo: string; data: null }>("/citas", data),

  getSecretaria: (params: { soloHoy?: boolean; search?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params.soloHoy !== undefined) query.set("soloHoy", String(params.soloHoy));
    if (params.search) query.set("search", params.search);
    if (params.page !== undefined) query.set("page", String(params.page));
    return api.get<{ message: string; codigo: string; data: PaginatedCitas }>(`/citas/secretaria?${query}`);
  },

  getMisProximas: () =>
    api.get<{ message: string; codigo: string; data: Cita[] }>("/citas/me/proximas"),

  getMiHistorial: (page = 0) =>
    api.get<{ message: string; codigo: string; data: PaginatedCitas }>(`/citas/me/historial?page=${page}`),

  getAgenda: (fecha: string) =>
    api.get<{ message: string; codigo: string; data: Cita[] }>(`/citas/agenda?fecha=${fecha}`),
};
