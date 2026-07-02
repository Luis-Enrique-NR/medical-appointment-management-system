"use client";
import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { Appointment } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const SAMPLE: Appointment = {
  id: "1", code: "CLF-203845", doctor: "Dra. Carmen López", specialty: "Ginecología",
  date: "2026-06-15", time: "10:00", consultorio: "Consultorio 2", status: "Agendada", createdAt: "2026-06-07",
};

const PAST: Appointment = {
  id: "3", code: "CLF-112030", doctor: "Dra. Patricia Vega", specialty: "Ginecología",
  date: "2026-05-10", time: "09:00", consultorio: "Consultorio 1", status: "Atendida", createdAt: "2026-04-28",
};

export function AppointmentDetail() {
  const [showActive, setShowActive] = useState(true);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const appt = cancelled ? { ...SAMPLE, status: "Cancelada" as const } : showActive ? SAMPLE : PAST;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-[#05576D] mb-6 text-2xl font-bold">Detalle de Cita</h1>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button onClick={() => { setShowActive(true); setCancelled(false); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showActive ? "bg-white text-[#05576D] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Cita Activa</button>
        <button onClick={() => setShowActive(false)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showActive ? "bg-white text-[#05576D] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Cita Pasada</button>
      </div>

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
            <button className="flex-1 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] transition-colors">Reprogramar</button>
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
              <button onClick={() => { setShowCancel(false); setCancelled(true); setSuccessMsg("Cita cancelada exitosamente."); setTimeout(() => setSuccessMsg(""), 4000); }}
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
