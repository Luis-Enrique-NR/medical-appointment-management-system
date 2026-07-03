import { api } from "@/api/client";

interface BloqueHorario {
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export const medicosService = {
  getHorarios: (idMedico: string) =>
    api.get<{ message: string; codigo: string; data: BloqueHorario[] }>(`/medicos/${idMedico}/horarios`),
};
