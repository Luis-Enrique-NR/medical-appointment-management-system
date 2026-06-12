import { useState } from "react";
import {
  Search,
  Eye,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { StatusBadge, AppointmentStatus } from "../StatusBadge";

interface Appointment {
  id: string;
  patient: string;
  dni: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: AppointmentStatus;
}

const ALL_APPOINTMENTS: Appointment[] = [
  {
    id: "CLF-001",
    patient: "María García Pérez",
    dni: "47123456",
    doctor: "Dra. Carmen López",
    specialty: "Ginecología",
    date: "2026-06-07",
    time: "09:00",
    status: "Agendada",
  },
  {
    id: "CLF-002",
    patient: "Rosa Mendoza Quispe",
    dni: "38291047",
    doctor: "Dr. Miguel Torres",
    specialty: "Obstetricia",
    date: "2026-06-07",
    time: "10:30",
    status: "Atendida",
  },
  {
    id: "CLF-003",
    patient: "Julia Torres Silva",
    dni: "52841930",
    doctor: "Dr. Andrés Castro",
    specialty: "Fertilidad",
    date: "2026-06-07",
    time: "11:00",
    status: "Agendada",
  },
  {
    id: "CLF-004",
    patient: "Laura Quispe Flores",
    dni: "61029384",
    doctor: "Dra. Patricia Vega",
    specialty: "Ginecología",
    date: "2026-06-08",
    time: "08:30",
    status: "Pendiente",
  },
  {
    id: "CLF-005",
    patient: "Ana Lima Torres",
    dni: "73920184",
    doctor: "Dra. Sofia Morales",
    specialty: "Obstetricia",
    date: "2026-06-08",
    time: "14:00",
    status: "Reprogramada",
  },
  {
    id: "CLF-006",
    patient: "Carla Ramos Díaz",
    dni: "48291038",
    doctor: "Dra. Carmen López",
    specialty: "Ginecología",
    date: "2026-06-10",
    time: "09:30",
    status: "Agendada",
  },
];

const TODAY = "2026-06-07";

const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];
const OCCUPIED = ["09:00", "10:30", "14:00"];

interface RescheduleModalProps {
  appointment: Appointment;
  onClose: () => void;
  onConfirm: (id: string, time: string) => void;
}

function RescheduleModal({
  appointment,
  onClose,
  onConfirm,
}: RescheduleModalProps) {
  const [newTime, setNewTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-semibold text-[#05576D]"
            style={{ fontSize: 17 }}
          >
            Reprogramar Cita
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
          <p>
            <span className="text-gray-500">Paciente:</span>{" "}
            <strong>{appointment.patient}</strong>
          </p>
          <p>
            <span className="text-gray-500">
              Horario actual:
            </span>{" "}
            <strong>
              {appointment.date} — {appointment.time}
            </strong>
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#05576D] mb-2">
            Nuevo horario{" "}
            <span className="text-[#FF82B6]">*</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {TIME_SLOTS.map((t) => {
              const occ = OCCUPIED.includes(t);
              return (
                <button
                  key={t}
                  disabled={occ}
                  onClick={() => setNewTime(t)}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                    newTime === t
                      ? "bg-[#006FC1] text-white"
                      : occ
                        ? "bg-[#FF82B6]/20 text-gray-400 cursor-not-allowed line-through"
                        : "bg-[#0AC0AB]/20 text-[#05576D] hover:bg-[#0AC0AB]/40"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#05576D] mb-1.5">
            Motivo <span className="text-[#FF82B6]">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Motivo de la reprogramación..."
            className="w-full px-3 py-2 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#006FC1] resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            disabled={!newTime || !reason}
            onClick={() =>
              newTime && onConfirm(appointment.id, newTime)
            }
            className="flex-1 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Confirmar Reprogramación
          </button>
        </div>
      </div>
    </div>
  );
}

interface CancelModalProps {
  appointment: Appointment;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

function CancelModal({
  appointment,
  onClose,
  onConfirm,
}: CancelModalProps) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#FF82B6]/15 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-[#d45c8b]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              Cancelar Cita
            </h3>
            <p className="text-sm text-gray-500">
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          ¿Está seguro que desea cancelar la cita{" "}
          <strong>{appointment.id}</strong> de{" "}
          <strong>{appointment.patient}</strong>?
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#05576D] mb-1.5">
            Motivo de cancelación{" "}
            <span className="text-[#FF82B6]">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Motivo requerido..."
            className="w-full px-3 py-2 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#006FC1] resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(appointment.id)}
            className="flex-1 py-2.5 bg-[#FF82B6] text-white rounded-lg text-sm font-medium hover:bg-[#e06aa0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Confirmar Cancelación
          </button>
        </div>
      </div>
    </div>
  );
}

interface DetailModalProps {
  appointment: Appointment;
  onClose: () => void;
}

function DetailModal({ appointment, onClose }: DetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#05576D]" style={{ fontSize: 17 }}>
            Detalle de Cita
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="grid gap-3 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="text-gray-500">ID</span>
            <span className="font-medium">{appointment.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Paciente</span>
            <span className="font-medium">{appointment.patient}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">DNI</span>
            <span className="font-medium">{appointment.dni}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Doctor</span>
            <span className="font-medium">{appointment.doctor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Especialidad</span>
            <span className="font-medium">{appointment.specialty}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fecha</span>
            <span className="font-medium">{appointment.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Hora</span>
            <span className="font-medium">{appointment.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Estado</span>
            <StatusBadge status={appointment.status} />
          </div>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ManageAppointments() {
  const [tab, setTab] = useState<"today" | "all">("today");
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] =
    useState<Appointment[]>(ALL_APPOINTMENTS);
  const [detailFor, setDetailFor] = useState<Appointment | null>(null);
  const [rescheduleFor, setRescheduleFor] =
    useState<Appointment | null>(null);
  const [cancelFor, setCancelFor] =
    useState<Appointment | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const filtered = appointments.filter((a) => {
    if (tab === "today" && a.date !== TODAY) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.patient.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      a.dni.includes(q) ||
      a.doctor.toLowerCase().includes(q)
    );
  });

  const showMsg = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleReschedule = (id: string, time: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, time, status: "Reprogramada" }
          : a,
      ),
    );
    setRescheduleFor(null);
    showMsg("Cita reprogramada exitosamente.");
  };

  const handleCancel = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "Cancelada" } : a,
      ),
    );
    setCancelFor(null);
    showMsg("Cita cancelada exitosamente.");
  };

  const handleAttended = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "Atendida" } : a,
      ),
    );
    showMsg("Asistencia confirmada exitosamente.");
  };

  return (
    <div>
      <h1
        className="text-[#05576D] mb-6"
        style={{ fontSize: 24, fontWeight: 700 }}
      >
        Gestionar Citas
      </h1>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 bg-[#0AC0AB]/15 border border-[#0AC0AB]/40 text-[#059688] px-4 py-3 rounded-lg text-sm">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(["today", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-white text-[#05576D] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {t === "today"
                ? "Citas de Hoy"
                : "Todas las Citas"}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por paciente, DNI, ID o doctor..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "ID",
                  "Paciente",
                  "Doctor",
                  "Especialidad",
                  "Fecha & Hora",
                  "Estado",
                  "Acciones",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-gray-400 text-sm"
                  >
                    No se encontraron citas
                  </td>
                </tr>
              ) : (
                filtered.map((appt) => (
                  <tr
                    key={appt.id}
                    className="hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3 text-sm font-mono text-[#006FC1]">
                      {appt.id}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">
                        {appt.patient}
                      </p>
                      <p className="text-xs text-gray-400">
                        {appt.dni}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {appt.doctor}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {appt.specialty}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <p>{appt.date}</p>
                      <p className="text-gray-400">
                        {appt.time}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          title="Ver detalle"
                          onClick={() => setDetailFor(appt)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#006FC1] hover:bg-[#006FC1]/10 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        {appt.status === "Agendada" && (
                          <>
                            <button
                              title="Reprogramar"
                              onClick={() =>
                                setRescheduleFor(appt)
                              }
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#0F96CB] hover:bg-[#0F96CB]/10 transition-colors"
                            >
                              <RefreshCw size={16} />
                            </button>
                            <button
                              title="Cancelar"
                              onClick={() => setCancelFor(appt)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#d45c8b] hover:bg-[#FF82B6]/10 transition-colors"
                            >
                              <X size={16} />
                            </button>
                            <button
                              title="Confirmar asistencia"
                              onClick={() =>
                                handleAttended(appt.id)
                              }
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#0AC0AB] hover:bg-[#0AC0AB]/10 transition-colors"
                            >
                              <CheckCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailFor && (
        <DetailModal
          appointment={detailFor}
          onClose={() => setDetailFor(null)}
        />
      )}
      {rescheduleFor && (
        <RescheduleModal
          appointment={rescheduleFor}
          onClose={() => setRescheduleFor(null)}
          onConfirm={handleReschedule}
        />
      )}
      {cancelFor && (
        <CancelModal
          appointment={cancelFor}
          onClose={() => setCancelFor(null)}
          onConfirm={handleCancel}
        />
      )}
    </div>
  );
}