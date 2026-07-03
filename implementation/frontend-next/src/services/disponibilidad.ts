import { api } from "@/api/client";

export const disponibilidadService = {
  proponer: (rangosDisponibilidad: { dia: string; horaInicio: string; horaFin: string }[]) =>
    api.post<{ message: string; codigo: string; data: null }>("/disponibilidad/propuesta", { rangosDisponibilidad }),

  getPendientes: (idEspecialidad: number) =>
    api.get<{ message: string; codigo: string; data: { medico: string; bloquesHorario: { idBloque: number; fecha: string; horaInicio: string; horaFin: string }[] }[] }>(`/disponibilidad/pendientes?idEspecialidad=${idEspecialidad}`),

  actualizar: (bloques: { idAsignacion: number; aprobado: boolean }[]) =>
    api.put<{ message: string; codigo: string; data: null }>("/disponibilidad/actualizar", bloques),
};
