"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { AppointmentStatus } from "@/lib/types";
import { disponibilidadService } from "@/services/disponibilidad";

interface Proposal {
  id: string; submissionDate: string; weekRange: string; status: AppointmentStatus; consultorio?: string;
}

const statusMap: Record<string, AppointmentStatus> = {
  por_revisar: "Pendiente",
  aprobado: "Aprobada",
  anulado: "Rechazado",
};

export function AvailabilityHistory() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    disponibilidadService.getPendientes(0)
      .then(res => {
        const data = (res.data ?? []) as any[];
        setProposals(data.flatMap((m: any, i: number) =>
          (m.bloquesHorario ?? []).map((b: any, j: number) => ({
            id: `BLOQUE-${b.idBloque ?? i}-${j}`,
            submissionDate: b.fecha ?? "",
            weekRange: `Semana del ${b.fecha ?? ""}`,
            status: statusMap[b.estado ?? "por_revisar"] ?? "Pendiente",
            consultorio: b.consultorio ?? null,
          }))
        ));
      })
      .catch(() => setProposals([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[#05576D] mb-6 text-2xl font-bold">Historial de Propuestas</h1>
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center"><Loader2 size={32} className="mx-auto text-[#006FC1] animate-spin mb-3" /><p className="text-gray-500">Cargando propuestas...</p></div>
      ) : proposals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center"><p className="text-gray-500">No hay propuestas de disponibilidad.</p></div>
      ) : (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["ID Propuesta", "Fecha Envío", "Semana Propuesta", "Estado", "Consultorio"].map(col => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {proposals.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm font-mono text-[#006FC1]">{p.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.submissionDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.weekRange}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.consultorio || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
