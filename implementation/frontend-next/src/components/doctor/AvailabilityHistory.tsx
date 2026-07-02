"use client";
import { StatusBadge } from "@/components/StatusBadge";
import type { AppointmentStatus } from "@/lib/types";

interface Proposal {
  id: string; submissionDate: string; weekRange: string; status: AppointmentStatus; consultorio?: string;
}

const PROPOSALS: Proposal[] = [
  { id: "PROP-001", submissionDate: "2026-06-01", weekRange: "Semana del 08 al 14 de Junio", status: "Aprobada", consultorio: "Consultorio 3" },
  { id: "PROP-002", submissionDate: "2026-05-25", weekRange: "Semana del 01 al 07 de Junio", status: "Aprobada", consultorio: "Consultorio 2" },
  { id: "PROP-003", submissionDate: "2026-05-18", weekRange: "Semana del 25 al 31 de Mayo", status: "Pendiente" },
  { id: "PROP-004", submissionDate: "2026-05-11", weekRange: "Semana del 18 al 24 de Mayo", status: "Rechazado" },
  { id: "PROP-005", submissionDate: "2026-05-04", weekRange: "Semana del 11 al 17 de Mayo", status: "Aprobada", consultorio: "Consultorio 1" },
];

export function AvailabilityHistory() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[#05576D] mb-6 text-2xl font-bold">Historial de Propuestas</h1>
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
              {PROPOSALS.map(p => (
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
    </div>
  );
}
