import { api } from "@/api/client";

export const medicosService = {
  getHorarios: (idMedico: string) =>
    api.get<{ message: string; codigo: string; data: { fecha: string; horaInicio: string; horaFin: string }[] }>(`/medicos/${idMedico}/horarios`),
};
