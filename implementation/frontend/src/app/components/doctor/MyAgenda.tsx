import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { StatusBadge, AppointmentStatus } from "../StatusBadge";

interface AgendaItem {
  id: string;
  time: string;
  patient: string;
  dni: string;
  phone: string;
  specialty: string;
  code: string;
  consultorio: string;
  status: AppointmentStatus;
}

const AGENDA_DATA: Record<string, AgendaItem[]> = {
  "2026-06-07": [
    { id: "1", time: "09:00", patient: "María García Pérez", dni: "47123456", phone: "+51 987 654 321", specialty: "Ginecología", code: "CLF-001", consultorio: "Consultorio 2", status: "Agendada" },
    { id: "2", time: "10:30", patient: "Rosa Mendoza Quispe", dni: "38291047", phone: "+51 976 123 456", specialty: "Ginecología", code: "CLF-002", consultorio: "Consultorio 2", status: "Atendida" },
    { id: "3", time: "14:00", patient: "Julia Torres Silva", dni: "52841930", phone: "+51 945 678 901", specialty: "Ginecología", code: "CLF-003", consultorio: "Consultorio 2", status: "Agendada" },
  ],
  "2026-06-08": [
    { id: "4", time: "08:30", patient: "Laura Quispe Flores", dni: "61029384", phone: "+51 912 345 678", specialty: "Ginecología", code: "CLF-004", consultorio: "Consultorio 2", status: "Agendada" },
    { id: "5", time: "11:00", patient: "Carla Ramos Díaz", dni: "48291038", phone: "+51 934 567 890", specialty: "Ginecología", code: "CLF-006", consultorio: "Consultorio 2", status: "Agendada" },
  ],
  "2026-06-09": [],
  "2026-06-10": [
    { id: "6", time: "09:30", patient: "Ana Lima Torres", dni: "73920184", phone: "+51 965 432 198", specialty: "Ginecología", code: "CLF-007", consultorio: "Consultorio 1", status: "Agendada" },
  ],
};

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS_ES_FULL = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export function MyAgenda() {
  const [date, setDate] = useState(new Date(2026, 5, 7));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const dateStr = toDateStr(date);
  const items = AGENDA_DATA[dateStr] ?? [];

  const navigate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d);
  };

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-[#05576D] mb-6" style={{ fontSize: 24, fontWeight: 700 }}>Mi Agenda</h1>

      {/* Date navigator */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="font-semibold text-[#05576D]" style={{ fontSize: 16 }}>
              {DAYS_ES_FULL[date.getDay()]}, {date.getDate()} de {MONTHS_ES[date.getMonth()]} {date.getFullYear()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{items.length} cita{items.length !== 1 ? "s" : ""} programada{items.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex justify-center mt-3">
          <button
            onClick={() => setDate(new Date(2026, 5, 7))}
            className="px-4 py-1.5 text-sm border border-[#006FC1] text-[#006FC1] rounded-lg hover:bg-[#006FC1]/5 transition-colors"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Appointment list */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
          <Calendar size={44} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Sin citas programadas para este día</p>
          <p className="text-gray-400 text-sm mt-1">Navegue a otro día o registre su disponibilidad</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="text-center w-14 flex-shrink-0">
                  <p className="font-bold text-[#006FC1]" style={{ fontSize: 18 }}>{item.time}</p>
                  <div className="w-0.5 h-4 bg-[#006FC1]/20 mx-auto mt-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-[#05576D]" style={{ fontSize: 15 }}>{item.patient}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 bg-[#0F96CB]/10 text-[#0F96CB] rounded text-xs font-medium">{item.specialty}</span>
                </div>
                {expanded[item.id] ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
              </div>

              {expanded[item.id] && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                      <p className="text-xs text-gray-400">DNI</p>
                      <p className="text-sm font-medium text-gray-700">{item.dni}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Teléfono</p>
                      <p className="text-sm font-medium text-gray-700">{item.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Código de cita</p>
                      <p className="text-sm font-medium text-[#006FC1]">{item.code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Consultorio</p>
                      <p className="text-sm font-medium text-gray-700">{item.consultorio}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
