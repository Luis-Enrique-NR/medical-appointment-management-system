import { api } from "@/api/client";

export const especialidadesService = {
  getAll: () =>
    api.get<{ message: string; codigo: string; data: { idEspecialidad: number; nombre: string; descripcion: string }[] }>("/especialidades"),

  getMedicos: (idEspecialidad: number) =>
    api.get<{ message: string; codigo: string; data: { idMedico: string; nombre: string; descripcion: string }[] }>(`/especialidades/${idEspecialidad}/medicos`),

  getCantidadConsultorios: (idEspecialidad: number) =>
    api.get<{ message: string; codigo: string; data: { idEspecialidad: number; cantidad: number } }>(`/especialidades/${idEspecialidad}/consultorios/cantidad`),
};
