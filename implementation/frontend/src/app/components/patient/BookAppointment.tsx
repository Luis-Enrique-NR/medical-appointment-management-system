import { useState } from "react";
import {
  ChevronRight, ChevronLeft, CheckCircle2, Baby, Heart, Stethoscope,
  Calendar, Clock, X, AlertCircle
} from "lucide-react";
import { StatusBadge } from "../StatusBadge";

const SPECIALTIES = [
  { id: "gynecology", name: "Ginecología", icon: <Heart size={28} className="text-[#FF82B6]" />, desc: "Salud femenina y ginecológica" },
  { id: "obstetrics", name: "Obstetricia", icon: <Baby size={28} className="text-[#0AC0AB]" />, desc: "Atención durante el embarazo" },
  { id: "fertility", name: "Fertilidad", icon: <Stethoscope size={28} className="text-[#006FC1]" />, desc: "Tratamientos de fertilidad" },
];

const DOCTORS: Record<string, { id: string; name: string; specialty: string }[]> = {
  gynecology: [
    { id: "d1", name: "Dra. Carmen López", specialty: "Ginecología" },
    { id: "d2", name: "Dra. Patricia Vega", specialty: "Ginecología" },
  ],
  obstetrics: [
    { id: "d3", name: "Dr. Miguel Torres", specialty: "Obstetricia" },
    { id: "d4", name: "Dra. Sofia Morales", specialty: "Obstetricia" },
  ],
  fertility: [
    { id: "d5", name: "Dr. Andrés Castro", specialty: "Fertilidad" },
  ],
};

function generateCalendarDays() {
  const today = new Date(2026, 5, 7);
  const days: { date: Date; available: boolean; disabled: boolean }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay();
    const available = dow !== 0 && Math.random() > 0.3;
    days.push({ date: d, available, disabled: dow === 0 || i < 2 });
  }
  return days;
}

function generateTimeSlots() {
  const slots: { time: string; available: boolean }[] = [];
  for (let h = 8; h <= 17; h++) {
    for (const m of [0, 30]) {
      const hStr = String(h).padStart(2, "0");
      const mStr = String(m).padStart(2, "0");
      slots.push({ time: `${hStr}:${mStr}`, available: Math.random() > 0.4 });
    }
  }
  return slots;
}

const calendarDays = generateCalendarDays();
const timeSlots = generateTimeSlots();

const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface BookAppointmentProps {
  userName: string;
}

export function BookAppointment({ userName }: BookAppointmentProps) {
  const [step, setStep] = useState(1);
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [appointmentCode] = useState(`CLF-${Math.floor(100000 + Math.random() * 900000)}`);

  const canNext = () => {
    if (step === 1) return specialty !== null;
    if (step === 2) return selectedDate !== null;
    if (step === 3) return selectedTime !== null;
    return false;
  };

  const handleConfirm = () => {
    setShowSuccess(true);
  };

  const resetFlow = () => {
    setStep(1); setSpecialty(null); setSelectedDate(null);
    setSelectedTime(null); setSelectedDoctor(null); setShowSuccess(false);
  };

  const currentMonth = selectedDate ? selectedDate : new Date(2026, 5, 7);
  const availableDays = calendarDays.filter(d => {
    const m = d.date.getMonth(); const y = d.date.getFullYear();
    return m === currentMonth.getMonth() && y === currentMonth.getFullYear();
  });

  const docList = specialty ? (DOCTORS[specialty] ?? []) : [];

  if (showSuccess) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
          <div className="w-16 h-16 bg-[#0AC0AB]/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} className="text-[#0AC0AB]" />
          </div>
          <h2 className="text-[#05576D] mb-2" style={{ fontSize: 22, fontWeight: 700 }}>¡Cita Confirmada!</h2>
          <p className="text-gray-500 mb-4" style={{ fontSize: 14 }}>Su cita ha sido agendada exitosamente</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">Código de cita</p>
            <p className="text-[#006FC1] font-bold" style={{ fontSize: 20 }}>{appointmentCode}</p>
          </div>
          <div className="text-sm text-gray-600 space-y-1.5 mb-6 text-left">
            <div className="flex justify-between"><span className="text-gray-500">Especialidad:</span><span className="font-medium">{SPECIALTIES.find(s=>s.id===specialty)?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Doctor:</span><span className="font-medium">{docList.find(d=>d.id===selectedDoctor)?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Fecha:</span><span className="font-medium">{selectedDate?.toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Hora:</span><span className="font-medium">{selectedTime}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Consultorio:</span><span className="font-medium">Consultorio 3</span></div>
          </div>
          <button onClick={resetFlow} className="w-full bg-[#006FC1] text-white py-2.5 rounded-lg font-medium hover:bg-[#005a9e] transition-colors">
            Agendar otra cita
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[#05576D] mb-6" style={{ fontSize: 24, fontWeight: 700 }}>Reservar una Cita</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {[1, 2, 3, 4].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step > s ? "bg-[#0AC0AB] text-white" : step === s ? "bg-[#006FC1] text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {step > s ? <CheckCircle2 size={16} /> : s}
            </div>
            <span className={`ml-2 text-sm ${step >= s ? "text-[#05576D] font-medium" : "text-gray-400"}`}>
              {["Especialidad", "Fecha", "Horario", "Confirmar"][i]}
            </span>
            {i < 3 && <div className={`flex-1 h-0.5 mx-3 min-w-8 ${step > s ? "bg-[#0AC0AB]" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Step 1: Specialty */}
        {step === 1 && (
          <div>
            <h2 className="text-[#05576D] mb-1" style={{ fontSize: 18, fontWeight: 600 }}>Seleccione una Especialidad</h2>
            <p className="text-gray-500 mb-5" style={{ fontSize: 14 }}>Elija la especialidad médica que necesita</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SPECIALTIES.map(sp => (
                <button
                  key={sp.id}
                  onClick={() => setSpecialty(sp.id)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    specialty === sp.id
                      ? "border-[#006FC1] bg-[#006FC1]/5"
                      : "border-gray-200 hover:border-[#0F96CB]/50 hover:bg-gray-50"
                  }`}
                >
                  <div className="mb-3">{sp.icon}</div>
                  <p className="font-semibold text-[#05576D]" style={{ fontSize: 15 }}>{sp.name}</p>
                  <p className="text-gray-500 mt-1" style={{ fontSize: 13 }}>{sp.desc}</p>
                  {specialty === sp.id && (
                    <div className="mt-3 flex items-center gap-1 text-[#006FC1]" style={{ fontSize: 12 }}>
                      <CheckCircle2 size={14} /> <span>Seleccionada</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date */}
        {step === 2 && (
          <div>
            <h2 className="text-[#05576D] mb-1" style={{ fontSize: 18, fontWeight: 600 }}>Seleccione una Fecha</h2>
            <p className="text-gray-500 mb-5" style={{ fontSize: 14 }}>Las fechas resaltadas en verde tienen disponibilidad</p>
            <div className="max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-[#05576D]">{MONTHS_ES[currentMonth.getMonth()]} {currentMonth.getFullYear()}</p>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_ES.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>
                ))}
              </div>
              {/* Fill initial empty cells */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: new Date(2026, 5, 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {calendarDays.map((day, i) => {
                  const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                  return (
                    <button
                      key={i}
                      disabled={day.disabled || !day.available}
                      onClick={() => setSelectedDate(day.date)}
                      className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-colors ${
                        day.disabled ? "text-gray-300 cursor-not-allowed" :
                        isSelected ? "bg-[#006FC1] text-white font-semibold" :
                        day.available ? "bg-[#0AC0AB]/20 text-[#05576D] hover:bg-[#0AC0AB]/40 font-medium" :
                        "text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {day.date.getDate()}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-4" style={{ fontSize: 12 }}>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0AC0AB]/30 inline-block" />Disponible</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-200 inline-block" />No disponible</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Time */}
        {step === 3 && (
          <div>
            <h2 className="text-[#05576D] mb-1" style={{ fontSize: 18, fontWeight: 600 }}>Seleccione un Horario</h2>
            <p className="text-gray-500 mb-5" style={{ fontSize: 14 }}>
              {selectedDate?.toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            {timeSlots.filter(s => s.available).length === 0 ? (
              <div className="py-12 text-center">
                <Calendar size={40} className="mx-auto text-[#0AC0AB] mb-3" />
                <p className="text-gray-500">No hay disponibilidad para la fecha seleccionada. Por favor elija otra fecha.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {timeSlots.map((slot, i) => (
                  <button
                    key={i}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedTime === slot.time ? "bg-[#006FC1] text-white" :
                      slot.available ? "bg-[#0AC0AB]/20 text-[#05576D] hover:bg-[#0AC0AB]/40" :
                      "bg-[#FF82B6]/20 text-gray-400 cursor-not-allowed line-through"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-4 mt-4" style={{ fontSize: 12 }}>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0AC0AB]/30 inline-block" />Disponible</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#FF82B6]/20 inline-block" />Ocupado</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#006FC1] inline-block" />Seleccionado</span>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-[#05576D] mb-4" style={{ fontSize: 18, fontWeight: 600 }}>Seleccione un Doctor</h2>
              <div className="flex flex-col gap-3">
                {docList.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedDoctor === doc.id ? "border-[#006FC1] bg-[#006FC1]/5" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0F96CB]/20 flex items-center justify-center text-[#0F96CB] font-bold">
                        {doc.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#05576D]" style={{ fontSize: 14 }}>{doc.name}</p>
                        <p className="text-gray-500" style={{ fontSize: 12 }}>{doc.specialty}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2" style={{ fontSize: 12 }}>
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-gray-500">{selectedTime} — {selectedDate?.toLocaleDateString("es-PE", { day: "numeric", month: "short" })}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedDoctor && (
              <div>
                <h2 className="text-[#05576D] mb-4" style={{ fontSize: 18, fontWeight: 600 }}>Resumen de la Cita</h2>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
                  <Row label="Especialidad" value={SPECIALTIES.find(s=>s.id===specialty)?.name ?? ""} />
                  <Row label="Doctor" value={docList.find(d=>d.id===selectedDoctor)?.name ?? ""} />
                  <Row label="Fecha" value={selectedDate?.toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) ?? ""} />
                  <Row label="Hora" value={selectedTime ?? ""} />
                  <Row label="Consultorio" value="Consultorio 3" />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Datos del Paciente</p>
                  <Row label="Nombre" value="María García" />
                  <div className="mt-2"><Row label="DNI" value="47123456" /></div>
                  <div className="mt-2"><Row label="Teléfono" value="+51 987 654 321" /></div>
                  <div className="mt-2"><Row label="Email" value="m.garcia@email.com" /></div>
                </div>
                <button
                  onClick={handleConfirm}
                  className="w-full bg-[#006FC1] text-white py-3 rounded-lg font-semibold hover:bg-[#005a9e] transition-colors"
                >
                  Confirmar Cita
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          {step < 4 && (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#006FC1] text-white hover:bg-[#005a9e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-gray-500 text-sm flex-shrink-0">{label}:</span>
      <span className="text-[#05576D] font-medium text-sm text-right">{value}</span>
    </div>
  );
}
