"use client";
import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, User, Hash, Phone, FileText } from "lucide-react";
import { pacientesService } from "@/services/pacientes";

interface Props {
  onComplete: () => void;
}

export function CompleteRegistration({ onComplete }: Props) {
  const [dni, setDni] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^\d{7,8}$/.test(dni)) {
      setError("El DNI debe tener 7 u 8 dígitos.");
      return;
    }

    setLoading(true);
    try {
      await pacientesService.register(dni, nombres, apellidos, telefono);
      localStorage.removeItem("pendingProfile");
      setSuccess(true);
      setTimeout(onComplete, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg || "No se pudieron guardar los datos. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0F96CB 0%, #05576D 100%)" }}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <CheckCircle2 size={56} className="mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-semibold text-[#05576D] mb-2">¡Registro completado!</h2>
          <p className="text-gray-500 text-sm">Será redirigido al sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0F96CB 0%, #05576D 100%)" }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-[#006FC1]/10">
              <FileText size={24} className="text-[#006FC1]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#05576D]">Completar registro</h2>
              <p className="text-gray-500 text-xs">Ingrese sus datos personales</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 bg-[#FF82B6]/15 border border-[#FF82B6]/40 text-[#c45c80] px-4 py-3 rounded-lg text-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[#05576D] mb-1.5">
                DNI <span className="text-[#FF82B6]">*</span>
              </label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={dni} onChange={e => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="12345678" required maxLength={8}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#05576D]/30 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1] transition-colors text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#05576D] mb-1.5">
                Nombres <span className="text-[#FF82B6]">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={nombres} onChange={e => setNombres(e.target.value)}
                  placeholder="Luis Fernando" required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#05576D]/30 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1] transition-colors text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#05576D] mb-1.5">
                Apellidos <span className="text-[#FF82B6]">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={apellidos} onChange={e => setApellidos(e.target.value)}
                  placeholder="Núñez Rojas" required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#05576D]/30 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1] transition-colors text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#05576D] mb-1.5">
                Teléfono <span className="text-[#FF82B6]">*</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  placeholder="912345678" required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#05576D]/30 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006FC1]/30 focus:border-[#006FC1] transition-colors text-sm" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#006FC1] hover:bg-[#005a9e] disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition-colors text-sm mt-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : "Guardar datos"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
