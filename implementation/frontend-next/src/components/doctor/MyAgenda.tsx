"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { AppointmentStatus } from "@/lib/types";
import { citasService } from "@/services/citas";

interface AgendaItem {
  id: string; time: string; patient: string; dni: string; phone: string;
  specialty: string; code: string; consultorio: string; status: AppointmentStatus;
}

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS_FULL = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function formatDateBackend(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function MyAgenda() {
  const [date, setDate] = useState(new Date(2026, 5, 7));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    citasService.getAgenda(formatDateBackend(date))
      .then(res => {
        const data = res.data ?? [];
        setItems(data.map((c: any) => ({
          id: c.idCita,
          time: c.hora?.slice(0, 5),
          patient: c.paciente,
          dni: c.dniPaciente,
          phone: c.telefono ?? "",
          specialty: c.especialidad,
          code: c.codigoCita,
          consultorio: c.codigoConsultorio,
          status: c.estadoCita,
        })));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-[#05576D] mb-6 text-2xl font-bold">Mi Agenda</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex items-center justify-between">
          <button onClick={() => { const d = new Date(date); d.setDate(d.getDate()-1); setDate(d); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronLeft size={20} /></button>
          <div className="text-center">
            <p className="font-semibold text-[#05576D] text-base">{DAYS_FULL[date.getDay()]}, {date.getDate()} de {MONTHS_ES[date.getMonth()]} {date.getFullYear()}</p>
            <p className="text-xs text-gray-400 mt-0.5">{items.length} cita{items.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => { const d = new Date(date); d.setDate(d.getDate()+1); setDate(d); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronRight size={20} /></button>
        </div>
        <div className="flex justify-center mt-3">
          <button onClick={() => setDate(new Date(2026, 5, 7))} className="px-4 py-1.5 text-sm border border-[#006FC1] text-[#006FC1] rounded-lg hover:bg-[#006FC1]/5">Hoy</button>
        </div>
      </div>
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center"><Loader2 size={32} className="mx-auto text-[#006FC1] animate-spin mb-3" /><p className="text-gray-500">Cargando agenda...</p></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
          <Calendar size={44} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Sin citas programadas para este día</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpanded(prev => ({ ...prev, [item.id]: !prev[item.id] }))}>
                <div className="text-center w-14 flex-shrink-0">
                  <p className="font-bold text-[#006FC1] text-lg">{item.time}</p>
                  <div className="w-0.5 h-4 bg-[#006FC1]/20 mx-auto mt-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-[#05576D] text-sm">{item.patient}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 bg-[#0F96CB]/10 text-[#0F96CB] rounded text-xs font-medium">{item.specialty}</span>
                </div>
                {expanded[item.id] ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
              </div>
              {expanded[item.id] && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div><p className="text-xs text-gray-400">DNI</p><p className="font-medium text-gray-700">{item.dni}</p></div>
                    <div><p className="text-xs text-gray-400">Teléfono</p><p className="font-medium text-gray-700">{item.phone}</p></div>
                    <div><p className="text-xs text-gray-400">Código</p><p className="font-medium text-[#006FC1]">{item.code}</p></div>
                    <div><p className="text-xs text-gray-400">Consultorio</p><p className="font-medium text-gray-700">{item.consultorio}</p></div>
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
