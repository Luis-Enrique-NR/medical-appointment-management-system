import { api } from "@/api/client";

interface RangoDisponibilidad {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

interface BloquePendiente {
  idBloque: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

interface MedicoPropuesta {
  medico: string;
  bloquesHorario: BloquePendiente[];
}

interface ActualizarBloque {
  idAsignacion: number;
  aprobado: boolean;
}

export const disponibilidadService = {
  proponer: (rangosDisponibilidad: RangoDisponibilidad[]) =>
    api.post<{ message: string; codigo: string; data: null }>("/disponibilidad/propuesta", { rangosDisponibilidad }),

  getPendientes: (idEspecialidad: number) =>
    api.get<{ message: string; codigo: string; data: MedicoPropuesta[] }>(`/disponibilidad/pendientes?idEspecialidad=${idEspecialidad}`),

  actualizar: (bloques: ActualizarBloque[]) =>
    api.put<{ message: string; codigo: string; data: null }>("/disponibilidad/actualizar", bloques),
};
