import { useEffect, useState } from "react";
import { Search, User, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { StatusBadge, AppointmentStatus } from "../StatusBadge";

interface PatientResult {
  dni: string;
  name: string;
  email: string;
  phone: string;
  totalAppointments: number;
  appointments: {
    id: string;
    doctor: string;
    specialty: string;
    date: string;
    time: string;
    status: AppointmentStatus;
  }[];
}

const PATIENT_DATA: PatientResult[] = [
  {
    dni: "47123456", name: "María García Pérez", email: "m.garcia@email.com", phone: "+51 987 654 321", totalAppointments: 3,
    appointments: [
      { id: "CLF-001", doctor: "Dra. Carmen López", specialty: "Ginecología", date: "2026-06-15", time: "10:00", status: "Agendada" },
      { id: "CLF-098", doctor: "Dra. Patricia Vega", specialty: "Ginecología", date: "2026-05-10", time: "09:00", status: "Atendida" },
      { id: "CLF-054", doctor: "Dra. Carmen López", specialty: "Ginecología", date: "2026-04-01", time: "11:30", status: "Cancelada" },
    ]
  },
  {
    dni: "38291047", name: "Rosa Mendoza Quispe", email: "r.mendoza@email.com", phone: "+51 976 123 456", totalAppointments: 2,
    appointments: [
      { id: "CLF-002", doctor: "Dr. Miguel Torres", specialty: "Obstetricia", date: "2026-06-07", time: "10:30", status: "Atendida" },
      { id: "CLF-077", doctor: "Dr. Miguel Torres", specialty: "Obstetricia", date: "2026-05-22", time: "09:00", status: "Atendida" },
    ]
  },
  {
    dni: "52841930", name: "Julia Torres Silva", email: "j.torres@email.com", phone: "+51 945 678 901", totalAppointments: 1,
    appointments: [
      { id: "CLF-003", doctor: "Dr. Andrés Castro", specialty: "Fertilidad", date: "2026-06-07", time: "11:00", status: "Agendada" },
    ]
  },
];

export function SearchPatientAppointments() {
  const [mode, setMode] = useState<"patient" | "code">("patient");
  const [query, setQuery] = useState("");
  const [codeQuery, setCodeQuery] = useState("");
  const [patients, setPatients] = useState<PatientResult[]>(PATIENT_DATA);
  const [results, setResults] = useState<PatientResult[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [searched, setSearched] = useState(false);
  const [codeResult, setCodeResult] = useState<{ id: string; patient: string; doctor: string; specialty: string; date: string; time: string; status: AppointmentStatus } | null>(null);
  const [newPatientDni, setNewPatientDni] = useState("");
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientEmail, setNewPatientEmail] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("medical-appointment-patients") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PatientResult[];
        setPatients(parsed);
      } catch {
        setPatients(PATIENT_DATA);
      }
    }
  }, []);

  const savePatients = (updated: PatientResult[]) => {
    setPatients(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("medical-appointment-patients", JSON.stringify(updated));
    }
  };

  const handleSearch = () => {
    setSearched(true);
    if (mode === "patient") {
      const q = query.toLowerCase();
      const found = patients.filter(p => p.name.toLowerCase().includes(q) || p.dni.includes(q));
      setResults(found);
      setNewPatientDni(query);
      setCreateError("");
    } else {
      const q = codeQuery.toUpperCase();
      let found = null;
      for (const p of patients) {
        const a = p.appointments.find(ap => ap.id === q);
        if (a) { found = { ...a, patient: p.name }; break; }
      }
      setCodeResult(found);
    }
  };

  const toggleExpand = (dni: string) => {
    setExpanded(prev => ({ ...prev, [dni]: !prev[dni] }));
  };

  const handleCreatePatient = () => {
    const dni = newPatientDni.trim();
    const name = newPatientName.trim();
    const email = newPatientEmail.trim();
    const phone = newPatientPhone.trim();

    if (!dni) {
      setCreateError("El DNI es obligatorio.");
      return;
    }
    if (!/^[0-9]{8}$/.test(dni)) {
      setCreateError("El DNI debe tener 8 dígitos.");
      return;
    }
    if (!name) {
      setCreateError("El nombre del paciente es obligatorio.");
      return;
    }
    if (!email) {
      setCreateError("El correo es obligatorio.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCreateError("Ingrese un correo electrónico válido.");
      return;
    }
    if (!phone) {
      setCreateError("El teléfono es obligatorio.");
      return;
    }
    if (!/^[0-9]{9}$/.test(phone)) {
      setCreateError("El teléfono debe tener 9 dígitos.");
      return;
    }
    if (patients.some(p => p.dni === dni)) {
      setCreateError("Ya existe un paciente con ese DNI.");
      return;
    }

    const newPatient: PatientResult = {
      dni,
      name,
      email,
      phone,
      totalAppointments: 0,
      appointments: [],
    };

    const updated = [newPatient, ...patients];
    savePatients(updated);
    setResults([newPatient]);
    setSearched(true);
    setCreateError("");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-[#05576D] mb-6" style={{ fontSize: 24, fontWeight: 700 }}>Buscar Citas de Paciente</h1>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {(["patient", "code"] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setSearched(false); setResults([]); setCodeResult(null); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-white text-[#05576D] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {m === "patient" ? "Buscar por Paciente" : "Buscar por Código de Cita"}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              inputMode={mode === "code" ? "text" : undefined}
              value={mode === "patient" ? query : codeQuery}
              onChange={e => {
                if (mode === "patient") {
                  const next = e.target.value;
                  setQuery(next);
                  if (!next.trim()) {
                    setSearched(false);
                    setResults([]);
                    setCreateError("");
                  }
                } else {
                  setCodeQuery(e.target.value);
                }
              }}
              placeholder={mode === "patient" ? "Nombre del paciente o DNI..." : "Código de cita (ej: CLF-001)..."}
              className="w-full pl-9 pr-3 py-2.5 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1]"
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Results: by patient */}
      {mode === "patient" && searched && (
        results.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <User size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No se encontraron pacientes con ese criterio.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {results.map(p => (
              <div key={p.dni} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => toggleExpand(p.dni)}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#006FC1]/15 flex items-center justify-center text-[#006FC1] font-bold">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#05576D] text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">DNI: {p.dni} · {p.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-[#006FC1]/10 text-[#006FC1] px-2.5 py-1 rounded-full font-medium">
                      {p.totalAppointments} citas
                    </span>
                    {expanded[p.dni] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>

                {expanded[p.dni] && (
                  <div className="border-t border-gray-100">
                    {p.appointments.map(a => (
                      <div key={a.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-mono text-[#006FC1]">{a.id}</span>
                            <StatusBadge status={a.status} />
                          </div>
                          <p className="text-sm text-gray-700">{a.doctor} · {a.specialty}</p>
                          <p className="text-xs text-gray-400">{a.date} — {a.time}</p>
                        </div>
                        <button className="p-1.5 text-gray-400 hover:text-[#006FC1] rounded-lg hover:bg-[#006FC1]/10 transition-colors">
                          <Eye size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
      {mode === "patient" && searched && results.length === 0 && query.trim().length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
          <p className="text-sm text-gray-600 mb-4">No se encontró ningún paciente con ese DNI o nombre.</p>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-[#05576D] mb-1.5">DNI</label>
              <input
                type="text"
                value={newPatientDni}
                onChange={e => setNewPatientDni(e.target.value)}
                placeholder="Ingrese DNI..."
                className="w-full px-3 py-2 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#05576D] mb-1.5">Nombre</label>
              <input
                type="text"
                value={newPatientName}
                onChange={e => setNewPatientName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full px-3 py-2 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1]"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#05576D] mb-1.5">Email</label>
                <input
                  type="email"
                  value={newPatientEmail}
                  onChange={e => setNewPatientEmail(e.target.value)}
                  placeholder="Email opcional"
                  className="w-full px-3 py-2 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#05576D] mb-1.5">Teléfono</label>
                <input
                  type="text"
                  value={newPatientPhone}
                  onChange={e => setNewPatientPhone(e.target.value)}
                  placeholder="Teléfono opcional"
                  className="w-full px-3 py-2 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1]"
                />
              </div>
            </div>
            {createError && <p className="text-sm text-[#FF82B6]">{createError}</p>}
            <button
              onClick={handleCreatePatient}
              className="w-full px-4 py-2.5 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] transition-colors"
            >
              Guardar paciente y buscar
            </button>
          </div>
        </div>
      )}

      {/* Results: by code */}
      {mode === "code" && searched && (
        codeResult === null ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <Search size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No se encontró ninguna cita con ese código.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-[#006FC1] font-semibold">{codeResult.id}</span>
              <StatusBadge status={codeResult.status} />
            </div>
            <div className="space-y-2.5">
              <Row label="Paciente" value={codeResult.patient} />
              <Row label="Doctor" value={codeResult.doctor} />
              <Row label="Especialidad" value={codeResult.specialty} />
              <Row label="Fecha" value={codeResult.date} />
              <Row label="Hora" value={codeResult.time} />
            </div>
          </div>
        )
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-500">{label}:</span>
      <span className="text-sm font-medium text-[#05576D]">{value}</span>
    </div>
  );
}
