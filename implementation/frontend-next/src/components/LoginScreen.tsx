"use client";
import { useState } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { CliniferLogo } from "./CliniferLogo";
import type { Role } from "@/lib/types";

interface LoginScreenProps { onLogin: (role: Role, userName: string) => void }

const DEMO_USERS: Record<string, { password: string; role: Role; name: string }> = {
  paciente: { password: "clinifer", role: "patient", name: "María García" },
  secretaria: { password: "clinifer", role: "secretary", name: "Ana Torres" },
  medico: { password: "clinifer", role: "doctor", name: "Dr. Carlos Ruiz" },
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const user = DEMO_USERS[username.toLowerCase()];
      if (user && user.password === password) { onLogin(user.role, user.name); }
      else { setError("Usuario o contraseña incorrectos. Intente de nuevo."); setLoading(false); }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0F96CB 0%, #05576D 100%)" }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <CliniferLogo height={52} />
          </div>
          <h1 className="text-center text-[#05576D] mb-1" style={{ fontSize: 22, fontWeight: 600 }}>
            Sistema de Gestión de Citas
          </h1>
          <p className="text-center text-gray-500 mb-8 text-sm">Ingrese sus credenciales para continuar</p>
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-[#FF82B6]/15 border border-[#FF82B6]/40 text-[#c45c80] px-4 py-3 rounded-lg text-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-[#05576D] mb-1.5">
                Usuario <span className="text-[#FF82B6]">*</span>
              </label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Ingrese su usuario" required
                className="w-full px-3.5 py-2.5 bg-white border border-[#05576D]/30 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1] transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#05576D] mb-1.5">
                Contraseña <span className="text-[#FF82B6]">*</span>
              </label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña" required
                  className="w-full px-3.5 py-2.5 pr-11 bg-white border border-[#05576D]/30 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1] transition-colors text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#006FC1] hover:bg-[#005a9e] disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition-colors text-sm">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Iniciando sesión...</> : "Iniciar Sesión"}
            </button>
          </form>
          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 text-center font-medium mb-1">Usuarios de demostración (contraseña: clinifer)</p>
            <div className="flex justify-center gap-4 flex-wrap">
              {Object.entries(DEMO_USERS).map(([u, d]) => (
                <button key={u} onClick={() => { setUsername(u); setPassword("clinifer"); setError(""); }}
                  className="text-xs text-[#006FC1] hover:underline">
                  {u} ({d.role === "patient" ? "Paciente" : d.role === "secretary" ? "Secretaria" : "Médico"})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
