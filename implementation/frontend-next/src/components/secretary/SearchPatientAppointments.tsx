"use client";
import { useState } from "react";
import { Search, User, ChevronDown, ChevronUp, Eye, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { AppointmentStatus } from "@/lib/types";
import { pacientesService } from "@/services/pacientes";
import { citasService } from "@/services/citas";

interface PatientResult {
  dni: string; name: string; email: string; phone: string; totalAppointments: number;
  appointments: { id: string; doctor: string; specialty: string; date: string; time: string; status: AppointmentStatus }[];
}

export function SearchPatientAppointments() {
  const [mode, setMode] = useState<"patient" | "code">("patient");
  const [query, setQuery] = useState("");
  const [codeQuery, setCodeQuery] = useState("");
  const [results, setResults] = useState<PatientResult[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeResult, setCodeResult] = useState<{ id: string; patient: string; doctor: string; specialty: string; date: string; time: string; status: AppointmentStatus } | null>(null);

  const handleSearch = async () => {
    setSearched(true);
    setLoading(true);
    if (mode === "patient") {
      const q = query.trim();
      if (!q) { setResults([]); setLoading(false); return; }
      try {
        const res = await pacientesService.getByDni(q);
        const d = res.data;
        const patient: PatientResult = {
          dni: d.dni,
          name: `${d.nombres} ${d.apellidos}`,
          email: "",
          phone: d.telefono,
          totalAppointments: 0,
          appointments: [],
        };
        setResults([patient]);
      } catch {
        setResults([]);
      }
    } else {
      const q = codeQuery.trim().toUpperCase();
      if (!q) { setCodeResult(null); setLoading(false); return; }
      try {
        const res = await citasService.getSecretaria({ search: q });
        const content = res.data?.content ?? [];
        if (content.length > 0) {
          const c = content[0] as any;
          setCodeResult({
            id: c.codigoCita,
            patient: c.paciente,
            doctor: c.medico,
            specialty: c.especialidad,
            date: c.fecha,
            time: c.hora?.slice(0, 5),
            status: c.estadoCita,
          });
        } else {
          setCodeResult(null);
        }
      } catch {
        setCodeResult(null);
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-[#05576D] mb-6 text-2xl font-bold">Buscar Citas de Paciente</h1>
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {(["patient", "code"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setSearched(false); setResults([]); setCodeResult(null); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-white text-[#05576D] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {m === "patient" ? "Buscar por Paciente" : "Buscar por Código"}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={mode === "patient" ? query : codeQuery} onChange={e => { if (mode === "patient") setQuery(e.target.value); else setCodeQuery(e.target.value); }}
              placeholder={mode === "patient" ? "Nombre o DNI..." : "Código (ej: CLF-001)..."} onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-3 py-2.5 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1]" />
          </div>
          <button onClick={handleSearch} className="px-5 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] transition-colors">Buscar</button>
        </div>
      </div>

      {mode === "patient" && searched && (
        loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-12 text-center"><Loader2 size={28} className="mx-auto text-[#006FC1] animate-spin" /></div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <User size={40} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No se encontraron pacientes.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {results.map(p => (
              <div key={p.dni} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(prev => ({ ...prev, [p.dni]: !prev[p.dni] }))}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#006FC1]/15 flex items-center justify-center text-[#006FC1] font-bold">{p.name.charAt(0)}</div>
                    <div><p className="font-semibold text-[#05576D] text-sm">{p.name}</p><p className="text-xs text-gray-500">DNI: {p.dni} · {p.phone}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-[#006FC1]/10 text-[#006FC1] px-2.5 py-1 rounded-full font-medium">{p.totalAppointments} citas</span>
                    {expanded[p.dni] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>
                {expanded[p.dni] && (
                  <div className="border-t border-gray-100">
                    {p.appointments.map(a => (
                      <div key={a.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5"><span className="text-xs font-mono text-[#006FC1]">{a.id}</span><StatusBadge status={a.status} /></div>
                          <p className="text-sm text-gray-700">{a.doctor} · {a.specialty}</p>
                          <p className="text-xs text-gray-400">{a.date} — {a.time}</p>
                        </div>
                        <button className="p-1.5 text-gray-400 hover:text-[#006FC1] rounded-lg hover:bg-[#006FC1]/10"><Eye size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {mode === "code" && searched && (
        loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-12 text-center"><Loader2 size={28} className="mx-auto text-[#006FC1] animate-spin" /></div>
        ) : codeResult === null ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center"><Search size={40} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No se encontró ninguna cita.</p></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4"><span className="font-mono text-[#006FC1] font-semibold">{codeResult.id}</span><StatusBadge status={codeResult.status} /></div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Paciente:</span><span className="font-medium">{codeResult.patient}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Doctor:</span><span className="font-medium">{codeResult.doctor}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Fecha:</span><span className="font-medium">{codeResult.date}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Hora:</span><span className="font-medium">{codeResult.time}</span></div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
