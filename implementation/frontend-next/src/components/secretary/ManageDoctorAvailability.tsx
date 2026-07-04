"use client";
import { useState, useMemo, useEffect } from "react";
import { AlertTriangle, CheckCircle2, X, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { especialidadesService } from "@/services/especialidades";
import { disponibilidadService } from "@/services/disponibilidad";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const TIME_BLOCKS: string[] = [];
for (let h = 7; h <= 21; h++) {
  for (const m of [0, 30]) {
    TIME_BLOCKS.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
  }
}

type SlotStatus = "por_revisar" | "aprobado" | "anulado";

interface SlotInfo {
  idBloque: number;
  doctor: string;
  specialty: string;
  status: SlotStatus;
  conflict: boolean;
}

export function ManageDoctorAvailability() {
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [specialty, setSpecialty] = useState<number | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [popover, setPopover] = useState<{ day: string; block: string; doctor: string; specialty: string; index: number; idBloque: number } | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    especialidadesService.getAll().then(res => setSpecialties(res.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (specialty !== null) {
      setLoading(true);
      disponibilidadService.getPendientes(specialty)
        .then(res => setProposals(res.data ?? []))
        .catch(() => setProposals([]))
        .finally(() => setLoading(false));
    }
  }, [specialty]);

  const grid = useMemo(() => {
    const g: Record<string, Record<string, SlotInfo[]>> = {};
    for (const day of DAYS) { g[day] = {}; for (const block of TIME_BLOCKS) g[day][block] = []; }
    for (const p of proposals) {
      const medico = (p.medico ?? "") as string;
      for (const b of (p.bloquesHorario ?? []) as any[]) {
        let dayIdx = 0;
        if (b.fecha) {
          const d = new Date(b.fecha.split("-").reverse().join("-"));
          dayIdx = (d.getDay() + 6) % 7;
        }
        const dayName = DAYS[dayIdx];
        const blockTime = (b.horaInicio ?? "").slice(0, 5);
        if (g[dayName]?.[blockTime]) {
          g[dayName][blockTime].push({
            idBloque: b.idBloque ?? 0,
            doctor: medico,
            specialty: "",
            status: "por_revisar",
            conflict: false,
          });
        }
      }
    }
    return g;
  }, [proposals]);

  const capacityAlerts = useMemo(() => {
    const alerts: { day: string; block: string; count: number }[] = [];
    for (const day of DAYS) {
      for (const block of TIME_BLOCKS) {
        const slots = grid[day]?.[block] ?? [];
        if (slots.length > 6) alerts.push({ day, block, count: slots.length });
      }
    }
    return alerts;
  }, [grid]);

  const handleBulkUpdate = async (aprobar: boolean) => {
    const cambios = proposals.flatMap((p: any) =>
      (p.bloquesHorario ?? []).map((b: any) => ({ idAsignacion: b.idBloque, aprobado: aprobar }))
    );
    if (cambios.length === 0) return;
    try {
      await disponibilidadService.actualizar(cambios);
      setSuccessMsg(`Se ${aprobar ? "aprobaron" : "rechazaron"} ${cambios.length} bloque(s).`);
      setTimeout(() => setSuccessMsg(""), 3000);
      if (specialty !== null) {
        const pend = await disponibilidadService.getPendientes(specialty);
        setProposals(pend.data ?? []);
      }
    } catch {
      setSuccessMsg("Error al procesar la actualización masiva.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleChangeStatus = async (day: string, block: string, index: number, newStatus: SlotStatus) => {
    const slot = grid[day]?.[block]?.[index];
    if (!slot) return;
    try {
      await disponibilidadService.actualizar([{ idAsignacion: slot.idBloque, aprobado: newStatus === "aprobado" }]);
      setPopover(null);
      setSuccessMsg(`Bloque de ${slot.doctor} actualizado a "${newStatus === "por_revisar" ? "Por revisar" : newStatus === "aprobado" ? "Aprobado" : "Anulado"}".`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setSuccessMsg("Error al actualizar el bloque.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const slotsForSpecialty = (day: string, block: string): SlotInfo[] => {
    return grid[day]?.[block] ?? [];
  };

  const statusStyle = (status: SlotStatus, conflict: boolean): string => {
    if (status === "aprobado") return "bg-[#0AC0AB] text-white border-[#0AC0AB]";
    if (status === "anulado") return "bg-[#555555] text-white border-[#555555] line-through";
    if (conflict) return "bg-[#E0E0E0] text-gray-700 border-[#FF82B6] ring-2 ring-[#FF82B6]";
    return "bg-[#E0E0E0] text-gray-700 border-gray-300";
  };

  return (
    <div>
      <h1 className="text-[#05576D] mb-6 text-2xl font-bold">Disponibilidad de Médicos</h1>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 bg-[#0AC0AB]/15 border border-[#0AC0AB]/40 text-[#059688] px-4 py-3 rounded-lg text-sm">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        {specialties.map(s => (
          <button key={s.idEspecialidad} onClick={() => setSpecialty(s.idEspecialidad)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${specialty === s.idEspecialidad ? "bg-[#006FC1] text-white border-[#006FC1]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>{s.nombre}</button>
        ))}
      </div>
      {loading && <div className="flex justify-center py-8"><Loader2 size={28} className="text-[#006FC1] animate-spin" /></div>}

      {capacityAlerts.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {capacityAlerts.slice(0, 3).map(a => (
            <div key={`${a.day}-${a.block}`} className="flex items-center gap-1.5 bg-[#FF82B6]/15 border border-[#FF82B6]/30 text-[#d45c8b] px-3 py-1.5 rounded-lg text-xs">
              <AlertTriangle size={13} />
              {a.day} {a.block}: {a.count} bloques — supera la capacidad estimada
            </div>
          ))}
          {capacityAlerts.length > 3 && (
            <div className="text-xs text-gray-500 px-2 py-1.5">+{capacityAlerts.length - 3} más</div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-4 text-xs items-center">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[#0AC0AB] text-white border-[#0AC0AB]">Aprobado</span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[#E0E0E0] text-gray-700 border-gray-300">Por revisar</span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[#555555] text-white border-[#555555]">Anulado</span>
        <span className="flex items-center gap-1.5 text-gray-500"><AlertTriangle size={12} className="text-[#FF82B6]" /> Conflicto de horario</span>
        <span className="flex-1" />
        <div className="flex gap-2">
          <button onClick={() => handleBulkUpdate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0AC0AB] text-white rounded-lg text-xs font-medium hover:bg-[#059e8a] transition-colors disabled:opacity-40"
            disabled={proposals.length === 0}>
            <ThumbsUp size={13} /> Aprobar Todos
          </button>
          <button onClick={() => handleBulkUpdate(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#555555] text-white rounded-lg text-xs font-medium hover:bg-[#444444] transition-colors disabled:opacity-40"
            disabled={proposals.length === 0}>
            <ThumbsDown size={13} /> Rechazar Todos
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]" style={{ fontSize: 11 }}>
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-2 py-2 font-semibold text-gray-500 w-16">Horario</th>
                {DAYS.map(d => <th key={d} className="text-center px-1 py-2 font-semibold text-gray-500">{d}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {TIME_BLOCKS.map(block => (
                <tr key={block}>
                  <td className="px-2 py-1 text-gray-500 font-medium whitespace-nowrap">{block}</td>
                  {DAYS.map(day => {
                    const slots = slotsForSpecialty(day, block);
                    return (
                      <td key={day} className="px-0.5 py-0.5 align-top">
                        <div className="flex flex-col gap-0.5 min-h-5">
                          {slots.map((slot, i) => {
                            return (
                  <div key={i}
                    onClick={() => setPopover({ day, block, doctor: slot.doctor, specialty: slot.specialty, index: i, idBloque: slot.idBloque })}
                                className={`relative px-1 py-0.5 rounded border cursor-pointer transition-colors ${statusStyle(slot.status, slot.conflict)}`}>
                                <p className="truncate max-w-[90px] font-medium">{slot.doctor}</p>
                                {slot.conflict && (
                                  <span className="absolute -top-1 -right-1"><AlertTriangle size={9} className="text-[#FF82B6]" /></span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {popover && (() => {
        const cs = grid[popover.day]?.[popover.block]?.[popover.index];
        const safeSlot: SlotInfo = cs ?? { idBloque: popover.idBloque, doctor: popover.doctor, specialty: popover.specialty, status: "por_revisar", conflict: false };
        return (
          <PopoverPanel
            currentSlot={safeSlot}
            doctor={popover.doctor}
            specialty={popover.specialty}
            onClose={() => setPopover(null)}
            onChangeStatus={(status) => handleChangeStatus(popover.day, popover.block, popover.index, status)}
          />
        );
      })()}
    </div>
  );
}

function PopoverPanel({
  currentSlot, doctor, specialty, onClose, onChangeStatus,
}: {
  currentSlot: SlotInfo;
  doctor: string;
  specialty: string;
  onClose: () => void;
  onChangeStatus: (status: SlotStatus) => void;
}) {
  const [selectedAction, setSelectedAction] = useState<SlotStatus>(currentSlot.status ?? "por_revisar");

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#05576D] text-sm">Gestionar Bloque</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="space-y-1.5 text-sm mb-4 bg-gray-50 rounded-xl p-3">
          <p><span className="text-gray-500">Doctor:</span> <strong>{doctor}</strong></p>
          <p><span className="text-gray-500">Especialidad:</span> {specialty}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#05576D] mb-2">Estado del bloque</label>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setSelectedAction("por_revisar")}
              className={`py-2 rounded-lg text-xs font-medium border transition-colors ${selectedAction === "por_revisar" ? "bg-[#E0E0E0] text-gray-800 border-gray-400 ring-2 ring-gray-300" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
              Por revisar
            </button>
            <button onClick={() => setSelectedAction("aprobado")}
              className={`py-2 rounded-lg text-xs font-medium border transition-colors ${selectedAction === "aprobado" ? "bg-[#0AC0AB] text-white border-[#0AC0AB] ring-2 ring-[#0AC0AB]/40" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
              Aprobado
            </button>
            <button onClick={() => setSelectedAction("anulado")}
              className={`py-2 rounded-lg text-xs font-medium border transition-colors ${selectedAction === "anulado" ? "bg-[#555555] text-white border-[#555555] ring-2 ring-gray-400" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
              Anulado
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button
            onClick={() => {
              if (selectedAction === currentSlot.status) { onClose(); return; }
              onChangeStatus(selectedAction);
            }}
            className="flex-1 py-2 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
