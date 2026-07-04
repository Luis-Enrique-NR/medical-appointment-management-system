"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Eye, RefreshCw, X, CheckCircle, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { citasService } from "@/services/citas";

function mapCita(a: any): Appointment {
  return {
    id: a.idCita ?? a.codigoCita,
    code: a.codigoCita,
    doctor: a.medico,
    specialty: a.especialidad,
    date: a.fecha,
    time: a.hora?.slice(0, 5),
    consultorio: a.codigoConsultorio,
    status: a.estadoCita,
    createdAt: a.fechaCreacion,
    patient: a.paciente,
    dni: a.dniPaciente,
  };
}

export function ManageAppointments() {
  const [tab, setTab] = useState<"today" | "all">("all");
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [detailFor, setDetailFor] = useState<Appointment | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<Appointment | null>(null);
  const [cancelFor, setCancelFor] = useState<Appointment | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const fetchData = useCallback(() => {
    setLoading(true);
    citasService.getSecretaria({ soloHoy: tab === "today", search: search || undefined, page })
      .then(res => {
        const data = res.data;
        setAppointments((data?.content ?? []).map(mapCita));
        setTotalPages(data?.totalPages ?? 1);
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [tab, search, page]);

  useEffect(() => { setPage(0); }, [tab, search]);
  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <h1 className="text-[#05576D] mb-6 text-2xl font-bold">Gestionar Citas</h1>
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 bg-[#0AC0AB]/15 border border-[#0AC0AB]/40 text-[#059688] px-4 py-3 rounded-lg text-sm">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(["today", "all"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-white text-[#05576D] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {t === "today" ? "Citas de Hoy" : "Todas las Citas"}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por paciente, DNI, ID o doctor..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1]" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["ID","Paciente","Doctor","Especialidad","Fecha & Hora","Estado","Acciones"].map(col => (
                <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{col}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10"><Loader2 size={24} className="mx-auto text-[#006FC1] animate-spin" /></td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No se encontraron citas</td></tr>
              ) : (
                appointments.map(appt => (
                  <tr key={appt.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-mono text-[#006FC1]">{appt.id}</td>
                    <td className="px-4 py-3"><p className="text-sm font-medium text-gray-800">{appt.patient}</p><p className="text-xs text-gray-400">{appt.dni}</p></td>
                    <td className="px-4 py-3 text-sm text-gray-700">{appt.doctor}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{appt.specialty}</td>
                    <td className="px-4 py-3 text-sm text-gray-700"><p>{appt.date}</p><p className="text-gray-400">{appt.time}</p></td>
                    <td className="px-4 py-3"><StatusBadge status={appt.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button title="Ver" onClick={() => setDetailFor(appt)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#006FC1] hover:bg-[#006FC1]/10 transition-colors"><Eye size={16} /></button>
                        {(appt.status === "Agendada" || appt.status === "PROGRAMADO") && (
                          <>
                            <button title="Reprogramar" onClick={() => { setRescheduleFor(appt); }} className="p-1.5 rounded-lg text-gray-400 hover:text-[#0F96CB] hover:bg-[#0F96CB]/10 transition-colors"><RefreshCw size={16} /></button>
                            <button title="Cancelar" onClick={() => { setCancelFor(appt); setCancelReason(""); }} className="p-1.5 rounded-lg text-gray-400 hover:text-[#d45c8b] hover:bg-[#FF82B6]/10 transition-colors"><X size={16} /></button>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Anterior</button>
          <span className="text-sm text-gray-500">Página {page + 1} de {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
        </div>
      )}

      {detailFor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailFor(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-[#05576D] text-lg mb-4">Detalle de Cita</h3>
            <div className="grid gap-3 text-sm">
              <Row label="ID" value={detailFor.id} />
              <Row label="Paciente" value={detailFor.patient ?? ""} />
              <Row label="Doctor" value={detailFor.doctor} />
              <Row label="Especialidad" value={detailFor.specialty} />
              <Row label="Fecha" value={detailFor.date} />
              <Row label="Hora" value={detailFor.time} />
              <Row label="Estado" value={detailFor.status} />
            </div>
            <button onClick={() => setDetailFor(null)} className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cerrar</button>
          </div>
        </div>
      )}

      {rescheduleFor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setRescheduleFor(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-[#05576D] text-lg mb-4">Reprogramar Cita</h3>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
              <p><span className="text-gray-500">Paciente:</span> <strong>{rescheduleFor.patient}</strong></p>
              <p><span className="text-gray-500">Actual:</span> <strong>{rescheduleFor.date} — {rescheduleFor.time}</strong></p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRescheduleFor(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={async () => { try { await citasService.actualizar({ idCita: rescheduleFor.id, accion: "REPROGRAMAR", motivoActualizacion: "Reprogramado por secretaria" }); setRescheduleFor(null); setSuccessMsg("Cita reprogramada exitosamente."); fetchData(); } catch { setSuccessMsg("Error al reprogramar."); } setTimeout(() => setSuccessMsg(""), 4000); }}
                className="flex-1 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] transition-colors">Confirmar Reprogramación</button>
            </div>
          </div>
        </div>
      )}

      {cancelFor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCancelFor(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FF82B6]/15 rounded-full flex items-center justify-center"><AlertCircle size={20} className="text-[#d45c8b]" /></div>
              <div><h3 className="font-semibold text-gray-800">Cancelar Cita</h3><p className="text-sm text-gray-500">Esta acción no se puede deshacer</p></div>
            </div>
            <p className="text-sm text-gray-600 mb-4">¿Está seguro que desea cancelar la cita <strong>{cancelFor.id}</strong> de <strong>{cancelFor.patient}</strong>?</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#05576D] mb-1.5">Motivo <span className="text-[#FF82B6]">*</span></label>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} placeholder="Motivo requerido..." className="w-full px-3 py-2 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelFor(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Volver</button>
              <button disabled={!cancelReason.trim()} onClick={async () => { try { await citasService.actualizar({ idCita: cancelFor.id, accion: "CANCELAR", motivoActualizacion: cancelReason }); setCancelFor(null); setSuccessMsg("Cita cancelada exitosamente."); fetchData(); } catch { setSuccessMsg("Error al cancelar."); } setTimeout(() => setSuccessMsg(""), 4000); }}
                className="flex-1 py-2.5 bg-[#FF82B6] text-white rounded-lg text-sm font-medium hover:bg-[#e06aa0] disabled:opacity-40 disabled:cursor-not-allowed">Confirmar Cancelación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-sm text-gray-500">{label}:</span><span className="text-sm font-medium text-[#05576D]">{value}</span></div>;
}
