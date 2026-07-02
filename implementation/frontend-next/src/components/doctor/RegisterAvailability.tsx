"use client";
import { useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { DAYS_SHORT, getMonthYear } from "@/lib/utils";

const HOURS: string[] = [];
for (let h = 8; h <= 19; h++) {
  for (const m of [0, 30]) {
    HOURS.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
  }
}

const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export function RegisterAvailability() {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, Record<string, string>>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState<{ day: string; startIdx: number } | null>(null);

  const today = new Date(2026, 5, 7);
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 3);
  const sampleWeekStart = new Date(2026, 5, 8);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sampleWeekStart);
    d.setDate(sampleWeekStart.getDate() + i);
    return d;
  });

  const toggleCell = useCallback((day: string, idx: number) => {
    setSelections(prev => {
      const current = [...(prev[day] || [])];
      const timeStr = HOURS[idx];
      const i = current.indexOf(timeStr);
      if (i >= 0) current.splice(i, 1);
      else current.push(timeStr);
      current.sort();
      const newPrev = { ...prev, [day]: current };

      // Validate: 30-min blocks must be in groups of 2+
      const errors: Record<string, string> = {};
      const sorted = [...current].sort();
      for (let j = 0; j < sorted.length; j++) {
        const t = sorted[j];
        const tIdx = HOURS.indexOf(t);
        const hasPrev = j > 0 && HOURS.indexOf(sorted[j-1]) === tIdx - 1;
        const hasNext = j < sorted.length - 1 && HOURS.indexOf(sorted[j+1]) === tIdx + 1;
        if (!hasPrev && !hasNext) {
          errors[t] = "Error: Bloque menor a 1 hora";
        }
      }
      newPrev.validationErrors = { ...prev.validationErrors, [day]: errors };
      (newPrev as any).validationErrors = { ...(prev as any).validationErrors, [day]: errors };
      return newPrev;
    });
  }, []);

  const handleMouseDown = (day: string, idx: number) => setDragging({ day, startIdx: idx });
  const handleMouseEnter = (day: string, idx: number) => {
    if (dragging && dragging.day === day) {
      const start = Math.min(dragging.startIdx, idx);
      const end = Math.max(dragging.startIdx, idx);
      setSelections(prev => {
        const selected = HOURS.slice(start, end + 1);
        const existing = prev[day] || [];
        const merged = [...new Set([...existing, ...selected])].sort();
        return { ...prev, [day]: merged };
      });
    }
  };
  const handleMouseUp = () => setDragging(null);

  const totalBlocks = Object.values(selections).reduce((sum, arr) => sum + arr.length, 0);
  const canSubmit = totalBlocks > 0;

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
          <div className="w-16 h-16 bg-[#0AC0AB]/15 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={36} className="text-[#0AC0AB]" /></div>
          <h2 className="text-[#05576D] mb-2 text-xl font-bold">Propuesta Enviada</h2>
          <p className="text-gray-500 text-sm mb-6">Su propuesta de disponibilidad semanal ha sido enviada y está pendiente de aprobación.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
            <p className="text-xs text-gray-500">Bloques seleccionados: <strong>{totalBlocks}</strong></p>
            {Object.entries(selections).map(([day, times]) => (
              <p key={day} className="text-xs"><strong>{day}:</strong> {times[0]} - {times[times.length-1]}</p>
            ))}
          </div>
          <button onClick={() => { setSubmitted(false); setSelections({}); }}
            className="w-full bg-[#006FC1] text-white py-2.5 rounded-lg font-medium hover:bg-[#005a9e] transition-colors text-sm">Registrar otra disponibilidad</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-[#05576D] mb-6 text-2xl font-bold">Registrar Mi Disponibilidad</h1>

      <div className="bg-[#0F96CB]/10 border border-[#0F96CB]/30 rounded-xl px-4 py-3 mb-5 flex items-start gap-2 text-sm">
        <Info size={16} className="text-[#0F96CB] mt-0.5 flex-shrink-0" />
        <p className="text-[#05576D]">Los horarios deben ser de al menos 1 hora (2 bloques consecutivos). Se requiere mínimo 48 horas de anticipación.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-[#05576D] mb-4 text-base">Seleccione sus bloques disponibles</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th className="text-left px-2 py-1.5 text-gray-500 font-medium w-16">Hora</th>
                    {weekDays.map((d, i) => (
                      <th key={i} className="text-center px-2 py-1.5 text-gray-500 font-medium">
                        <p>{DAY_NAMES[i].slice(0,3)}</p>
                        <p className="text-[10px] text-gray-400">{d.getDate()}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map((time, idx) => (
                    <tr key={time} className="border-t border-gray-50">
                      <td className="px-2 py-1 text-gray-500 text-[10px] whitespace-nowrap">{time}</td>
                      {weekDays.map((_, dayIdx) => {
                        const dayName = DAY_NAMES[dayIdx];
                        const isSelected = selections[dayName]?.includes(time);
                        const error = (selections as any).validationErrors?.[dayName]?.[time];
                        const isPast = false; // All days in our week are future
                        return (
                          <td key={dayIdx} className={`px-1 py-0.5 ${isPast ? "bg-gray-100" : ""}`}>
                            <button
                              disabled={isPast}
                              onMouseDown={() => !isPast && handleMouseDown(dayName, idx)}
                              onMouseEnter={() => !isPast && handleMouseEnter(dayName, idx)}
                              onMouseUp={handleMouseUp}
                              onClick={() => !isPast && toggleCell(dayName, idx)}
                              className={`w-full py-2 rounded text-[10px] font-medium transition-colors border ${isPast ? "bg-gray-100 text-gray-300 cursor-not-allowed" : isSelected ? error ? "bg-[#FF82B6]/40 text-[#d45c8b] border-[#FF82B6]/50" : "bg-[#006FC1] text-white border-[#006FC1]" : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-[#006FC1]/10"}`}
                            >
                              {isSelected ? (error ? "!" : "✓") : ""}
                            </button>
                            {error && <p className="text-[8px] text-[#FF82B6] leading-tight mt-0.5">{error}</p>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-4 mt-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#006FC1] inline-block" />Seleccionado</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#FF82B6]/40 inline-block" />Error (&lt;1h)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-100 inline-block" />No disponible</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-6">
            <h2 className="font-semibold text-[#05576D] mb-4 text-base">Resumen</h2>
            {totalBlocks === 0 ? (
              <p className="text-sm text-gray-400">Seleccione bloques en el calendario</p>
            ) : (
              <>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {Object.entries(selections).map(([day, times]) => {
                    if (times.length === 0) return null;
                    return (
                      <div key={day} className="p-2 bg-[#006FC1]/5 rounded-xl border border-[#006FC1]/20">
                        <p className="text-xs font-medium text-[#05576D] mb-1">{day}</p>
                        <p className="text-xs text-[#006FC1]">{times[0]} — {times[times.length-1]}</p>
                        <p className="text-[10px] text-gray-400">{Math.ceil(times.length/2)}h</p>
                      </div>
                    );
                  })}
                </div>
                <button disabled={!canSubmit} onClick={() => setShowConfirm(true)}
                  className="w-full py-3 bg-[#006FC1] text-white rounded-lg font-semibold hover:bg-[#005a9e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">Enviar Propuesta</button>
              </>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-[#05576D] mb-3 text-lg">Confirmar Envío</h3>
            <p className="text-sm text-gray-600 mb-4">¿Desea enviar su propuesta de disponibilidad semanal? Será revisada por administración para asignación de consultorios.</p>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
              {Object.entries(selections).map(([day, times]) => (
                times.length > 0 && <div key={day} className="text-sm text-gray-600"><span className="w-2 h-2 rounded-full bg-[#0AC0AB] inline-block mr-2" /><strong>{day}:</strong> {times[0]} - {times[times.length-1]}</div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => { setShowConfirm(false); setSubmitted(true); }}
                className="flex-1 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e]">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
