import { api } from "@/api/client";

export const pacientesService = {
  register: (dni: string, nombres: string, apellidos: string, telefono: string) =>
    api.post<{ message: string; codigo: string; data: { idPaciente: string; dni: string; nombres: string; apellidos: string; telefono: string } }>("/pacientes", { dni, nombres, apellidos, telefono }),

  getByDni: (dni: string) =>
    api.get<{ message: string; codigo: string; data: { idPaciente: string; dni: string; nombres: string; apellidos: string; telefono: string } }>(`/pacientes/dni/${dni}`),
};
