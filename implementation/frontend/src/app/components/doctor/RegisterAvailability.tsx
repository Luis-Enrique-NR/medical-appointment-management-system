import { useState } from "react";
import {
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const TIME_OPTIONS: string[] = [];
for (let h = 7; h <= 20; h++) {
  for (const m of [0, 30]) {
    if (h === 20 && m === 30) break;
    TIME_OPTIONS.push(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    );
  }
}

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DAYS_ES = [
  "Dom",
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface TimeBlock {
  id: string;
  start: string;
  end: string;
}

function hasOverlap(blocks: TimeBlock[]): boolean {
  const sorted = [...blocks].sort((a, b) =>
    a.start.localeCompare(b.start),
  );
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].end > sorted[i + 1].start) return true;
  }
  return false;
}

function parseTimeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function RegisterAvailability() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    null,
  );
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const today = new Date(2026, 5, 7);
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 2);

  const calendarStart = new Date(2026, 5, 1);
  const daysInMonth = 30;

  const addBlock = () => {
    setTimeBlocks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        start: "08:00",
        end: "10:00",
      },
    ]);
  };

  const removeBlock = (id: string) => {
    setTimeBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBlock = (
    id: string,
    field: "start" | "end",
    value: string,
  ) => {
    setTimeBlocks((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, [field]: value } : b,
      ),
    );
  };

  const overlap = hasOverlap(timeBlocks);
  const hasInvalidBlocks = timeBlocks.some(
    (b) => parseTimeToMin(b.start) >= parseTimeToMin(b.end),
  );

  const canSubmit =
    selectedDate &&
    timeBlocks.length > 0 &&
    !overlap &&
    !hasInvalidBlocks;

  const handleSubmit = () => {
    setShowConfirm(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
          <div className="w-16 h-16 bg-[#0AC0AB]/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2
              size={36}
              className="text-[#0AC0AB]"
            />
          </div>
          <h2
            className="text-[#05576D] mb-2"
            style={{ fontSize: 20, fontWeight: 700 }}
          >
            Propuesta Enviada
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Su propuesta de disponibilidad ha sido enviada y
            está pendiente de aprobación por el equipo
            administrativo.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">
                Fecha:
              </span>
              <span className="text-sm font-medium">
                {selectedDate?.toLocaleDateString("es-PE", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">
                Bloques:
              </span>
              <span className="text-sm font-medium">
                {timeBlocks.length} bloque
                {timeBlocks.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setSelectedDate(null);
              setTimeBlocks([]);
            }}
            className="w-full bg-[#006FC1] text-white py-2.5 rounded-lg font-medium hover:bg-[#005a9e] transition-colors"
          >
            Registrar otra disponibilidad
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1
        className="text-[#05576D] mb-6"
        style={{ fontSize: 24, fontWeight: 700 }}
      >
        Registrar Mi Disponibilidad
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Steps */}
        <div className="lg:col-span-2 space-y-5">
          {/* Step 1: Date */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2
              className="font-semibold text-[#05576D] mb-4"
              style={{ fontSize: 16 }}
            >
              1. Seleccione una Fecha
            </h2>
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-[#05576D] text-sm">
                {MONTHS_ES[5]} 2026
              </p>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_ES.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-medium text-gray-400 py-1"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({
                length: calendarStart.getDay(),
              }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map(
                (_, i) => {
                  const d = new Date(2026, 5, i + 1);
                  const tooSoon = d <= minDate;
                  const isSelected =
                    selectedDate &&
                    toDateStr(selectedDate) === toDateStr(d);
                  const isPast = d < today;
                  return (
                    <button
                      key={i}
                      disabled={tooSoon || isPast}
                      onClick={() => setSelectedDate(d)}
                      title={
                        tooSoon
                          ? "Debe enviarse con al menos 48 horas de anticipación"
                          : undefined
                      }
                      className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-colors ${
                        isPast
                          ? "text-gray-300 cursor-not-allowed"
                          : isSelected
                            ? "bg-[#006FC1] text-white font-semibold"
                            : tooSoon
                              ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                              : "text-[#05576D] hover:bg-[#006FC1]/10 hover:text-[#006FC1]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                },
              )}
            </div>
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
              <AlertCircle size={12} /> Las fechas dentro de las
              48 horas siguientes no están disponibles
            </p>
          </div>

          {/* Step 2: Time blocks */}
          {selectedDate && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="font-semibold text-[#05576D]"
                  style={{ fontSize: 16 }}
                >
                  2. Bloques de Tiempo
                </h2>
                <button
                  onClick={addBlock}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#006FC1] text-white text-sm rounded-lg hover:bg-[#005a9e] transition-colors"
                >
                  <Plus size={15} /> Agregar bloque
                </button>
              </div>

              {timeBlocks.length === 0 ? (
                <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-sm">
                    Agregue bloques de horario para este día
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeBlocks.map((block) => {
                    const invalid =
                      parseTimeToMin(block.start) >=
                      parseTimeToMin(block.end);
                    return (
                      <div
                        key={block.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${invalid ? "border-[#FF82B6] bg-[#FF82B6]/5" : "border-gray-200"}`}
                      >
                        <div className="flex items-center gap-2 flex-1 flex-wrap">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Inicio
                            </label>
                            <select
                              value={block.start}
                              onChange={(e) =>
                                updateBlock(
                                  block.id,
                                  "start",
                                  e.target.value,
                                )
                              }
                              className="px-2 py-1.5 border border-[#05576D]/20 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#006FC1]"
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="text-gray-400 mt-4">
                            —
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Fin
                            </label>
                            <select
                              value={block.end}
                              onChange={(e) =>
                                updateBlock(
                                  block.id,
                                  "end",
                                  e.target.value,
                                )
                              }
                              className="px-2 py-1.5 border border-[#05576D]/20 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#006FC1]"
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>
                          {invalid && (
                            <p className="text-xs text-[#FF82B6] mt-4">
                              La hora de fin debe ser posterior
                              al inicio
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeBlock(block.id)}
                          className="mt-4 p-1.5 text-gray-400 hover:text-[#d45c8b] rounded-lg hover:bg-[#FF82B6]/10 transition-colors flex-shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                  {overlap && (
                    <div className="flex items-center gap-2 text-[#d45c8b] bg-[#FF82B6]/10 border border-[#FF82B6]/30 px-3 py-2 rounded-lg text-sm">
                      <AlertTriangle size={15} /> Los bloques de
                      tiempo se superponen
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Summary (sticky) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-6">
            <h2
              className="font-semibold text-[#05576D] mb-4"
              style={{ fontSize: 16 }}
            >
              Resumen
            </h2>
            {!selectedDate ? (
              <p className="text-sm text-gray-400">
                Seleccione una fecha para ver el resumen
              </p>
            ) : (
              <>
                <div className="mb-4 p-3 bg-[#006FC1]/5 rounded-xl border border-[#006FC1]/20">
                  <p className="text-xs text-gray-500 mb-1">
                    Fecha seleccionada
                  </p>
                  <p className="font-semibold text-[#05576D] text-sm">
                    {selectedDate.toLocaleDateString("es-PE", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {timeBlocks.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {timeBlocks.map((b) => (
                      <div
                        key={b.id}
                        className="flex justify-between items-center py-1.5 border-b border-gray-50"
                      >
                        <span className="text-sm text-gray-600">
                          {b.start} — {b.end}
                        </span>
                        <span className="text-xs text-[#0AC0AB] font-medium">
                          {Math.floor(
                            (parseTimeToMin(b.end) -
                              parseTimeToMin(b.start)) /
                              60,
                          )}
                          h
                          {(parseTimeToMin(b.end) -
                            parseTimeToMin(b.start)) %
                            60 >
                          0
                            ? ` ${(parseTimeToMin(b.end) - parseTimeToMin(b.start)) % 60}m`
                            : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mb-4">
                    Sin bloques de tiempo
                  </p>
                )}

                <button
                  disabled={!canSubmit}
                  onClick={() => setShowConfirm(true)}
                  className="w-full py-3 bg-[#006FC1] text-white rounded-lg font-semibold hover:bg-[#005a9e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Enviar Propuesta
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3
              className="font-semibold text-[#05576D] mb-2"
              style={{ fontSize: 17 }}
            >
              Confirmar Envío
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Desea enviar su disponibilidad para{" "}
              <strong>
                {selectedDate?.toLocaleDateString("es-PE", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </strong>
              ? Esta propuesta será revisada por el equipo
              administrativo.
            </p>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
              {timeBlocks.map((b) => (
                <div
                  key={b.id}
                  className="text-sm text-gray-600 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-[#0AC0AB] flex-shrink-0" />
                  {b.start} — {b.end}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}