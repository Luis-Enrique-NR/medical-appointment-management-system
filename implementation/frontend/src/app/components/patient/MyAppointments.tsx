import { useState } from "react";
import { Calendar, Clock, ChevronRight, X, RefreshCw, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import { StatusBadge, AppointmentStatus } from "../StatusBadge";

interface Appointment {
  id: string;
  code: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  consultorio: string;
  status: AppointmentStatus;
  createdAt: string;
}

const UPCOMING: Appointment[] = [
  { id: "1", code: "CLF-203845", doctor: "Dra. Carmen López", specialty: "Ginecología", date: "2026-06-15", time: "10:00", consultorio: "Consultorio 2", status: "Agendada", createdAt: "2026-06-07" },
  { id: "2", code: "CLF-398201", doctor: "Dr. Andrés Castro", specialty: "Fertilidad", date: "2026-06-22", time: "14:30", consultorio: "Consultorio 5", status: "Reprogramada", createdAt: "2026-06-01" },
];

const HISTORY: Appointment[] = [
  { id: "3", code: "CLF-112030", doctor: "Dra. Patricia Vega", specialty: "Ginecología", date: "2026-05-10", time: "09:00", consultorio: "Consultorio 1", status: "Atendida", createdAt: "2026-04-28" },
  { id: "4", code: "CLF-098765", doctor: "Dr. Miguel Torres", specialty: "Obstetricia", date: "2026-04-22", time: "11:00", consultorio: "Consultorio 3", status: "Cancelada", createdAt: "2026-04-01" },
];

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("es-PE", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

interface CancelModalProps {
  appointment: Appointment;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

function CancelModal({ appointment, onClose, onConfirm }: CancelModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#FF82B6]/15 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-[#d45c8b]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Cancelar Cita</h3>
            <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          ¿Está seguro que desea cancelar la cita con <strong>{appointment.doctor}</strong> el <strong>{formatDate(appointment.date)}</strong> a las <strong>{appointment.time}</strong>?
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#05576D] mb-1.5">
            Motivo de cancelación <span className="text-[#FF82B6]">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => { setReason(e.target.value); setError(""); }}
            rows={3}
            placeholder="Indique el motivo de cancelación..."
            className="w-full px-3 py-2 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1] resize-none"
          />
          {error && <p className="text-xs text-[#FF82B6] mt-1">{error}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Volver
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) { setError("El motivo es requerido"); return; }
              onConfirm(appointment.id);
            }}
            className="flex-1 py-2.5 bg-[#FF82B6] text-white rounded-lg text-sm font-medium hover:bg-[#e06aa0] transition-colors"
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
  onCancel: (a: Appointment) => void;
}

function DetailModal({ appointment, onClose, onCancel }: DetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#05576D]" style={{ fontSize: 18 }}>Detalle de Cita</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="space-y-3 mb-5">
          <div className="flex justify-between"><span className="text-sm text-gray-500">Código:</span><span className="text-sm font-semibold text-[#006FC1]">{appointment.code}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">Doctor:</span><span className="text-sm font-medium">{appointment.doctor}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">Especialidad:</span><span className="text-sm font-medium">{appointment.specialty}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">Fecha:</span><span className="text-sm font-medium">{formatDate(appointment.date)}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">Hora:</span><span className="text-sm font-medium">{appointment.time}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">Consultorio:</span><span className="text-sm font-medium">{appointment.consultorio}</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-500">Estado:</span><StatusBadge status={appointment.status} /></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">Registrada:</span><span className="text-sm font-medium">{formatDate(appointment.createdAt)}</span></div>
        </div>
        {appointment.status === "Agendada" && (
          <div className="flex gap-3">
            <button
              onClick={() => { onCancel(appointment); onClose(); }}
              className="flex-1 py-2.5 border border-[#FF82B6] text-[#d45c8b] rounded-lg text-sm font-medium hover:bg-[#FF82B6]/10 transition-colors"
            >
              Cancelar Cita
            </button>
            <button className="flex-1 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] transition-colors">
              Reprogramar
            </button>
          </div>
        )}
        {(appointment.status === "Atendida" || appointment.status === "Cancelada") && (
          <button onClick={onClose} className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}

export function MyAppointments() {
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>(UPCOMING);
  const [history] = useState<Appointment[]>(HISTORY);
  const [detailFor, setDetailFor] = useState<Appointment | null>(null);
  const [cancelFor, setCancelFor] = useState<Appointment | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleCancel = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "Cancelada" as AppointmentStatus } : a));
    setCancelFor(null);
    setSuccessMsg("La cita ha sido cancelada exitosamente.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const list = tab === "upcoming" ? appointments : history;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-[#05576D] mb-6" style={{ fontSize: 24, fontWeight: 700 }}>Mis Citas</h1>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 bg-[#0AC0AB]/15 border border-[#0AC0AB]/40 text-[#059688] px-4 py-3 rounded-lg text-sm">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(["upcoming", "history"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-[#05576D] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "upcoming" ? "Próximas" : "Historial"}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <Calendar size={44} className="mx-auto text-[#0AC0AB] mb-3" />
          <p className="text-gray-500">No tiene citas programadas aún.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {list.map(appt => (
            <div key={appt.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-[#05576D]" style={{ fontSize: 15 }}>{appt.doctor}</span>
                    <StatusBadge status={appt.status} />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{appt.specialty}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#006FC1]" />{formatDate(appt.date)}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#006FC1]" />{appt.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 flex-wrap">
                <button
                  onClick={() => setDetailFor(appt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Eye size={14} /> Ver Detalle
                </button>
                {appt.status === "Agendada" && (
                  <>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#006FC1] text-[#006FC1] text-sm hover:bg-[#006FC1]/5 transition-colors">
                      <RefreshCw size={14} /> Reprogramar
                    </button>
                    <button
                      onClick={() => setCancelFor(appt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FF82B6] text-[#d45c8b] text-sm hover:bg-[#FF82B6]/10 transition-colors"
                    >
                      <X size={14} /> Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {detailFor && (
        <DetailModal
          appointment={detailFor}
          onClose={() => setDetailFor(null)}
          onCancel={(a) => setCancelFor(a)}
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
