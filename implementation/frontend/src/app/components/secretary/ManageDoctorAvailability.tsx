import { useState } from "react";
import { AlertTriangle, Check, X, CheckCircle2 } from "lucide-react";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const TIME_BLOCKS = ["07:00–09:00", "09:00–11:00", "11:00–13:00", "14:00–16:00", "16:00–18:00", "18:00–20:00"];

const SPECIALTIES = ["Todas", "Ginecología", "Obstetricia", "Fertilidad"];

type SlotStatus = "Disponible" | "Ocupado" | "Pendiente" | "Rechazado";

interface SlotData {
  doctor: string;
  status: SlotStatus;
  pending?: boolean;
  conflict?: boolean;
}

const INITIAL_GRID: Record<string, Record<string, SlotData[]>> = {
  "Lun": {
    "07:00–09:00": [{ doctor: "Dra. Carmen López", status: "Disponible" }, { doctor: "Dra. Patricia Vega", status: "Ocupado" }],
    "09:00–11:00": [{ doctor: "Dr. Miguel Torres", status: "Pendiente", pending: true }, { doctor: "Dra. Sofia Morales", status: "Pendiente", pending: true, conflict: true }],
    "11:00–13:00": [{ doctor: "Dr. Andrés Castro", status: "Disponible" }],
    "14:00–16:00": [{ doctor: "Dra. Carmen López", status: "Ocupado" }],
    "16:00–18:00": [],
    "18:00–20:00": [{ doctor: "Dr. Miguel Torres", status: "Rechazado" }],
  },
  "Mar": {
    "07:00–09:00": [{ doctor: "Dra. Patricia Vega", status: "Disponible" }],
    "09:00–11:00": [{ doctor: "Dra. Carmen López", status: "Disponible" }, { doctor: "Dr. Andrés Castro", status: "Pendiente", pending: true }],
    "11:00–13:00": [],
    "14:00–16:00": [{ doctor: "Dra. Sofia Morales", status: "Ocupado" }],
    "16:00–18:00": [{ doctor: "Dr. Miguel Torres", status: "Disponible" }],
    "18:00–20:00": [],
  },
  "Mié": { "07:00–09:00": [], "09:00–11:00": [{ doctor: "Dra. Carmen López", status: "Disponible" }], "11:00–13:00": [], "14:00–16:00": [{ doctor: "Dr. Andrés Castro", status: "Pendiente", pending: true }], "16:00–18:00": [], "18:00–20:00": [] },
  "Jue": { "07:00–09:00": [{ doctor: "Dra. Sofia Morales", status: "Disponible" }], "09:00–11:00": [], "11:00–13:00": [{ doctor: "Dr. Miguel Torres", status: "Ocupado" }], "14:00–16:00": [], "16:00–18:00": [{ doctor: "Dra. Patricia Vega", status: "Pendiente", pending: true }], "18:00–20:00": [] },
  "Vie": { "07:00–09:00": [], "09:00–11:00": [{ doctor: "Dra. Carmen López", status: "Disponible" }], "11:00–13:00": [], "14:00–16:00": [], "16:00–18:00": [], "18:00–20:00": [] },
  "Sáb": { "07:00–09:00": [], "09:00–11:00": [], "11:00–13:00": [], "14:00–16:00": [], "16:00–18:00": [], "18:00–20:00": [] },
};

const STATUS_COLORS: Record<SlotStatus, string> = {
  Disponible: "bg-[#0AC0AB]/20 text-[#059688] border-[#0AC0AB]/30",
  Ocupado: "bg-[#FF82B6]/20 text-[#d45c8b] border-[#FF82B6]/30",
  Pendiente: "bg-gray-100 text-gray-600 border-gray-200",
  Rechazado: "bg-gray-200 text-gray-700 border-gray-300",
};

interface PendingSlot { day: string; block: string; doctor: string; index: number; }

export function ManageDoctorAvailability() {
  const [specialty, setSpecialty] = useState("Todas");
  const [grid, setGrid] = useState(INITIAL_GRID);
  const [showApprovalPanel, setShowApprovalPanel] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const allPending: PendingSlot[] = [];
  for (const day of DAYS) {
    for (const block of TIME_BLOCKS) {
      (grid[day]?.[block] ?? []).forEach((slot, index) => {
        if (slot.pending) allPending.push({ day, block, doctor: slot.doctor, index });
      });
    }
  }

  const handleDecision = (p: PendingSlot, accept: boolean) => {
    setGrid(prev => {
      const newGrid = JSON.parse(JSON.stringify(prev));
      const slot = newGrid[p.day][p.block][p.index];
      slot.pending = false;
      slot.status = accept ? "Disponible" : "Rechazado";
      return newGrid;
    });
  };

  const handleConfirmAll = () => {
    setShowApprovalPanel(false);
    setSuccessMsg("Disponibilidad actualizada. Los médicos han sido notificados.");
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[#05576D]" style={{ fontSize: 24, fontWeight: 700 }}>Disponibilidad de Médicos</h1>
        <button
          onClick={() => setShowApprovalPanel(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] transition-colors"
        >
          Revisar y Aprobar
          {allPending.length > 0 && (
            <span className="bg-[#FF82B6] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {allPending.length}
            </span>
          )}
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 bg-[#0AC0AB]/15 border border-[#0AC0AB]/40 text-[#059688] px-4 py-3 rounded-lg text-sm">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Specialty filter */}
      <div className="flex gap-2 mb-5">
        {SPECIALTIES.map(s => (
          <button
            key={s}
            onClick={() => setSpecialty(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              specialty === s ? "bg-[#006FC1] text-white border-[#006FC1]" : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        {(["Disponible", "Ocupado", "Pendiente", "Rechazado"] as SlotStatus[]).map(s => (
          <span key={s} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${STATUS_COLORS[s]}`}>{s}</span>
        ))}
        <span className="flex items-center gap-1.5 text-gray-500"><AlertTriangle size={12} className="text-[#FF82B6]" /> Conflicto de consultorios</span>
      </div>

      {/* Weekly grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-32">Horario</th>
                {DAYS.map(d => (
                  <th key={d} className="text-center px-3 py-3 text-xs font-semibold text-gray-500">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {TIME_BLOCKS.map(block => (
                <tr key={block}>
                  <td className="px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">{block}</td>
                  {DAYS.map(day => {
                    const slots = grid[day]?.[block] ?? [];
                    return (
                      <td key={day} className="px-2 py-2 align-top">
                        <div className="flex flex-col gap-1 min-h-8">
                          {slots.map((slot, i) => (
                            <div
                              key={i}
                              className={`relative px-2 py-1 rounded-lg border text-xs ${STATUS_COLORS[slot.status]} ${slot.conflict ? "ring-1 ring-[#FF82B6]" : ""}`}
                            >
                              <p className="font-medium truncate max-w-[100px]">{slot.doctor}</p>
                              {slot.conflict && (
                                <span title="Conflicto: supera consultorios disponibles" className="absolute -top-1.5 -right-1.5">
                                  <AlertTriangle size={12} className="text-[#d45c8b]" />
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalPanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-[#05576D]" style={{ fontSize: 17 }}>Panel de Aprobación</h3>
                <p className="text-xs text-gray-500 mt-0.5">{allPending.length} propuestas pendientes</p>
              </div>
              <button onClick={() => setShowApprovalPanel(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {allPending.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">No hay propuestas pendientes</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {allPending.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-[#05576D]">{p.doctor}</p>
                        <p className="text-xs text-gray-500">{p.day} · {p.block}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDecision(p, false)}
                          className="p-2 rounded-lg bg-[#FF82B6]/15 text-[#d45c8b] hover:bg-[#FF82B6]/30 transition-colors"
                          title="Rechazar"
                        >
                          <X size={16} />
                        </button>
                        <button
                          onClick={() => handleDecision(p, true)}
                          className="p-2 rounded-lg bg-[#0AC0AB]/15 text-[#059688] hover:bg-[#0AC0AB]/30 transition-colors"
                          title="Aprobar"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 px-6 py-4">
              <button
                onClick={handleConfirmAll}
                className="w-full py-3 bg-[#006FC1] text-white rounded-lg font-medium hover:bg-[#005a9e] transition-colors"
              >
                Confirmar Decisiones
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
