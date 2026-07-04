"use client";
import { useState, useMemo, useEffect } from "react";
import { AlertTriangle, CheckCircle2, X, Loader2 } from "lucide-react";
import { especialidadesService } from "@/services/especialidades";
import { disponibilidadService } from "@/services/disponibilidad";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const TIME_BLOCKS: string[] = [];
for (let h = 7; h <= 21; h++) {
  for (const m of [0, 30]) {
    TIME_BLOCKS.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
  }
}

type SlotStatus = "aprobado" | "anulado";

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
  const [consultorioCount, setConsultorioCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [popover, setPopover] = useState<{ day: string; block: string; doctor: string; specialty: string; index: number; idBloque: number } | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [localChanges, setLocalChanges] = useState<Record<string, SlotStatus>>({});

  useEffect(() => {
    especialidadesService.getAll().then(res => setSpecialties(res.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (specialty !== null) {
      setLoading(true);
      setLocalChanges({});
      setConsultorioCount(0);
      Promise.all([
        disponibilidadService.getPendientes(specialty),
        especialidadesService.getCantidadConsultorios(specialty),
      ])
        .then(([propRes, consRes]) => {
          setProposals(propRes.data ?? []);
          setConsultorioCount(consRes.data?.cantidad ?? 0);
        })
        .catch(() => { setProposals([]); setConsultorioCount(0); })
        .finally(() => setLoading(false));
    }
  }, [specialty]);

  const grid = useMemo(() => {
    const g: Record<string, Record<string, SlotInfo[]>> = {};
    for (const day of DAYS) { g[day] = {}; for (const block of TIME_BLOCKS) g[day][block] = []; }

    const slotConflictCount: Record<string, number> = {};

    for (const p of proposals) {
      const medico = (p.medico ?? "") as string;
      for (const b of (p.bloquesHorario ?? []) as any[]) {
        let dayIdx = 0;
        if (b.fecha) {
          const d = new Date(b.fecha + "T00:00:00");
          dayIdx = (d.getDay() + 6) % 7;
        }
        const dayName = DAYS[dayIdx];
        const blockTime = (b.horaInicio ?? "").slice(0, 5);
        const conflictKey = `${b.fecha}_${blockTime}`;
        slotConflictCount[conflictKey] = (slotConflictCount[conflictKey] ?? 0) + 1;
      }
    }

    for (const p of proposals) {
      const medico = (p.medico ?? "") as string;
      for (const b of (p.bloquesHorario ?? []) as any[]) {
        let dayIdx = 0;
        if (b.fecha) {
          const d = new Date(b.fecha + "T00:00:00");
          dayIdx = (d.getDay() + 6) % 7;
        }
        const dayName = DAYS[dayIdx];
        const blockTime = (b.horaInicio ?? "").slice(0, 5);
        const conflictKey = `${b.fecha}_${blockTime}`;
        const hasConflict = consultorioCount > 0 && (slotConflictCount[conflictKey] ?? 0) > consultorioCount;
        if (g[dayName]?.[blockTime]) {
          g[dayName][blockTime].push({
            idBloque: b.idBloque ?? 0,
            doctor: medico,
            specialty: "",
            status: "aprobado",
            conflict: hasConflict,
          });
        }
      }
    }
    return g;
  }, [proposals, consultorioCount]);

  const getEffectiveStatus = (day: string, block: string, slot: SlotInfo): string => {
    const key = `${day}_${block}_${slot.idBloque}`;
    if (localChanges[key] !== undefined) return localChanges[key];
    if (slot.conflict) return "conflicto";
    return "aprobado";
  };

  const handleLocalSave = (day: string, block: string, slot: SlotInfo, newStatus: "aprobado" | "anulado") => {
    const key = `${day}_${block}_${slot.idBloque}`;
    setLocalChanges(prev => ({ ...prev, [key]: newStatus }));
    setPopover(null);
  };

  const slotsForSpecialty = (day: string, block: string): SlotInfo[] => {
    return grid[day]?.[block] ?? [];
  };

  const statusStyle = (status: string): string => {
    if (status === "aprobado") return "bg-[#0AC0AB] text-white border-[#0AC0AB]";
    if (status === "anulado") return "bg-[#555555] text-white border-[#555555] line-through";
    if (status === "conflicto") return "bg-[#FF82B6]/20 text-[#d45c8b] border-[#FF82B6] ring-2 ring-[#FF82B6]";
    return "bg-gray-100 text-gray-400";
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

      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[#0AC0AB] text-white border-[#0AC0AB]">Aprobado</span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[#555555] text-white border-[#555555]">Anulado</span>
        <span className="flex items-center gap-1.5"><AlertTriangle size={12} className="text-[#FF82B6]" /> Conflicto de horario</span>
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
                            const effStatus = getEffectiveStatus(day, block, slot);
                            return (
                  <div key={i}
                    onClick={() => setPopover({ day, block, doctor: slot.doctor, specialty: slot.specialty, index: i, idBloque: slot.idBloque })}
                                className={`relative px-1 py-0.5 rounded border cursor-pointer transition-colors ${statusStyle(effStatus)}`}>
                                <p className="truncate max-w-[90px] font-medium">{slot.doctor}</p>
                                {effStatus === "conflicto" && (
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

      {(() => {
        let hasConflicts = false;
        for (const [day, daySlots] of Object.entries(grid)) {
          for (const [block, slots] of Object.entries(daySlots)) {
            for (const slot of slots) {
              if (getEffectiveStatus(day, block, slot) === "conflicto") {
                hasConflicts = true;
              }
            }
          }
        }
        const hasProposals = Object.values(grid).some(daySlots =>
          Object.values(daySlots).some(slots => slots.length > 0)
        );
        if (!hasProposals) return null;
        return (
          <div className="flex justify-end mt-4">
            <button
              disabled={hasConflicts}
              onClick={async () => {
                const updates: { idAsignacion: number; aprobado: boolean }[] = [];
                for (const [day, daySlots] of Object.entries(grid)) {
                  for (const [block, slots] of Object.entries(daySlots)) {
                    for (const slot of slots) {
                      const status = getEffectiveStatus(day, block, slot);
                      updates.push({
                        idAsignacion: slot.idBloque,
                        aprobado: status === "aprobado",
                      });
                    }
                  }
                }
                try {
                  await disponibilidadService.actualizar(updates);
                  setSuccessMsg("Disponibilidad aprobada exitosamente.");
                  if (specialty !== null) {
                    setLoading(true);
                    Promise.all([
                      disponibilidadService.getPendientes(specialty),
                      especialidadesService.getCantidadConsultorios(specialty),
                    ])
                      .then(([propRes, consRes]) => {
                        setProposals(propRes.data ?? []);
                        setConsultorioCount(consRes.data?.cantidad ?? 0);
                      })
                      .catch(() => { setProposals([]); setConsultorioCount(0); })
                      .finally(() => setLoading(false));
                  }
                  setLocalChanges({});
                } catch {
                  setSuccessMsg("Error al guardar la disponibilidad.");
                }
                setTimeout(() => setSuccessMsg(""), 3000);
              }}
              className="px-8 py-3 bg-[#0AC0AB] text-white rounded-lg font-semibold hover:bg-[#059688] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
              Aprobar Todo
            </button>
          </div>
        );
      })()}

      {popover && (() => {
        const cs = grid[popover.day]?.[popover.block]?.[popover.index];
        const safeSlot: SlotInfo = cs ?? {
          idBloque: popover.idBloque, doctor: popover.doctor,
          specialty: popover.specialty, status: "aprobado", conflict: false,
        };
        return (
          <PopoverPanel
            currentSlot={safeSlot}
            doctor={popover.doctor}
            specialty={popover.specialty}
            currentStatus={getEffectiveStatus(popover.day, popover.block, safeSlot)}
            onClose={() => setPopover(null)}
            onSave={(newStatus) => handleLocalSave(popover.day, popover.block, safeSlot, newStatus)}
          />
        );
      })()}
    </div>
  );
}

function PopoverPanel({
  currentSlot, doctor, specialty, currentStatus, onClose, onSave,
}: {
  currentSlot: SlotInfo;
  doctor: string;
  specialty: string;
  currentStatus: string;
  onClose: () => void;
  onSave: (status: "aprobado" | "anulado") => void;
}) {
  const [selectedAction, setSelectedAction] = useState<"aprobado" | "anulado">(
    currentStatus === "anulado" ? "anulado" : "aprobado"
  );

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
          {currentStatus === "conflicto" && (
            <p className="text-xs text-[#d45c8b] flex items-center gap-1 mt-2">
              <AlertTriangle size={12} /> Conflicto de consultorios
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#05576D] mb-2">Estado del bloque</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setSelectedAction("aprobado")}
              className={`py-2.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedAction === "aprobado"
                  ? "bg-[#0AC0AB] text-white border-[#0AC0AB] ring-2 ring-[#0AC0AB]/40"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}>
              Aprobado
            </button>
            <button onClick={() => setSelectedAction("anulado")}
              className={`py-2.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedAction === "anulado"
                  ? "bg-[#555555] text-white border-[#555555] ring-2 ring-gray-400"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}>
              Anulado
            </button>
          </div>
        </div>
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { onSave(selectedAction); onClose(); }}
            className="flex-1 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
