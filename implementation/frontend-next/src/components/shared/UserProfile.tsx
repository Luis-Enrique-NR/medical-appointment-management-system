"use client";
import { useState } from "react";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { Role } from "@/lib/types";
import { authService } from "@/services/auth";

const roleLabels: Record<Role, string> = {
  patient: "Paciente", secretary: "Secretaria Administrativa", doctor: "Médico Especialista",
};
const roleColors: Record<Role, string> = {
  patient: "bg-[#0AC0AB]/15 text-[#059688]", secretary: "bg-[#006FC1]/15 text-[#006FC1]", doctor: "bg-[#0F96CB]/15 text-[#0F96CB]",
};

const PROFILE_DATA: Record<Role, { name: string; email: string; phone: string; specialty?: string }> = {
  patient: { name: "María García Pérez", email: "m.garcia@email.com", phone: "+51 987 654 321" },
  secretary: { name: "Ana Torres Vega", email: "a.torres@clinifer.pe", phone: "+51 976 111 222" },
  doctor: { name: "Dr. Carlos Ruiz Mendoza", email: "c.ruiz@clinifer.pe", phone: "+51 945 333 444", specialty: "Ginecología y Obstetricia" },
};

export function UserProfile({ role }: { role: Role }) {
  const profile = PROFILE_DATA[role];
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-[#05576D] mb-6 text-2xl font-bold">Mi Perfil</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#006FC1] flex items-center justify-center text-white font-bold text-2xl">{profile.name.charAt(0)}</div>
          <div>
            <h2 className="font-semibold text-[#05576D] text-lg">{profile.name}</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role]}`}>{roleLabels[role]}</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <ReadonlyField label="Nombre" value={profile.name} />
          <ReadonlyField label="Rol" value={roleLabels[role]} />
          <ReadonlyField label="Correo" value={profile.email} />
          <ReadonlyField label="Teléfono" value={profile.phone} />
          {profile.specialty && <ReadonlyField label="Especialidad" value={profile.specialty} />}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-[#05576D] mb-5 text-base">Cambiar Contraseña</h3>
        {passSuccess && (
          <div className="mb-4 flex items-center gap-2 bg-[#0AC0AB]/15 border border-[#0AC0AB]/40 text-[#059688] px-4 py-3 rounded-lg text-sm">
            <CheckCircle2 size={16} /> Contraseña actualizada exitosamente.
          </div>
        )}
        {passError && (
          <div className="mb-4 flex items-center gap-2 bg-[#FF82B6]/15 border border-[#FF82B6]/30 text-[#d45c8b] px-4 py-3 rounded-lg text-sm">
            <AlertCircle size={16} /> {passError}
          </div>
        )}
        <form onSubmit={async e => { e.preventDefault(); setPassError(""); if (!currentPass) { setPassError("Ingrese la contraseña actual"); return; } if (newPass.length < 6) { setPassError("Mínimo 6 caracteres"); return; } if (newPass !== confirmPass) { setPassError("Las contraseñas no coinciden"); return; } setPassLoading(true); try { await authService.changePassword(currentPass, newPass); setPassSuccess(true); setCurrentPass(""); setNewPass(""); setConfirmPass(""); setTimeout(() => setPassSuccess(false), 4000); } catch { setPassError("Error al actualizar la contraseña. Verifique sus datos."); } finally { setPassLoading(false); } }} className="space-y-4">
          <PasswordField label="Contraseña actual" value={currentPass} onChange={setCurrentPass} show={showCurrent} onToggle={() => setShowCurrent(p => !p)} />
          <PasswordField label="Nueva contraseña" value={newPass} onChange={setNewPass} show={showNew} onToggle={() => setShowNew(p => !p)} />
          <PasswordField label="Confirmar contraseña" value={confirmPass} onChange={setConfirmPass} show={showConfirm} onToggle={() => setShowConfirm(p => !p)} />
          <button type="submit" disabled={passLoading} className="w-full sm:w-auto px-6 py-2.5 bg-[#006FC1] text-white rounded-lg font-medium hover:bg-[#005a9e] disabled:opacity-60 transition-colors text-sm flex items-center gap-2">{passLoading && <Loader2 size={16} className="animate-spin" />}Actualizar Contraseña</button>
        </form>
      </div>
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-medium text-gray-500 mb-1">{label}</p><p className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#05576D] font-medium">{value}</p></div>;
}

function PasswordField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#05576D] mb-1.5">{label} <span className="text-[#FF82B6]">*</span></label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 pr-11 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1] transition-colors" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}
