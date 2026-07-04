"use client";
import { useState, useMemo, useEffect } from "react";
import { ChevronRight, ChevronLeft, CheckCircle2, Baby, Heart, Stethoscope, Calendar, Loader2 } from "lucide-react";
import { getMonthYear, DAYS_SHORT, toDateStr } from "@/lib/utils";
import { apiGet } from "@/lib/api";
import type { Especialidad, Medico, Horario } from "@/lib/types";

function specialtyIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("ginecolog")) return <Heart size={28} className="text-[#FF82B6]" />;
  if (n.includes("obstetric")) return <Baby size={28} className="text-[#0AC0AB]" />;
  return <Stethoscope size={28} className="text-[#006FC1]" />;
}

export function BookAppointment({ userName }: { userName: string }) {
  const [step, setStep] = useState(1);
  const [specialty, setSpecialty] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [doctores, setDoctores] = useState<Medico[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loadingEsp, setLoadingEsp] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingHors, setLoadingHors] = useState(false);

  useEffect(() => {
    setLoadingEsp(true);
    apiGet<Especialidad[]>('/especialidades')
      .then(r => setEspecialidades(r.data))
      .catch(() => {})
      .finally(() => setLoadingEsp(false));
  }, []);

  useEffect(() => {
    if (!specialty) { setDoctores([]); return; }
    setLoadingDocs(true);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime(null);
    apiGet<Medico[]>(`/especialidades/${specialty}/medicos`)
      .then(r => setDoctores(r.data))
      .catch(() => setDoctores([]))
      .finally(() => setLoadingDocs(false));
  }, [specialty]);

  useEffect(() => {
    if (!selectedDoctor) { setHorarios([]); return; }
    setLoadingHors(true);
    setSelectedDate(null);
    setSelectedTime(null);
    apiGet<Horario[]>(`/medicos/${selectedDoctor}/horarios`)
      .then(r => setHorarios(r.data))
      .catch(() => setHorarios([]))
      .finally(() => setLoadingHors(false));
  }, [selectedDoctor]);

  const doctorObj = useMemo(() => {
    return doctores.find(d => d.idMedico === selectedDoctor) || null;
  }, [doctores, selectedDoctor]);

  const horarioFechasSet = useMemo(() => new Set(horarios.map(h => h.fecha)), [horarios]);

  const calendarDays = useMemo(() => {
    if (horarios.length === 0) return [];
    const uniqueDates = [...new Set(horarios.map(h => h.fecha))].sort();
    const firstDate = new Date(uniqueDates[0] + 'T00:00:00');
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { date: Date; available: boolean; disabled: boolean }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateStr = toDateStr(d);
      const isAvail = horarioFechasSet.has(dateStr);
      days.push({ date: d, available: isAvail, disabled: !isAvail });
    }
    return days;
  }, [horarios]);

  const currentMonth = useMemo(() => {
    if (calendarDays.length === 0) return new Date();
    return calendarDays[0].date;
  }, [calendarDays]);

  const firstDayOfMonth = useMemo(() => {
    if (calendarDays.length === 0) return 0;
    const d = calendarDays[0].date;
    return new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  }, [calendarDays]);

  const doctorTimeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = toDateStr(selectedDate);
    return horarios
      .filter(h => h.fecha === dateStr)
      .map(h => ({ time: h.horaInicio.slice(0, 5), available: true }));
  }, [horarios, selectedDate]);

  const canNext = () => {
    if (step === 1) return specialty !== null;
    if (step === 2) return selectedDoctor !== null;
    if (step === 3) return selectedDate !== null;
    return false;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[#05576D] mb-6 text-2xl font-bold">Reservar una Cita</h1>
      <div className="flex items-center mb-8">
        {[1, 2, 3, 4].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step > s ? "bg-[#0AC0AB] text-white" : step === s ? "bg-[#006FC1] text-white" : "bg-gray-200 text-gray-500"}`}>
              {step > s ? <CheckCircle2 size={16} /> : s}
            </div>
            <span className={`ml-2 text-sm ${step >= s ? "text-[#05576D] font-medium" : "text-gray-400"}`}>
              {["Especialidad", "Doctores", "Fecha", "Horario"][i]}
            </span>
            {i < 3 && <div className={`flex-1 h-0.5 mx-3 min-w-8 ${step > s ? "bg-[#0AC0AB]" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {step === 1 && (
          <div>
            <h2 className="text-[#05576D] text-lg font-semibold mb-1">Seleccione una Especialidad</h2>
            <p className="text-gray-500 mb-5 text-sm">Elija la especialidad médica que necesita</p>
            {loadingEsp ? (
              <div className="flex items-center justify-center py-12 text-gray-500 text-sm gap-2">
                <Loader2 size={18} className="animate-spin" /> Cargando especialidades...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {especialidades.map(sp => (
                  <button key={sp.idEspecialidad} onClick={() => { setSpecialty(sp.idEspecialidad); setSelectedDoctor(null); setSelectedDate(null); setSelectedTime(null); }}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${specialty === sp.idEspecialidad ? "border-[#006FC1] bg-[#006FC1]/5" : "border-gray-200 hover:border-[#0F96CB]/50 hover:bg-gray-50"}`}>
                    <div className="mb-3">{specialtyIcon(sp.nombre)}</div>
                    <p className="font-semibold text-[#05576D] text-sm">{sp.nombre}</p>
                    <p className="text-gray-500 mt-1 text-xs">{sp.descripcion}</p>
                    {specialty === sp.idEspecialidad && <div className="mt-3 flex items-center gap-1 text-[#006FC1] text-xs"><CheckCircle2 size={14} /> <span>Seleccionada</span></div>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-[#05576D] text-lg font-semibold mb-4">Seleccione un Doctor</h2>
            {loadingDocs ? (
              <div className="flex items-center justify-center py-12 text-gray-500 text-sm gap-2">
                <Loader2 size={18} className="animate-spin" /> Cargando doctores...
              </div>
            ) : doctores.length === 0 ? (
              <p className="text-gray-500 text-sm py-12 text-center">No hay doctores disponibles para esta especialidad.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {doctores.map(doc => (
                  <button key={doc.idMedico} onClick={() => { setSelectedDoctor(doc.idMedico); setSelectedDate(null); setSelectedTime(null); }}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${selectedDoctor === doc.idMedico ? "border-[#006FC1] bg-[#006FC1]/5 ring-2 ring-[#006FC1]/20" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-[#0F96CB]/20 flex items-center justify-center text-[#0F96CB] font-bold text-xl flex-shrink-0">
                        {doc.nombre.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#05576D] text-sm">{doc.nombre}</p>
                        {selectedDoctor === doc.idMedico && (
                          <span className="inline-flex items-center mt-2 text-xs text-[#006FC1] font-medium">
                            <CheckCircle2 size={12} className="mr-1" /> Seleccionado
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-[#05576D] text-lg font-semibold mb-1">Seleccione una Fecha</h2>
            <p className="text-gray-500 mb-5 text-sm">
              Fechas disponibles para <strong>{doctorObj?.nombre}</strong>
            </p>
            {loadingHors ? (
              <div className="flex items-center justify-center py-12 text-gray-500 text-sm gap-2">
                <Loader2 size={18} className="animate-spin" /> Cargando horarios...
              </div>
            ) : calendarDays.length === 0 || calendarDays.filter(d => d.available).length === 0 ? (
              <div className="py-12 text-center">
                <Calendar size={44} className="mx-auto text-[#0AC0AB] mb-3" />
                <p className="text-gray-500">No hay disponibilidad para este doctor. Por favor seleccione otro.</p>
              </div>
            ) : (
              <div className="max-w-sm">
                <p className="font-semibold text-[#05576D] mb-4">{getMonthYear(currentMonth)}</p>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS_SHORT.map(d => <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
                  {calendarDays.map((day, i) => {
                    const isSel = selectedDate?.toDateString() === day.date.toDateString();
                    return (
                      <button key={i} disabled={day.disabled || !day.available} onClick={() => { setSelectedDate(day.date); setSelectedTime(null); }}
                        className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-colors ${day.disabled ? "text-gray-300 cursor-not-allowed" : isSel ? "bg-[#006FC1] text-white font-semibold" : day.available ? "bg-[#0AC0AB]/20 text-[#05576D] hover:bg-[#0AC0AB]/40 font-medium" : "text-gray-400 cursor-not-allowed"}`}>
                        {day.date.getDate()}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0AC0AB]/30 inline-block" />Disponible</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-200 inline-block" />No disponible</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-[#05576D] text-lg font-semibold mb-1">Seleccione un Horario</h2>
            <p className="text-gray-500 mb-2 text-sm">
              <strong>{doctorObj?.nombre}</strong> &middot; {selectedDate?.toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            {doctorTimeSlots.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No hay horarios disponibles para esta fecha.</p>
            ) : (
              <>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {doctorTimeSlots.map((slot, i) => (
                    <button key={i}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedTime === slot.time ? "bg-[#006FC1] text-white" : "bg-[#0AC0AB]/20 text-[#05576D] hover:bg-[#0AC0AB]/40"}`}>
                      {slot.time}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0AC0AB]/30 inline-block" />Disponible</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#006FC1] inline-block" />Seleccionado</span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm">
            <ChevronLeft size={16} /> Anterior
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#006FC1] text-white hover:bg-[#005a9e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium">
              Siguiente <ChevronRight size={16} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
