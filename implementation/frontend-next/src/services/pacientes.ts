import { api } from "@/api/client";

interface PacienteData {
  idPaciente: string;
  dni: string;
  nombres: string;
  apellidos: string;
  telefono: string;
}

export const pacientesService = {
  register: (dni: string, nombres: string, apellidos: string, telefono: string) =>
    api.post<{ message: string; codigo: string; data: PacienteData }>("/pacientes", { dni, nombres, apellidos, telefono }),

  getByDni: (dni: string) =>
    api.get<{ message: string; codigo: string; data: PacienteData }>(`/pacientes/dni/${dni}`),
};
