import { useState } from "react";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Role } from "../Layout";

const roleLabels: Record<Role, string> = {
  patient: "Paciente",
  secretary: "Secretaria Administrativa",
  doctor: "Médico Especialista",
};

const roleColors: Record<Role, string> = {
  patient: "bg-[#0AC0AB]/15 text-[#059688]",
  secretary: "bg-[#006FC1]/15 text-[#006FC1]",
  doctor: "bg-[#0F96CB]/15 text-[#0F96CB]",
};

const PROFILE_DATA: Record<Role, { name: string; email: string; phone: string; specialty?: string }> = {
  patient: { name: "María García Pérez", email: "m.garcia@email.com", phone: "+51 987 654 321" },
  secretary: { name: "Ana Torres Vega", email: "a.torres@clinifer.pe", phone: "+51 976 111 222" },
  doctor: { name: "Dr. Carlos Ruiz Mendoza", email: "c.ruiz@clinifer.pe", phone: "+51 945 333 444", specialty: "Ginecología y Obstetricia" },
};

export function UserProfile({ role }: { role: Role }) {
  const profile = PROFILE_DATA[role];
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);

  const handleChangePass = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    if (!currentPass) { setPassError("Ingrese la contraseña actual"); return; }
    if (newPass.length < 6) { setPassError("La nueva contraseña debe tener al menos 6 caracteres"); return; }
    if (newPass !== confirmPass) { setPassError("Las contraseñas no coinciden"); return; }
    setPassSuccess(true);
    setCurrentPass(""); setNewPass(""); setConfirmPass("");
    setTimeout(() => setPassSuccess(false), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-[#05576D] mb-6" style={{ fontSize: 24, fontWeight: 700 }}>Mi Perfil</h1>

      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#006FC1] flex items-center justify-center text-white font-bold" style={{ fontSize: 24 }}>
            {profile.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-semibold text-[#05576D]" style={{ fontSize: 18 }}>{profile.name}</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role]}`}>
              {roleLabels[role]}
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <ReadonlyField label="Nombre completo" value={profile.name} />
          <ReadonlyField label="Rol" value={roleLabels[role]} />
          <ReadonlyField label="Correo electrónico" value={profile.email} />
          <ReadonlyField label="Teléfono" value={profile.phone} />
          {profile.specialty && (
            <ReadonlyField label="Especialidad" value={profile.specialty} />
          )}
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-[#05576D] mb-5" style={{ fontSize: 16 }}>Cambiar Contraseña</h3>

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

        <form onSubmit={handleChangePass} className="space-y-4">
          <PasswordField
            label="Contraseña actual"
            value={currentPass}
            onChange={setCurrentPass}
            show={showCurrentPass}
            onToggle={() => setShowCurrentPass(p => !p)}
          />
          <PasswordField
            label="Nueva contraseña"
            value={newPass}
            onChange={setNewPass}
            show={showNewPass}
            onToggle={() => setShowNewPass(p => !p)}
          />
          <PasswordField
            label="Confirmar nueva contraseña"
            value={confirmPass}
            onChange={setConfirmPass}
            show={showConfirmPass}
            onToggle={() => setShowConfirmPass(p => !p)}
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#006FC1] text-white rounded-lg font-medium hover:bg-[#005a9e] transition-colors text-sm"
          >
            Actualizar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#05576D] font-medium">
        {value}
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }: {
  label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#05576D] mb-1.5">
        {label} <span className="text-[#FF82B6]">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 pr-11 border border-[#05576D]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1] transition-colors"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}
