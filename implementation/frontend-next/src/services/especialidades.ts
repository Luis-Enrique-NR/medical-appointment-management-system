import { api } from "@/api/client";

interface Especialidad {
  idEspecialidad: number;
  nombre: string;
  descripcion: string;
}

interface MedicoEspecialidad {
  idMedico: string;
  nombre: string;
  descripcion: string;
}

export const especialidadesService = {
  getAll: () =>
    api.get<{ message: string; codigo: string; data: Especialidad[] }>("/especialidades"),

  getMedicos: (idEspecialidad: number) =>
    api.get<{ message: string; codigo: string; data: MedicoEspecialidad[] }>(`/especialidades/${idEspecialidad}/medicos`),
};
