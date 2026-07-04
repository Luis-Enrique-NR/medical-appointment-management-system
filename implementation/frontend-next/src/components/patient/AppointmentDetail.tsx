"use client";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { Appointment } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { citasService } from "@/services/citas";

function mapCita(c: any): Appointment {
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

export function AppointmentDetail() {
  const [appt, setAppt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    citasService.getMisProximas()
      .then(res => {
        const data = (res.data ?? []) as any[];
        setAppt(data.length > 0 ? mapCita(data[0]) : null);
      })
      .catch(() => setAppt(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-2xl mx-auto py-16 text-center"><Loader2 size={32} className="mx-auto text-[#006FC1] animate-spin" /></div>;
  if (!appt) return <div className="max-w-2xl mx-auto py-16 text-center"><p className="text-gray-500">No hay citas disponibles.</p></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-[#05576D] mb-6 text-2xl font-bold">Detalle de Cita</h1>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 bg-[#0AC0AB]/15 border border-[#0AC0AB]/40 text-[#059688] px-4 py-3 rounded-lg text-sm">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2"><span className="font-mono text-[#006FC1] font-bold text-sm">{appt.code}</span><StatusBadge status={appt.status} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Field label="Doctor" value={appt.doctor} />
          <Field label="Especialidad" value={appt.specialty} />
          <Field label="Fecha" value={formatDate(appt.date)} />
          <Field label="Hora" value={appt.time} />
          <Field label="Consultorio" value={appt.consultorio} />
          <Field label="Registrada" value={formatDate(appt.createdAt)} />
        </div>
        {appt.status === "Agendada" ? (
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setShowCancel(true)} className="flex-1 py-2.5 border border-[#FF82B6] text-[#d45c8b] rounded-lg text-sm font-medium hover:bg-[#FF82B6]/10 transition-colors">Cancelar Cita</button>
            <button onClick={async () => { try { setSuccessMsg("Función de reprogramación — seleccione un nuevo horario en Mis Citas."); setTimeout(() => setSuccessMsg(""), 4000); } catch {} }} className="flex-1 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] transition-colors">Reprogramar</button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center pt-4 border-t border-gray-100 italic">
            Esta cita ya fue {appt.status === "Atendida" ? "atendida" : "cancelada"}.
          </p>
        )}
      </div>

      {showCancel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FF82B6]/15 rounded-full flex items-center justify-center flex-shrink-0"><AlertCircle size={20} className="text-[#d45c8b]" /></div>
              <div><h3 className="font-semibold text-gray-800">Cancelar Cita</h3><p className="text-sm text-gray-500">Esta acción no se puede deshacer</p></div>
            </div>
            <p className="text-sm text-gray-600 mb-4">¿Está seguro que desea cancelar la cita <strong>{appt.code}</strong>?</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#05576D] mb-1.5">Motivo <span className="text-[#FF82B6]">*</span></label>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} placeholder="Indique el motivo..."
                className="w-full px-3 py-2 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Volver</button>
              <button onClick={async () => { try { await citasService.actualizar({ idCita: appt.id, accion: "CANCELAR", motivoActualizacion: cancelReason || "Cancelado por el paciente" }); setShowCancel(false); setSuccessMsg("Cita cancelada exitosamente."); } catch { setSuccessMsg("Error al cancelar."); } setTimeout(() => setSuccessMsg(""), 4000); }}
                className="flex-1 py-2.5 bg-[#FF82B6] text-white rounded-lg text-sm font-medium hover:bg-[#e06aa0] transition-colors">Confirmar Cancelación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-medium text-gray-500 mb-1">{label}</p><p className="text-sm font-medium text-[#05576D]">{value}</p></div>;
}
