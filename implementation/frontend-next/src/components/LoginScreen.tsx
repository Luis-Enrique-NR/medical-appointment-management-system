"use client";
import { useState } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { CliniferLogo } from "./CliniferLogo";
import type { Role } from "@/lib/types";
import { API } from "@/lib/api";

interface LoginScreenProps { onLogin: (role: Role, userName: string) => void }

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/pub/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Error al iniciar sesión')

      const token = json.data.token as string
      localStorage.setItem('token', token)

      const payload = JSON.parse(atob(token.split('.')[1]))
      const authorities = payload.authorities as string[]
      let role: Role = 'patient'
      if (authorities.includes('ROLE_MEDICO')) role = 'doctor'
      else if (authorities.includes('ROLE_SECRETARIA')) role = 'secretary'

      onLogin(role, correo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
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
                Correo electrónico <span className="text-[#FF82B6]">*</span>
              </label>
              <input type="email" value={correo} onChange={e => setCorreo(e.target.value)}
                placeholder="Ingrese su correo" required
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
        </div>
      </div>
    </div>
  );
}
