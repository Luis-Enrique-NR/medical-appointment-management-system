"use client";
import { useState, useMemo, useEffect } from "react";
import { Calendar, Clock, Eye, X, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { formatDate, DAYS_SHORT, getMonthYear } from "@/lib/utils";
import { citasService } from "@/services/citas";

function mapCitaToAppointment(c: any): Appointment {
  return {
    id: c.idCita,
    code: c.codigoCita,
    patient: c.paciente,
    dni: c.dniPaciente,
    doctor: c.medico,
    specialty: c.especialidad,
    date: c.fecha,
    time: c.hora?.slice(0, 5),
    consultorio: c.codigoConsultorio,
    status: c.estadoCita,
    createdAt: c.fechaCreacion,
  };
}

const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 17; h++) {
  for (const m of [0, 30]) {
    TIME_SLOTS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

function CancelModal({ appointment, onClose, onConfirm }: { appointment: Appointment; onClose: () => void; onConfirm: (id: string) => void }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#FF82B6]/15 rounded-full flex items-center justify-center flex-shrink-0"><AlertCircle size={20} className="text-[#d45c8b]" /></div>
          <div><h3 className="font-semibold text-gray-800">Cancelar Cita</h3><p className="text-sm text-gray-500">Esta acción no se puede deshacer</p></div>
        </div>
        <p className="text-sm text-gray-600 mb-4">¿Está seguro que desea cancelar la cita con <strong>{appointment.doctor}</strong> el <strong>{formatDate(appointment.date)}</strong> a las <strong>{appointment.time}</strong>?</p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#05576D] mb-1.5">Motivo de cancelación <span className="text-[#FF82B6]">*</span></label>
          <textarea value={reason} onChange={e => { setReason(e.target.value); setError(""); }} rows={3} placeholder="Indique el motivo de cancelación..."
            className="w-full px-3 py-2 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1] resize-none" />
          {error && <p className="text-xs text-[#FF82B6] mt-1">{error}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Volver</button>
          <button onClick={() => { if (!reason.trim()) { setError("El motivo es requerido"); return; } onConfirm(appointment.id); }}
            className="flex-1 py-2.5 bg-[#FF82B6] text-white rounded-lg text-sm font-medium hover:bg-[#e06aa0] transition-colors">Confirmar Cancelación</button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ appointment, onClose, onReschedule }: { appointment: Appointment; onClose: () => void; onReschedule: (a: Appointment) => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#05576D] text-lg">Detalle de Cita</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="space-y-3 mb-5 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Código:</span><span className="font-semibold text-[#006FC1]">{appointment.code}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Doctor:</span><span className="font-medium">{appointment.doctor}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Especialidad:</span><span className="font-medium">{appointment.specialty}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Fecha:</span><span className="font-medium">{formatDate(appointment.date)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Hora:</span><span className="font-medium">{appointment.time}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Consultorio:</span><span className="font-medium">{appointment.consultorio}</span></div>
          <div className="flex justify-between items-center"><span className="text-gray-500">Estado:</span><StatusBadge status={appointment.status} /></div>
          <div className="flex justify-between"><span className="text-gray-500">Registrada:</span><span className="font-medium">{formatDate(appointment.createdAt)}</span></div>
        </div>
        {appointment.status === "Agendada" ? (
          <div className="flex gap-3">
            <button onClick={() => { onClose(); }} className="flex-1 py-2.5 border border-[#FF82B6] text-[#d45c8b] rounded-lg text-sm font-medium hover:bg-[#FF82B6]/10 transition-colors">Cancelar Cita</button>
            <button onClick={() => { onReschedule(appointment); onClose(); }} className="flex-1 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] transition-colors">Reprogramar</button>
          </div>
        ) : (
          <button onClick={onClose} className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Cerrar</button>
        )}
      </div>
    </div>
  );
}

function RescheduleModal({ appointment, onClose, onConfirm }: { appointment: Appointment; onClose: () => void; onConfirm: (id: string, data: { date: string; time: string; reason: string }) => void }) {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const calendarDays = useMemo(() => {
    const today = new Date(2026, 5, 7);
    const days: { date: Date; available: boolean; disabled: boolean }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      const dow = d.getDay();
      days.push({ date: d, available: dow !== 0 && i >= 2, disabled: dow === 0 || i < 2 });
    }
    return days;
  }, []);

  const currentMonth = selectedDate || new Date(2026, 5, 7);

  const handleSubmit = () => {
    if (!reason.trim()) { setReasonError("El motivo es requerido"); return; }
    if (!selectedDate) return;
    if (!selectedTime) return;
    onConfirm(appointment.id, {
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTime,
      reason: reason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#05576D] text-lg">Reprogramar Cita</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
          <p><span className="text-gray-500">Doctor:</span> <strong>{appointment.doctor}</strong></p>
          <p><span className="text-gray-500">Cita actual:</span> <strong>{formatDate(appointment.date)} — {appointment.time}</strong></p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#05576D] mb-1.5">
            Motivo de la reprogramación <span className="text-[#FF82B6]">*</span>
          </label>
          <textarea value={reason} onChange={e => { setReason(e.target.value); setReasonError(""); }} rows={3}
            placeholder="Indique por qué desea reprogramar la cita..."
            className="w-full px-3 py-2 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1] resize-none" />
          {reasonError && <p className="text-xs text-[#FF82B6] mt-1">{reasonError}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#05576D] mb-2">
            Nueva fecha <span className="text-[#FF82B6]">*</span>
          </label>
          <div className="max-w-sm mx-auto">
            <p className="font-semibold text-[#05576D] mb-3 text-sm">{getMonthYear(currentMonth)}</p>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_SHORT.map(d => <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: new Date(2026, 5, 1).getDay() }).map((_, i) => <div key={`e-${i}`} />)}
              {calendarDays.map((day, i) => {
                const isSel = selectedDate?.toDateString() === day.date.toDateString();
                return (
                  <button key={i} disabled={day.disabled || !day.available} onClick={() => { setSelectedDate(day.date); setSelectedTime(null); }}
                    className={`aspect-square rounded-lg text-xs flex items-center justify-center transition-colors ${day.disabled ? "text-gray-300 cursor-not-allowed" : isSel ? "bg-[#006FC1] text-white font-semibold" : day.available ? "bg-[#0AC0AB]/20 text-[#05576D] hover:bg-[#0AC0AB]/40" : "text-gray-300 cursor-not-allowed"}`}>
                    {day.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {selectedDate && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#05576D] mb-2">
              Nueva hora <span className="text-[#FF82B6]">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {TIME_SLOTS.map((t, i) => {
                const occupied = ["09:00","10:30","14:00","16:00"].includes(t);
                return (
                  <button key={i} disabled={occupied} onClick={() => setSelectedTime(t)}
                    className={`py-2 rounded-lg text-xs font-medium transition-colors ${selectedTime === t ? "bg-[#006FC1] text-white" : occupied ? "bg-[#FF82B6]/20 text-gray-400 cursor-not-allowed line-through" : "bg-[#0AC0AB]/20 text-[#05576D] hover:bg-[#0AC0AB]/40"}`}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={!reason.trim() || !selectedDate || !selectedTime}
            className="flex-1 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Confirmar Reprogramación
          </button>
        </div>
      </div>
    </div>
  );
}

export function MyAppointments() {
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [history, setHistory] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailFor, setDetailFor] = useState<Appointment | null>(null);
  const [cancelFor, setCancelFor] = useState<Appointment | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<Appointment | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    if (tab === "upcoming") {
      citasService.getMisProximas()
        .then(res => setAppointments((res.data ?? []).map(mapCitaToAppointment)))
        .catch(() => setAppointments([]))
        .finally(() => setLoading(false));
    } else {
      citasService.getMiHistorial(0)
        .then(res => setHistory((res.data?.content ?? []).map(mapCitaToAppointment)))
        .catch(() => setHistory([]))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const list = tab === "upcoming" ? appointments : history;

  const handleReschedule = async (id: string, data: { date: string; time: string; reason: string }) => {
    try {
      const appt = appointments.find(a => a.id === id);
      if (!appt) return;
      await citasService.actualizar({
        idCita: id,
        accion: "REPROGRAMAR",
        motivoActualizacion: data.reason,
        idAsignacionBloqueNuevo: parseInt(data.time),
      });
      setRescheduleFor(null);
      setSuccessMsg("Cita reprogramada exitosamente.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch {
      setSuccessMsg("Error al reprogramar la cita.");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-[#05576D] mb-6 text-2xl font-bold">Mis Citas</h1>
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 bg-[#0AC0AB]/15 border border-[#0AC0AB]/40 text-[#059688] px-4 py-3 rounded-lg text-sm">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(["upcoming", "history"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-white text-[#05576D] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "upcoming" ? "Próximas" : "Historial"}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center"><Loader2 size={32} className="mx-auto text-[#006FC1] animate-spin" /></div>
      ) : list.length === 0 ? (
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
                    <span className="font-semibold text-[#05576D] text-sm">{appt.doctor}</span>
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
                <button onClick={() => setDetailFor(appt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Eye size={14} /> Ver Detalle
                </button>
                {appt.status === "Agendada" && (
                  <>
                    <button onClick={() => setRescheduleFor(appt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#006FC1] text-[#006FC1] text-sm hover:bg-[#006FC1]/5 transition-colors">
                      <RefreshCw size={14} /> Reprogramar
                    </button>
                    <button onClick={() => setCancelFor(appt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FF82B6] text-[#d45c8b] text-sm hover:bg-[#FF82B6]/10 transition-colors">
                      <X size={14} /> Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {detailFor && <DetailModal appointment={detailFor} onClose={() => setDetailFor(null)} onReschedule={(a) => setRescheduleFor(a)} />}
      {cancelFor && <CancelModal appointment={cancelFor} onClose={() => setCancelFor(null)} onConfirm={async (id) => { try { await citasService.actualizar({ idCita: id, accion: "CANCELAR", motivoActualizacion: "Cancelado por el paciente" }); setAppointments(prev => prev.filter(a => a.id !== id)); setCancelFor(null); setSuccessMsg("La cita ha sido cancelada exitosamente."); } catch { setSuccessMsg("Error al cancelar la cita."); } setTimeout(() => setSuccessMsg(""), 4000); }} />}
      {rescheduleFor && <RescheduleModal appointment={rescheduleFor} onClose={() => setRescheduleFor(null)} onConfirm={handleReschedule} />}
    </div>
  );
}
