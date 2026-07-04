export type Role = "patient" | "secretary" | "doctor";

export const AUTHORITY_ROLE_MAP: Record<string, Role> = {
  "ROLE_SECRETARIA ADMINISTRATIVA": "secretary",
  "ROLE_MEDICO ESPECIALISTA": "doctor",
  "ROLE_PACIENTE": "patient",
};

export type Screen =
  | "book-appointment"
  | "my-appointments"
  | "appointment-detail"
  | "profile"
  | "appointment-scheduling"
  | "manage-appointments"
  | "search-patient-appointments"
  | "manage-doctor-availability"
  | "my-agenda"
  | "register-availability"
  | "availability-history"
  | "notifications"
  | "complete-registration";

export type AppointmentStatus =
  | "Agendada"
  | "Cancelada"
  | "Atendida"
  | "Reprogramada"
  | "Pendiente"
  | "Rechazado"
  | "Disponible"
  | "Ocupado"
  | "Aprobada"
  | "PROGRAMADO"
  | "ATENDIDO"
  | "CANCELADO"
  | "REPROGRAMADO";

export interface Appointment {
  id: string;
  code: string;
  patient?: string;
  dni?: string;
  phone?: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  consultorio: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface Patient {
  dni: string;
  name: string;
  email: string;
  phone: string;
}

export interface Especialidad {
  idEspecialidad: number;
  nombre: string;
  descripcion: string;
}

export interface Medico {
  idMedico: string;
  nombre: string;
}

export interface Horario {
  fecha: string;
  horaInicio: string;
  horaFin: string;
}
