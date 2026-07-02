"use client";
import { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, CheckCircle2, Baby, Heart, Stethoscope, Calendar } from "lucide-react";
import { getMonthYear, DAYS_SHORT } from "@/lib/utils";

const SPECIALTIES = [
  { id: "gynecology", name: "Ginecología", icon: <Heart size={28} className="text-[#FF82B6]" />, desc: "Salud femenina y ginecológica" },
  { id: "obstetrics", name: "Obstetricia", icon: <Baby size={28} className="text-[#0AC0AB]" />, desc: "Atención durante el embarazo" },
  { id: "fertility", name: "Fertilidad", icon: <Stethoscope size={28} className="text-[#006FC1]" />, desc: "Tratamientos de fertilidad" },
];

const DOCTORS: Record<string, { id: string; name: string; specialty: string; availableDays: number[]; occupiedSlots: string[] }[]> = {
  gynecology: [
    { id: "d1", name: "Dra. Carmen López", specialty: "Ginecología", availableDays: [1,2,3,4,5], occupiedSlots: ["09:00","10:30","14:00"] },
    { id: "d2", name: "Dra. Patricia Vega", specialty: "Ginecología", availableDays: [1,2,4,5,6], occupiedSlots: ["08:30","11:00","15:00"] },
  ],
  obstetrics: [
    { id: "d3", name: "Dr. Miguel Torres", specialty: "Obstetricia", availableDays: [2,3,4,5], occupiedSlots: ["10:00","11:30","15:30"] },
    { id: "d4", name: "Dra. Sofia Morales", specialty: "Obstetricia", availableDays: [1,3,4,6], occupiedSlots: ["09:30","14:30","16:00"] },
  ],
  fertility: [
    { id: "d5", name: "Dr. Andrés Castro", specialty: "Fertilidad", availableDays: [1,2,3,5], occupiedSlots: ["08:00","10:00","14:00","16:30"] },
  ],
};

const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 17; h++) {
  for (const m of [0, 30]) {
    TIME_SLOTS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

export function BookAppointment({ userName }: { userName: string }) {
  const [step, setStep] = useState(1);
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [appointmentCode] = useState(`CLF-${Math.floor(100000 + Math.random() * 900000)}`);

  const docList = specialty ? (DOCTORS[specialty] ?? []) : [];
  const doctorObj = useMemo(() => {
    if (!selectedDoctor) return null;
    for (const arr of Object.values(DOCTORS)) {
      const found = arr.find(d => d.id === selectedDoctor);
      if (found) return found;
    }
    return null;
  }, [selectedDoctor]);

  const calendarDays = useMemo(() => {
    if (!doctorObj) return [];
    const today = new Date(2026, 5, 7);
    const days: { date: Date; available: boolean; disabled: boolean }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dow = d.getDay();
      const isPastDate = i < 2;
      const isAvailableOnDay = doctorObj.availableDays.includes(dow === 0 ? 7 : dow);
      days.push({
        date: d,
        available: isAvailableOnDay && dow !== 0 && !isPastDate,
        disabled: dow === 0 || isPastDate || !isAvailableOnDay,
      });
    }
    return days;
  }, [doctorObj]);

  const doctorTimeSlots = useMemo(() => {
    if (!doctorObj) return [];
    return TIME_SLOTS.map(t => ({
      time: t,
      available: !doctorObj.occupiedSlots.includes(t),
    }));
  }, [doctorObj]);

  const currentMonth = selectedDate || new Date(2026, 5, 7);

  const canNext = () => {
    if (step === 1) return specialty !== null;
    if (step === 2) return selectedDoctor !== null;
    if (step === 3) return selectedDate !== null;
    return false;
  };

  const handleReset = () => {
    setStep(1);
    setSpecialty(null);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
          <div className="w-16 h-16 bg-[#0AC0AB]/15 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={36} className="text-[#0AC0AB]" /></div>
          <h2 className="text-[#05576D] mb-2 text-xl font-bold">¡Cita Confirmada!</h2>
          <p className="text-gray-500 mb-4 text-sm">Su cita ha sido agendada exitosamente</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6"><p className="text-xs text-gray-500 mb-1">Código</p><p className="text-[#006FC1] font-bold text-xl">{appointmentCode}</p></div>
          <div className="text-sm text-gray-600 space-y-1.5 mb-6 text-left">
            <Row label="Especialidad" value={SPECIALTIES.find(s=>s.id===specialty)?.name ?? ""} />
            <Row label="Doctor" value={doctorObj?.name ?? ""} />
            <Row label="Fecha" value={selectedDate?.toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) ?? ""} />
            <Row label="Hora" value={selectedTime ?? ""} />
            <Row label="Consultorio" value="Consultorio 3" />
          </div>
          <button onClick={handleReset} className="w-full bg-[#006FC1] text-white py-2.5 rounded-lg font-medium hover:bg-[#005a9e] transition-colors text-sm">Agendar otra cita</button>
        </div>
      </div>
    );
  }

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SPECIALTIES.map(sp => (
                <button key={sp.id} onClick={() => { setSpecialty(sp.id); setSelectedDoctor(null); setSelectedDate(null); setSelectedTime(null); }}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${specialty === sp.id ? "border-[#006FC1] bg-[#006FC1]/5" : "border-gray-200 hover:border-[#0F96CB]/50 hover:bg-gray-50"}`}>
                  <div className="mb-3">{sp.icon}</div>
                  <p className="font-semibold text-[#05576D] text-sm">{sp.name}</p>
                  <p className="text-gray-500 mt-1 text-xs">{sp.desc}</p>
                  {specialty === sp.id && <div className="mt-3 flex items-center gap-1 text-[#006FC1] text-xs"><CheckCircle2 size={14} /> <span>Seleccionada</span></div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-[#05576D] text-lg font-semibold mb-4">Seleccione un Doctor</h2>
            {docList.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay doctores disponibles para esta especialidad.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {docList.map(doc => (
                  <button key={doc.id} onClick={() => { setSelectedDoctor(doc.id); setSelectedDate(null); setSelectedTime(null); }}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${selectedDoctor === doc.id ? "border-[#006FC1] bg-[#006FC1]/5 ring-2 ring-[#006FC1]/20" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-[#0F96CB]/20 flex items-center justify-center text-[#0F96CB] font-bold text-xl flex-shrink-0">
                        {doc.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#05576D] text-sm">{doc.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{doc.specialty}</p>
                        {selectedDoctor === doc.id && (
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
              Fechas disponibles para <strong>{doctorObj?.name}</strong>
            </p>
            {calendarDays.length === 0 || calendarDays.filter(d => d.available).length === 0 ? (
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
                  {Array.from({ length: new Date(2026, 5, 1).getDay() }).map((_, i) => <div key={`e-${i}`} />)}
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
              <strong>{doctorObj?.name}</strong> &middot; {selectedDate?.toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {doctorTimeSlots.map((slot, i) => (
                <button key={i} disabled={!slot.available} onClick={() => setSelectedTime(slot.time)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedTime === slot.time ? "bg-[#006FC1] text-white" : slot.available ? "bg-[#0AC0AB]/20 text-[#05576D] hover:bg-[#0AC0AB]/40" : "bg-[#FF82B6]/20 text-gray-400 cursor-not-allowed line-through"}`}>
                  {slot.time}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0AC0AB]/30 inline-block" />Disponible</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#FF82B6]/20 inline-block" />Ocupado</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#006FC1] inline-block" />Seleccionado</span>
            </div>
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
          ) : (
            <button onClick={() => setShowSuccess(true)} disabled={!selectedTime}
              className="px-6 py-2 rounded-lg bg-[#006FC1] text-white hover:bg-[#005a9e] transition-colors text-sm font-medium">
              Confirmar Cita
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-gray-500">{label}:</span><span className="font-medium text-[#05576D]">{value}</span></div>;
}
