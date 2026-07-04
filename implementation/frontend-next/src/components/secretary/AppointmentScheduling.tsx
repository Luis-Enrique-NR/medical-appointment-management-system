"use client";
import { useState, useCallback, useEffect } from "react";
import { Search, UserPlus, CheckCircle2, Stethoscope, AlertCircle, Loader2 } from "lucide-react";
import { especialidadesService } from "@/services/especialidades";
import { pacientesService } from "@/services/pacientes";
import { citasService } from "@/services/citas";

interface Patient { dni: string; name: string; email: string; phone: string; }

interface FieldErrors { dni?: string; name?: string; email?: string; phone?: string; }

function validateDni(v: string): string | undefined {
  if (!v) return "El DNI es obligatorio.";
  if (!/^[0-9]{8}$/.test(v)) return "El DNI debe tener exactamente 8 dígitos numéricos.";
  return undefined;
}

function validateName(v: string): string | undefined {
  if (!v) return "El nombre completo es obligatorio.";
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(v)) return "El nombre solo puede contener letras y espacios.";
  return undefined;
}

function validateEmail(v: string): string | undefined {
  if (!v) return "El correo electrónico es obligatorio.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Ingrese un correo electrónico válido.";
  return undefined;
}

function validatePhone(v: string): string | undefined {
  if (!v) return "El teléfono es obligatorio.";
  if (!/^[0-9]{9}$/.test(v)) return "El teléfono debe tener exactamente 9 dígitos.";
  return undefined;
}

const VALIDATORS: Record<string, (v: string) => string | undefined> = {
  dni: validateDni, name: validateName, email: validateEmail, phone: validatePhone,
};

export function AppointmentScheduling() {
  const [dniSearch, setDniSearch] = useState("");
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searchingDni, setSearchingDni] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [specialty, setSpecialty] = useState<number | null>(null);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctor, setDoctor] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slotConflict, setSlotConflict] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPatient, setNewPatient] = useState({ dni: "", name: "", email: "", phone: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    especialidadesService.getAll().then(res => setSpecialties(res.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (specialty !== null) {
      especialidadesService.getMedicos(specialty).then(res => setDoctors(res.data ?? [])).catch(() => setDoctors([]));
    }
  }, [specialty]);

  const validateField = useCallback((field: string, value: string) => {
    const validator = VALIDATORS[field];
    if (!validator) return;
    const error = validator(value);
    setFieldErrors(prev => ({ ...prev, [field]: error }));
    return error;
  }, []);

  const handleFieldChange = (field: string, value: string) => {
    setNewPatient(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleSearch = async () => {
    const cleaned = dniSearch.trim();
    if (!cleaned) return;
    setSearchingDni(true);
    setFoundPatient(null);
    setNotFound(false);
    try {
      const res = await pacientesService.getByDni(cleaned);
      const d = res.data;
      setFoundPatient({ dni: d.dni, name: `${d.nombres} ${d.apellidos}`, email: "", phone: d.telefono });
    } catch {
      setNotFound(true);
    } finally {
      setSearchingDni(false);
    }
    setShowNewForm(false);
  };

  const handleSaveNewPatient = async () => {
    const { dni, name, email, phone } = newPatient;
    setTouched({ dni: true, name: true, email: true, phone: true });

    const errDni = validateDni(dni);
    const errName = validateName(name);
    const errEmail = validateEmail(email);
    const errPhone = validatePhone(phone);
    const errors: FieldErrors = {};
    if (errDni) errors.dni = errDni;
    if (errName) errors.name = errName;
    if (errEmail) errors.email = errEmail;
    if (errPhone) errors.phone = errPhone;
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const parts = name.trim().split(" ");
      const nombres = parts.slice(0, -1).join(" ") || parts[0];
      const apellidos = parts.slice(-1)[0] || "";
      await pacientesService.register(dni, nombres, apellidos, phone);
      setSelectedPatient({ dni, name, email, phone });
      setShowNewForm(false);
      setFieldErrors({});
      setTouched({});
    } catch {
      setFieldErrors({ dni: "Error al registrar paciente" });
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
          <div className="w-16 h-16 bg-[#0AC0AB]/15 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={36} className="text-[#0AC0AB]" /></div>
          <h2 className="text-[#05576D] mb-2 text-xl font-bold">¡Cita Agendada!</h2>
          <p className="text-gray-500 mb-4 text-sm">La cita ha sido registrada exitosamente para el paciente.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
            <Row label="Paciente" value={selectedPatient!.name} />
            <Row label="Especialidad" value={specialties.find(s=>s.idEspecialidad===specialty)?.nombre ?? ""} />
            <Row label="Doctor" value={doctor!} />
            <Row label="Hora" value={selectedTime!} />
          </div>
          <button onClick={() => { setShowSuccess(false); setSelectedPatient(null); setSpecialty(null); setDoctor(null); setSelectedTime(null); setFoundPatient(null); setDniSearch(""); }}
            className="w-full bg-[#006FC1] text-white py-2.5 rounded-lg font-medium hover:bg-[#005a9e] transition-colors text-sm">Registrar otra cita</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-[#05576D] mb-6 text-2xl font-bold">Agendar Cita</h1>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-[#05576D] mb-4 text-base">1. Buscar Paciente</h2>
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={8} value={dniSearch}
                  onChange={e => setDniSearch(e.target.value.replace(/[^0-9]/g, ""))} placeholder="DNI del paciente"
                  className="w-full px-3.5 py-2.5 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1]"
                  onKeyDown={e => e.key === "Enter" && handleSearch()} />
              </div>
              <button onClick={handleSearch} className="p-2.5 bg-[#006FC1] text-white rounded-lg hover:bg-[#005a9e] transition-colors"><Search size={18} /></button>
            </div>
            {foundPatient && !selectedPatient && (
              <div className="border border-[#0AC0AB]/40 bg-[#0AC0AB]/5 rounded-xl p-4 mb-3">
                <p className="font-semibold text-[#05576D] text-sm">{foundPatient.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">DNI: {foundPatient.dni} · {foundPatient.phone}</p>
                <button onClick={() => setSelectedPatient(foundPatient)} className="mt-3 w-full py-2 bg-[#006FC1] text-white text-sm rounded-lg hover:bg-[#005a9e] transition-colors">Usar este paciente</button>
              </div>
            )}
            {notFound && (
              <div className="bg-[#FF82B6]/10 border border-[#FF82B6]/30 rounded-xl p-4 mb-3">
                <div className="flex items-center gap-2 text-[#d45c8b] mb-2"><AlertCircle size={16} /><span className="text-sm font-medium">Paciente no registrado</span></div>
                <button onClick={() => { setShowNewForm(true); setNotFound(false); setFieldErrors({}); setTouched({}); }}
                  className="w-full py-2 border border-[#006FC1] text-[#006FC1] text-sm rounded-lg hover:bg-[#006FC1]/5 transition-colors flex items-center justify-center gap-1.5">
                  <UserPlus size={15} /> Registrar nuevo paciente</button>
              </div>
            )}
            {showNewForm && (
              <div className="border border-gray-200 rounded-xl p-4 mb-3 space-y-3">
                <p className="font-medium text-[#05576D] text-sm">Nuevo Paciente</p>
                <FormField label="DNI *" error={fieldErrors.dni} touched={touched.dni}>
                  <input type="text" inputMode="numeric" maxLength={8} value={newPatient.dni}
                    onChange={e => handleFieldChange("dni", e.target.value.replace(/[^0-9]/g, ""))}
                    onBlur={e => handleFieldBlur("dni", e.target.value)}
                    className={`w-full px-3 py-2 border ${fieldErrors.dni && touched.dni ? "border-[#FF82B6]" : "border-[#05576D]/30"} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#006FC1]`} />
                </FormField>
                <FormField label="Nombre completo *" error={fieldErrors.name} touched={touched.name}>
                  <input type="text" value={newPatient.name}
                    onChange={e => handleFieldChange("name", e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, ""))}
                    onBlur={e => handleFieldBlur("name", e.target.value)}
                    className={`w-full px-3 py-2 border ${fieldErrors.name && touched.name ? "border-[#FF82B6]" : "border-[#05576D]/30"} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#006FC1]`} />
                </FormField>
                <FormField label="Correo electrónico *" error={fieldErrors.email} touched={touched.email}>
                  <input type="email" value={newPatient.email}
                    onChange={e => handleFieldChange("email", e.target.value)}
                    onBlur={e => handleFieldBlur("email", e.target.value)}
                    className={`w-full px-3 py-2 border ${fieldErrors.email && touched.email ? "border-[#FF82B6]" : "border-[#05576D]/30"} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#006FC1]`} />
                </FormField>
                <FormField label="Teléfono *" error={fieldErrors.phone} touched={touched.phone}>
                  <input type="text" inputMode="numeric" maxLength={9} value={newPatient.phone}
                    onChange={e => handleFieldChange("phone", e.target.value.replace(/[^0-9]/g, ""))}
                    onBlur={e => handleFieldBlur("phone", e.target.value)}
                    className={`w-full px-3 py-2 border ${fieldErrors.phone && touched.phone ? "border-[#FF82B6]" : "border-[#05576D]/30"} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#006FC1]`} />
                </FormField>
                <button onClick={handleSaveNewPatient} className="w-full py-2 bg-[#006FC1] text-white text-sm rounded-lg hover:bg-[#005a9e] transition-colors">Guardar y continuar</button>
              </div>
            )}
            {selectedPatient && (
              <div className="border-2 border-[#006FC1] bg-[#006FC1]/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-[#006FC1] uppercase tracking-wide">Paciente seleccionado</p>
                  <button onClick={() => setSelectedPatient(null)} className="text-xs text-gray-400 hover:text-gray-600">Cambiar</button>
                </div>
                <p className="font-semibold text-[#05576D] text-sm">{selectedPatient.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">DNI: {selectedPatient.dni} · {selectedPatient.phone}</p>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${!selectedPatient ? "opacity-60 pointer-events-none" : ""}`}>
            <h2 className="font-semibold text-[#05576D] mb-4 text-base">2. Detalles de la Cita</h2>
            <div className="mb-5">
              <label className="block text-sm font-medium text-[#05576D] mb-2">Especialidad <span className="text-[#FF82B6]">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {specialties.map(sp => (
                  <button key={sp.idEspecialidad} onClick={() => { setSpecialty(sp.idEspecialidad); setDoctor(null); }}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${specialty === sp.idEspecialidad ? "border-[#006FC1] bg-[#006FC1]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <Stethoscope size={22} className="text-[#006FC1]" /><span className="text-xs font-medium text-[#05576D]">{sp.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
            {specialty && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-[#05576D] mb-2">Doctor <span className="text-[#FF82B6]">*</span></label>
                <select value={doctor ?? ""} onChange={e => setDoctor(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30">
                  <option value="">Seleccione un doctor</option>
                  {doctors.map(d => <option key={d.idMedico} value={d.idMedico}>{d.nombre}</option>)}
                </select>
              </div>
            )}
            <div className="mb-5">
              <label className="block text-sm font-medium text-[#05576D] mb-2">Fecha <span className="text-[#FF82B6]">*</span></label>
              <input type="date" defaultValue="2026-06-15" min="2026-06-08"
                className="w-full px-3 py-2.5 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30" />
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-[#05576D] mb-2">Horario <span className="text-[#FF82B6]">*</span></label>
              {!doctor ? (
                <p className="text-sm text-gray-400">Seleccione un doctor primero</p>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"].map(t => (
                    <button key={t} onClick={() => setSelectedTime(t)}
                      className={`py-2 rounded-lg text-xs font-medium transition-colors ${selectedTime === t ? "bg-[#006FC1] text-white" : "bg-[#0AC0AB]/20 text-[#05576D] hover:bg-[#0AC0AB]/40"}`}>{t}</button>
                  ))}
                </div>
              )}
            </div>
            {selectedPatient && specialty && doctor && selectedTime && (
              <div className="border-t border-gray-100 pt-4">
                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Resumen</p>
                  <Row label="Paciente" value={selectedPatient.name} />
                  <Row label="Especialidad" value={specialties.find(s=>s.idEspecialidad===specialty)?.nombre ?? ""} />
                  <Row label="Doctor" value={doctor} />
                  <Row label="Hora" value={selectedTime} />
                </div>
                <button disabled={submitting} onClick={async () => { setSubmitting(true); try { await citasService.crear({ idAsignacionBloque: parseInt(selectedTime) }); setShowSuccess(true); } catch { alert("Error al crear la cita"); } finally { setSubmitting(false); } }} className="w-full bg-[#006FC1] text-white py-3 rounded-lg font-semibold hover:bg-[#005a9e] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">{submitting && <Loader2 size={18} className="animate-spin" />}Confirmar Cita</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, error, touched, children }: { label: string; error?: string; touched?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#05576D] mb-1">{label}</label>
      {children}
      {error && touched && <p className="text-xs text-[#FF82B6] mt-1">{error}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-sm text-gray-500">{label}:</span><span className="text-sm font-medium text-[#05576D]">{value}</span></div>;
}
