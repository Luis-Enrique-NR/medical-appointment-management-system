"use client";
import { useState, useMemo, useEffect } from "react";
import { AlertTriangle, CheckCircle2, X, Loader2, ThumbsUp, ThumbsDown, Save, ShieldCheck } from "lucide-react";
import { especialidadesService } from "@/services/especialidades";
import { disponibilidadService } from "@/services/disponibilidad";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const TIME_BLOCKS: string[] = [];
for (let h = 7; h <= 21; h++) {
  for (const m of [0, 30]) {
    TIME_BLOCKS.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
  }
}

const MAX_ROOMS = 6;

type SlotStatus = "por_revisar" | "aprobado" | "anulado";

interface SlotInfo {
  idBloque: number;
  doctor: string;
  specialty: string;
}

function makeKey(day: string, block: string, idx: number) {
  return `${day}|${block}|${idx}`;
}

export function ManageDoctorAvailability() {
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [specialty, setSpecialty] = useState<number | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [popover, setPopover] = useState<{ day: string; block: string; doctor: string; specialty: string; index: number; idBloque: number } | null>(null);
  const [localDecisions, setLocalDecisions] = useState<Record<string, SlotStatus>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    especialidadesService.getAll().then(res => setSpecialties(res.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (specialty !== null) {
      setLoading(true);
      setLocalDecisions({});
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
          });
        }
      }
    }
    return g;
  }, [proposals]);

  const reviewedGrid = useMemo(() => {
    const conflictCells = new Set<string>();
    const approvedCount: Record<string, number> = {};

    for (const day of DAYS) {
      for (const block of TIME_BLOCKS) {
        const slots = grid[day]?.[block] ?? [];
        let count = 0;
        for (let i = 0; i < slots.length; i++) {
          const k = makeKey(day, block, i);
          if (localDecisions[k] === "aprobado") count++;
        }
        approvedCount[`${day}|${block}`] = count;
        if (count > MAX_ROOMS) conflictCells.add(`${day}|${block}`);
      }
    }

    const result: Record<string, Record<string, { slot: SlotInfo; status: SlotStatus; conflict: boolean }[]>> = {};
    for (const day of DAYS) {
      result[day] = {};
      for (const block of TIME_BLOCKS) {
        const slots = grid[day]?.[block] ?? [];
        result[day][block] = slots.map((slot, i) => {
          const k = makeKey(day, block, i);
          const status = localDecisions[k] ?? "por_revisar";
          const cellKey = `${day}|${block}`;
          const conflict = conflictCells.has(cellKey) && status === "aprobado";
          return { slot, status, conflict };
        });
      }
    }
    return result;
  }, [grid, localDecisions]);

  const overcapacityAlerts = useMemo(() => {
    const alerts: { day: string; block: string; approved: number }[] = [];
    for (const day of DAYS) {
      for (const block of TIME_BLOCKS) {
        const items = reviewedGrid[day]?.[block] ?? [];
        const approved = items.filter(i => i.status === "aprobado").length;
        if (approved > MAX_ROOMS) alerts.push({ day, block, approved });
      }
    }
    return alerts;
  }, [reviewedGrid]);

  const totalPending = useMemo(() => {
    let count = 0;
    for (const day of DAYS) {
      for (const block of TIME_BLOCKS) {
        const items = reviewedGrid[day]?.[block] ?? [];
        count += items.filter(i => i.status === "por_revisar").length;
      }
    }
    return count;
  }, [reviewedGrid]);

  const totalReviewed = useMemo(() => {
    let count = 0;
    for (const day of DAYS) {
      for (const block of TIME_BLOCKS) {
        const items = reviewedGrid[day]?.[block] ?? [];
        count += items.filter(i => i.status !== "por_revisar").length;
      }
    }
    return count;
  }, [reviewedGrid]);

  const handleBulk = (aprobar: boolean) => {
    const next: Record<string, SlotStatus> = {};
    for (const day of DAYS) {
      for (const block of TIME_BLOCKS) {
        const slots = grid[day]?.[block] ?? [];
        slots.forEach((_, i) => {
          const k = makeKey(day, block, i);
          next[k] = aprobar ? "aprobado" : "anulado";
        });
      }
    }
    setLocalDecisions(prev => ({ ...prev, ...next }));
  };

  const handleChangeStatus = (day: string, block: string, index: number, newStatus: SlotStatus) => {
    const k = makeKey(day, block, index);
    setLocalDecisions(prev => ({ ...prev, [k]: newStatus }));
    setPopover(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const cambios = Object.entries(localDecisions)
        .filter(([_, status]) => status !== "por_revisar")
        .map(([key, status]) => {
          const dayBlockIdx = key.split("|");
          const day = dayBlockIdx[0];
          const block = dayBlockIdx[1];
          const idx = parseInt(dayBlockIdx[2], 10);
          const slot = grid[day]?.[block]?.[idx];
          return { idAsignacion: slot?.idBloque ?? 0, aprobado: status === "aprobado" };
        });

      if (cambios.length === 0) return;

      await disponibilidadService.actualizar(cambios);
      setShowConfirm(false);
      setSuccessMsg(`Disponibilidad registrada: ${cambios.filter(c => c.aprobado).length} aprobados, ${cambios.filter(c => !c.aprobado).length} rechazados.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      setLocalDecisions({});
      if (specialty !== null) {
        const pend = await disponibilidadService.getPendientes(specialty);
        setProposals(pend.data ?? []);
      }
    } catch {
      setSuccessMsg("Error al registrar la disponibilidad.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = (status: SlotStatus, conflict: boolean): string => {
    if (status === "aprobado" && conflict) return "bg-[#FF82B6]/40 text-[#d45c8b] border-[#FF82B6] ring-2 ring-[#FF82B6]";
    if (status === "aprobado") return "bg-[#0AC0AB] text-white border-[#0AC0AB]";
    if (status === "anulado") return "bg-[#555555] text-white border-[#555555] line-through";
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

      {overcapacityAlerts.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {overcapacityAlerts.slice(0, 3).map(a => (
            <div key={`${a.day}-${a.block}`} className="flex items-center gap-1.5 bg-[#FF82B6]/15 border border-[#FF82B6]/30 text-[#d45c8b] px-3 py-1.5 rounded-lg text-xs">
              <AlertTriangle size={13} />
              {a.day} {a.block}: {a.approved} aprobados — supera los {MAX_ROOMS} consultorios disponibles
            </div>
          ))}
          {overcapacityAlerts.length > 3 && (
            <div className="text-xs text-gray-500 px-2 py-1.5">+{overcapacityAlerts.length - 3} más</div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-4 text-xs items-center">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[#0AC0AB] text-white border-[#0AC0AB]">Aprobado</span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[#E0E0E0] text-gray-700 border-gray-300">Por revisar</span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[#555555] text-white border-[#555555]">Anulado</span>
        <span className="flex items-center gap-1.5 text-gray-500"><AlertTriangle size={12} className="text-[#FF82B6]" /> Sobrecapacidad</span>
        <span className="flex-1" />
        <div className="flex gap-2">
          <button onClick={() => handleBulk(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0AC0AB] text-white rounded-lg text-xs font-medium hover:bg-[#059e8a] transition-colors disabled:opacity-40"
            disabled={proposals.length === 0}>
            <ThumbsUp size={13} /> Aprobar Todos
          </button>
          <button onClick={() => handleBulk(false)}
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
                    const items = reviewedGrid[day]?.[block] ?? [];
                    return (
                      <td key={day} className="px-0.5 py-0.5 align-top">
                        <div className="flex flex-col gap-0.5 min-h-5">
                          {items.map((item, i) => (
                            <div key={i}
                              onClick={() => setPopover({ day, block, doctor: item.slot.doctor, specialty: item.slot.specialty, index: i, idBloque: item.slot.idBloque })}
                              className={`relative px-1 py-0.5 rounded border cursor-pointer transition-colors ${statusStyle(item.status, item.conflict)}`}>
                              <p className="truncate max-w-[90px] font-medium">{item.slot.doctor}</p>
                              {item.conflict && (
                                <span className="absolute -top-1 -right-1"><AlertTriangle size={9} className="text-[#FF82B6]" /></span>
                              )}
                            </div>
                          ))}
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

      <div className="mt-5 flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="text-sm text-gray-600">
          <strong className="text-[#05576D]">{totalReviewed}</strong> revisados
          {totalPending > 0 && <span className="ml-3 text-gray-400"><strong>{totalPending}</strong> pendientes</span>}
          {overcapacityAlerts.length > 0 && (
            <span className="ml-3 text-[#d45c8b]"><AlertTriangle size={13} className="inline mr-1" />{overcapacityAlerts.length} conflicto(s) de capacidad</span>
          )}
        </div>
        <button
          disabled={totalReviewed === 0 || submitting}
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-semibold hover:bg-[#005a9e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <Save size={16} /> Registrar Disponibilidad
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !submitting && setShowConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#0AC0AB]/15 flex items-center justify-center"><ShieldCheck size={22} className="text-[#0AC0AB]" /></div>
              <div>
                <h3 className="font-semibold text-[#05576D] text-lg">Confirmar Registro</h3>
                <p className="text-xs text-gray-500">Esta acción enviará las decisiones al sistema</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5 text-sm">
              {(() => {
                const aprobados = Object.values(localDecisions).filter(v => v === "aprobado").length;
                const anulados = Object.values(localDecisions).filter(v => v === "anulado").length;
                return (
                  <>
                    <div className="flex justify-between"><span className="text-gray-500">Aprobados</span><strong className="text-[#0AC0AB]">{aprobados}</strong></div>
                    <div className="flex justify-between"><span className="text-gray-500">Rechazados</span><strong className="text-[#555555]">{anulados}</strong></div>
                    <hr className="border-gray-200 my-1" />
                    <div className="flex justify-between"><span className="text-gray-500">Total</span><strong>{aprobados + anulados}</strong></div>
                  </>
                );
              })()}
            </div>

            {overcapacityAlerts.length > 0 && (
              <div className="mb-4 flex items-start gap-2 bg-[#FF82B6]/15 border border-[#FF82B6]/30 rounded-lg px-3 py-2 text-xs text-[#d45c8b]">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{overcapacityAlerts.length} celda(s) superan los {MAX_ROOMS} consultorios. El sistema podría rechazar algunos bloques.</span>
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button disabled={submitting} onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button disabled={submitting} onClick={handleSubmit}
                className="flex-1 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : "Confirmar y Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {popover && (() => {
        const items = reviewedGrid[popover.day]?.[popover.block] ?? [];
        const safeItem = items[popover.index] ?? { slot: { idBloque: popover.idBloque, doctor: popover.doctor, specialty: popover.specialty }, status: "por_revisar" as SlotStatus, conflict: false };
        return (
          <PopoverPanel
            currentStatus={safeItem.status}
            doctor={popover.doctor}
            specialty={popover.specialty}
            conflict={safeItem.conflict}
            onClose={() => setPopover(null)}
            onChangeStatus={(status) => handleChangeStatus(popover.day, popover.block, popover.index, status)}
          />
        );
      })()}
    </div>
  );
}

function PopoverPanel({
  currentStatus, doctor, specialty, conflict, onClose, onChangeStatus,
}: {
  currentStatus: SlotStatus;
  doctor: string;
  specialty: string;
  conflict: boolean;
  onClose: () => void;
  onChangeStatus: (status: SlotStatus) => void;
}) {
  const [selectedAction, setSelectedAction] = useState<SlotStatus>(currentStatus ?? "por_revisar");

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#05576D] text-sm">Evaluar Bloque</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="space-y-1.5 text-sm mb-4 bg-gray-50 rounded-xl p-3">
          <p><span className="text-gray-500">Doctor:</span> <strong>{doctor}</strong></p>
          <p><span className="text-gray-500">Especialidad:</span> {specialty}</p>
          {conflict && (
            <div className="flex items-center gap-1.5 mt-2 text-[#d45c8b] bg-[#FF82B6]/10 rounded-lg px-2 py-1.5 text-xs">
              <AlertTriangle size={12} /> Sobrecapacidad en este horario
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#05576D] mb-2">Decisión</label>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setSelectedAction("por_revisar")}
              className={`py-2 rounded-lg text-xs font-medium border transition-colors ${selectedAction === "por_revisar" ? "bg-[#E0E0E0] text-gray-800 border-gray-400 ring-2 ring-gray-300" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
              Pendiente
            </button>
            <button onClick={() => setSelectedAction("aprobado")}
              className={`py-2 rounded-lg text-xs font-medium border transition-colors ${selectedAction === "aprobado" ? "bg-[#0AC0AB] text-white border-[#0AC0AB] ring-2 ring-[#0AC0AB]/40" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
              Aprobar
            </button>
            <button onClick={() => setSelectedAction("anulado")}
              className={`py-2 rounded-lg text-xs font-medium border transition-colors ${selectedAction === "anulado" ? "bg-[#555555] text-white border-[#555555] ring-2 ring-gray-400" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
              Rechazar
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button
            onClick={() => {
              if (selectedAction === currentStatus) { onClose(); return; }
              onChangeStatus(selectedAction);
            }}
            className="flex-1 py-2 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] transition-colors">
            Asignar
          </button>
        </div>
      </div>
    </div>
  );
}
