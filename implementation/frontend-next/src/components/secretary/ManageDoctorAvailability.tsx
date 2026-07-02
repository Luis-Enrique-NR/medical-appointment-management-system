"use client";
import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const TIME_BLOCKS: string[] = [];
for (let h = 7; h <= 21; h++) {
  for (const m of [0, 30]) {
    TIME_BLOCKS.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
  }
}

const SPECIALTIES = ["Todas", "Ginecología", "Obstetricia", "Fertilidad"];

const CLINIC_ROOMS = ["Consultorio 1", "Consultorio 2", "Consultorio 3", "Consultorio 4", "Consultorio 5", "Consultorio 6"];

type SlotStatus = "por_revisar" | "aprobado" | "anulado";

interface SlotInfo {
  doctor: string;
  specialty: string;
  status: SlotStatus;
  conflict: boolean;
  room: string | null;
}

function buildInitialGrid(): Record<string, Record<string, SlotInfo[]>> {
  const g: Record<string, Record<string, SlotInfo[]>> = {};
  for (const day of DAYS) {
    g[day] = {};
    for (const block of TIME_BLOCKS) {
      g[day][block] = [];
    }
  }
  const seed: { day: string; block: string; doctor: string; specialty: string; status: SlotStatus; room?: string }[] = [
    { day: "Lun", block: "08:00", doctor: "Dra. Carmen López", specialty: "Ginecología", status: "por_revisar" },
    { day: "Lun", block: "08:30", doctor: "Dra. Carmen López", specialty: "Ginecología", status: "por_revisar" },
    { day: "Lun", block: "09:00", doctor: "Dra. Carmen López", specialty: "Ginecología", status: "por_revisar" },
    { day: "Lun", block: "09:00", doctor: "Dra. Patricia Vega", specialty: "Ginecología", status: "por_revisar" },
    { day: "Lun", block: "09:30", doctor: "Dra. Carmen López", specialty: "Ginecología", status: "por_revisar" },
    { day: "Lun", block: "09:30", doctor: "Dra. Patricia Vega", specialty: "Ginecología", status: "por_revisar" },
    { day: "Lun", block: "10:00", doctor: "Dr. Miguel Torres", specialty: "Obstetricia", status: "por_revisar" },
    { day: "Lun", block: "10:30", doctor: "Dr. Miguel Torres", specialty: "Obstetricia", status: "por_revisar" },
    { day: "Lun", block: "11:00", doctor: "Dr. Miguel Torres", specialty: "Obstetricia", status: "por_revisar" },
    { day: "Lun", block: "14:00", doctor: "Dr. Andrés Castro", specialty: "Fertilidad", status: "por_revisar" },
    { day: "Lun", block: "14:30", doctor: "Dr. Andrés Castro", specialty: "Fertilidad", status: "por_revisar" },
    { day: "Lun", block: "15:00", doctor: "Dr. Andrés Castro", specialty: "Fertilidad", status: "por_revisar", room: "Consultorio 5" },
    { day: "Lun", block: "15:30", doctor: "Dr. Andrés Castro", specialty: "Fertilidad", status: "aprobado", room: "Consultorio 5" },
    { day: "Lun", block: "14:00", doctor: "Dra. Sofia Morales", specialty: "Obstetricia", status: "por_revisar" },
    { day: "Lun", block: "14:30", doctor: "Dra. Sofia Morales", specialty: "Obstetricia", status: "por_revisar" },

    { day: "Mar", block: "08:00", doctor: "Dra. Patricia Vega", specialty: "Ginecología", status: "por_revisar" },
    { day: "Mar", block: "08:30", doctor: "Dra. Patricia Vega", specialty: "Ginecología", status: "por_revisar" },
    { day: "Mar", block: "09:00", doctor: "Dra. Carmen López", specialty: "Ginecología", status: "por_revisar", room: "Consultorio 2" },
    { day: "Mar", block: "09:00", doctor: "Dr. Andrés Castro", specialty: "Fertilidad", status: "anulado" },
    { day: "Mar", block: "09:30", doctor: "Dra. Carmen López", specialty: "Ginecología", status: "aprobado", room: "Consultorio 2" },
    { day: "Mar", block: "10:00", doctor: "Dra. Sofia Morales", specialty: "Obstetricia", status: "por_revisar" },
    { day: "Mar", block: "10:30", doctor: "Dra. Sofia Morales", specialty: "Obstetricia", status: "por_revisar" },
    { day: "Mar", block: "16:00", doctor: "Dr. Miguel Torres", specialty: "Obstetricia", status: "por_revisar" },
    { day: "Mar", block: "16:30", doctor: "Dr. Miguel Torres", specialty: "Obstetricia", status: "por_revisar" },

    { day: "Mié", block: "07:30", doctor: "Dra. Carmen López", specialty: "Ginecología", status: "por_revisar" },
    { day: "Mié", block: "08:00", doctor: "Dra. Carmen López", specialty: "Ginecología", status: "por_revisar" },
    { day: "Mié", block: "08:00", doctor: "Dra. Patricia Vega", specialty: "Ginecología", status: "por_revisar" },
    { day: "Mié", block: "08:30", doctor: "Dra. Carmen López", specialty: "Ginecología", status: "por_revisar" },
    { day: "Mié", block: "08:30", doctor: "Dra. Patricia Vega", specialty: "Ginecología", status: "por_revisar" },
    { day: "Mié", block: "11:00", doctor: "Dr. Andrés Castro", specialty: "Fertilidad", status: "por_revisar" },
    { day: "Mié", block: "11:30", doctor: "Dr. Andrés Castro", specialty: "Fertilidad", status: "por_revisar" },
    { day: "Mié", block: "14:00", doctor: "Dr. Miguel Torres", specialty: "Obstetricia", status: "por_revisar" },
    { day: "Mié", block: "14:30", doctor: "Dr. Miguel Torres", specialty: "Obstetricia", status: "por_revisar" },

    { day: "Jue", block: "07:00", doctor: "Dra. Sofia Morales", specialty: "Obstetricia", status: "por_revisar" },
    { day: "Jue", block: "07:30", doctor: "Dra. Sofia Morales", specialty: "Obstetricia", status: "por_revisar" },
    { day: "Jue", block: "09:00", doctor: "Dra. Patricia Vega", specialty: "Ginecología", status: "por_revisar" },
    { day: "Jue", block: "09:30", doctor: "Dra. Patricia Vega", specialty: "Ginecología", status: "por_revisar" },
    { day: "Jue", block: "11:00", doctor: "Dr. Miguel Torres", specialty: "Obstetricia", status: "por_revisar" },
    { day: "Jue", block: "11:30", doctor: "Dr. Miguel Torres", specialty: "Obstetricia", status: "por_revisar" },
    { day: "Jue", block: "16:00", doctor: "Dra. Carmen López", specialty: "Ginecología", status: "por_revisar" },
    { day: "Jue", block: "16:30", doctor: "Dra. Carmen López", specialty: "Ginecología", status: "por_revisar" },

    { day: "Vie", block: "09:00", doctor: "Dra. Carmen López", specialty: "Ginecología", status: "por_revisar" },
    { day: "Vie", block: "09:30", doctor: "Dra. Carmen López", specialty: "Ginecología", status: "por_revisar" },
    { day: "Vie", block: "10:00", doctor: "Dr. Andrés Castro", specialty: "Fertilidad", status: "por_revisar" },
    { day: "Vie", block: "10:30", doctor: "Dr. Andrés Castro", specialty: "Fertilidad", status: "por_revisar" },
    { day: "Vie", block: "14:00", doctor: "Dra. Patricia Vega", specialty: "Ginecología", status: "anulado" },
    { day: "Vie", block: "16:00", doctor: "Dra. Sofia Morales", specialty: "Obstetricia", status: "por_revisar" },
    { day: "Vie", block: "16:30", doctor: "Dra. Sofia Morales", specialty: "Obstetricia", status: "por_revisar" },

    { day: "Sáb", block: "09:00", doctor: "Dr. Miguel Torres", specialty: "Obstetricia", status: "por_revisar" },
    { day: "Sáb", block: "09:30", doctor: "Dr. Miguel Torres", specialty: "Obstetricia", status: "por_revisar" },
  ];
  for (const s of seed) {
    g[s.day][s.block].push({
      doctor: s.doctor,
      specialty: s.specialty,
      status: s.status,
      conflict: false,
      room: s.room ?? null,
    });
  }
  return g;
}

function detectConflicts(grid: Record<string, Record<string, SlotInfo[]>>): Record<string, Record<string, SlotInfo[]>> {
  const updated = JSON.parse(JSON.stringify(grid)) as typeof grid;
  for (const day of DAYS) {
    for (const block of TIME_BLOCKS) {
      const slots = updated[day][block] ?? [];
      const specialtiesInBlock = [...new Set(slots.map(s => s.specialty))];
      for (const sp of specialtiesInBlock) {
        const sameSpecialty = slots.filter(s => s.specialty === sp && s.status !== "anulado" && s.status !== "aprobado");
        const hasConflict = sameSpecialty.length >= 2;
        for (const slot of slots) {
          if (slot.specialty === sp && slot.status === "por_revisar") {
            slot.conflict = hasConflict;
          }
        }
      }
    }
  }
  return updated;
}

function getOccupiedRooms(grid: Record<string, Record<string, SlotInfo[]>>): Record<string, Set<string>> {
  const occupied: Record<string, Set<string>> = {};
  for (const day of DAYS) {
    for (const block of TIME_BLOCKS) {
      const key = `${day}|${block}`;
      occupied[key] = new Set();
      for (const slot of (grid[day][block] ?? [])) {
        if (slot.status === "aprobado" && slot.room) {
          occupied[key].add(slot.room);
        }
      }
    }
  }
  return occupied;
}

export function ManageDoctorAvailability() {
  const [specialty, setSpecialty] = useState("Todas");
  const [rawGrid, setRawGrid] = useState(buildInitialGrid);
  const [popover, setPopover] = useState<{ day: string; block: string; doctor: string; specialty: string; index: number } | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const grid = useMemo(() => detectConflicts(rawGrid), [rawGrid]);

  const occupiedRooms = useMemo(() => getOccupiedRooms(grid), [grid]);

  const handleChangeStatus = (day: string, block: string, index: number, newStatus: SlotStatus, room?: string | null) => {
    const doctorName = popover?.doctor ?? "";
    const n = JSON.parse(JSON.stringify(rawGrid)) as typeof rawGrid;
    const slot = n[day][block][index];
    slot.status = newStatus;
    let annulCount = 0;
    if (newStatus === "anulado") {
      slot.room = null;
      slot.conflict = false;
    } else if (newStatus === "aprobado" && room) {
      slot.room = room;
      const sameSpecialty = n[day][block].filter(
        (s, i) => s.specialty === slot.specialty && i !== index && s.status === "por_revisar"
      );
      for (const s of sameSpecialty) {
        s.status = "anulado";
        s.room = null;
        s.conflict = false;
        annulCount++;
      }
    } else if (newStatus === "por_revisar") {
      slot.room = null;
    }
    setRawGrid(n);
    setPopover(null);
    const msg = annulCount > 0
      ? `"${doctorName}" aprobado en ${day} ${block}. ${annulCount} bloque(s) en conflicto anulado(s) automáticamente.`
      : `Bloque de ${doctorName} actualizado a "${newStatus === "por_revisar" ? "Por revisar" : newStatus === "aprobado" ? "Aprobado" : "Anulado"}".`;
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const slotsForSpecialty = (day: string, block: string): SlotInfo[] => {
    const all = grid[day]?.[block] ?? [];
    if (specialty === "Todas") return all;
    return all.filter(s => s.specialty === specialty);
  };

  const statusStyle = (status: SlotStatus, conflict: boolean): string => {
    if (status === "aprobado") return "bg-[#0AC0AB] text-white border-[#0AC0AB]";
    if (status === "anulado") return "bg-[#555555] text-white border-[#555555] line-through";
    if (conflict) return "bg-[#E0E0E0] text-gray-700 border-[#FF82B6] ring-2 ring-[#FF82B6]";
    return "bg-[#E0E0E0] text-gray-700 border-gray-300";
  };

  return (
    <div>
      <h1 className="text-[#05576D] mb-6 text-2xl font-bold">Disponibilidad de Médicos</h1>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 bg-[#0AC0AB]/15 border border-[#0AC0AB]/40 text-[#059688] px-4 py-3 rounded-lg text-sm">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        {SPECIALTIES.map(s => (
          <button key={s} onClick={() => setSpecialty(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${specialty === s ? "bg-[#006FC1] text-white border-[#006FC1]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>{s}</button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[#0AC0AB] text-white border-[#0AC0AB]">Aprobado</span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[#E0E0E0] text-gray-700 border-gray-300">Por revisar</span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[#555555] text-white border-[#555555]">Anulado</span>
        <span className="flex items-center gap-1.5 text-gray-500"><AlertTriangle size={12} className="text-[#FF82B6]" /> Conflicto de horario</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]" style={{ fontSize: 11 }}>
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-2 py-2 font-semibold text-gray-500 w-16">Horario</th>
                {DAYS.map(d => <th key={d} className="text-center px-1 py-2 font-semibold text-gray-500">{d}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {TIME_BLOCKS.map(block => (
                <tr key={block}>
                  <td className="px-2 py-1 text-gray-500 font-medium whitespace-nowrap">{block}</td>
                  {DAYS.map(day => {
                    const slots = slotsForSpecialty(day, block);
                    return (
                      <td key={day} className="px-0.5 py-0.5 align-top">
                        <div className="flex flex-col gap-0.5 min-h-5">
                          {slots.map((slot, i) => {
                            return (
                              <div key={i}
                                onClick={() => setPopover({ day, block, doctor: slot.doctor, specialty: slot.specialty, index: i })}
                                className={`relative px-1 py-0.5 rounded border cursor-pointer transition-colors ${statusStyle(slot.status, slot.conflict)}`}>
                                <p className="truncate max-w-[90px] font-medium">{slot.doctor}</p>
                                {slot.room && slot.status === "aprobado" && (
                                  <p className="text-[9px] opacity-80">{slot.room}</p>
                                )}
                                {slot.conflict && (
                                  <span className="absolute -top-1 -right-1"><AlertTriangle size={9} className="text-[#FF82B6]" /></span>
                                )}
                              </div>
                            );
                          })}
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

      {popover && (() => {
        const cs = grid[popover.day]?.[popover.block]?.[popover.index];
        const safeSlot: SlotInfo = cs ?? { doctor: popover.doctor, specialty: popover.specialty, status: "por_revisar", conflict: false, room: null };
        const slotsAtBlock = grid[popover.day]?.[popover.block] ?? [];
        const conflict = slotsAtBlock.filter(
          s => s.specialty === popover.specialty && s.status !== "anulado" && s.status !== "aprobado"
        ).length >= 2;
        return (
          <PopoverPanel
            currentSlot={safeSlot}
            doctor={popover.doctor}
            specialty={popover.specialty}
            day={popover.day}
            block={popover.block}
            conflict={conflict}
            occupiedRooms={occupiedRooms}
            roomKey={`${popover.day}|${popover.block}`}
            onClose={() => setPopover(null)}
            onChangeStatus={(status, room) => handleChangeStatus(popover.day, popover.block, popover.index, status, room)}
          />
        );
      })()}
    </div>
  );
}

function PopoverPanel({
  currentSlot, doctor, specialty, day, block, conflict,
  occupiedRooms, roomKey, onClose, onChangeStatus,
}: {
  currentSlot: SlotInfo;
  doctor: string;
  specialty: string;
  day: string;
  block: string;
  conflict: boolean;
  occupiedRooms: Record<string, Set<string>>;
  roomKey: string;
  onClose: () => void;
  onChangeStatus: (status: SlotStatus, room?: string | null) => void;
}) {
  const [selectedAction, setSelectedAction] = useState<SlotStatus>(currentSlot.status ?? "por_revisar");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(currentSlot.room);

  const occupiedAtBlock = occupiedRooms[roomKey] || new Set();

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#05576D] text-sm">Gestionar Bloque</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="space-y-1.5 text-sm mb-4 bg-gray-50 rounded-xl p-3">
          <p><span className="text-gray-500">Doctor:</span> <strong>{doctor}</strong></p>
          <p><span className="text-gray-500">Especialidad:</span> {specialty}</p>
          <p><span className="text-gray-500">Día:</span> {day} &middot; {block}</p>
          {conflict && (
            <div className="flex items-center gap-1.5 text-[#FF82B6] text-xs mt-1">
              <AlertTriangle size={12} /> Conflicto detectado: múltiples doctores
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#05576D] mb-2">Estado del bloque</label>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setSelectedAction("por_revisar")}
              className={`py-2 rounded-lg text-xs font-medium border transition-colors ${selectedAction === "por_revisar" ? "bg-[#E0E0E0] text-gray-800 border-gray-400 ring-2 ring-gray-300" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
              Por revisar
            </button>
            <button onClick={() => setSelectedAction("aprobado")}
              className={`py-2 rounded-lg text-xs font-medium border transition-colors ${selectedAction === "aprobado" ? "bg-[#0AC0AB] text-white border-[#0AC0AB] ring-2 ring-[#0AC0AB]/40" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
              Aprobado
            </button>
            <button onClick={() => setSelectedAction("anulado")}
              className={`py-2 rounded-lg text-xs font-medium border transition-colors ${selectedAction === "anulado" ? "bg-[#555555] text-white border-[#555555] ring-2 ring-gray-400" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
              Anulado
            </button>
          </div>
        </div>

        {selectedAction === "aprobado" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#05576D] mb-2">
              Asignar Consultorio <span className="text-[#FF82B6]">*</span>
            </label>
            <div className="max-h-44 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
              {CLINIC_ROOMS.map(room => {
                const isOccupied = occupiedAtBlock.has(room);
                const isSelected = selectedRoom === room;
                return (
                  <button key={room}
                    disabled={isOccupied}
                    onClick={() => { if (!isOccupied) setSelectedRoom(room); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${isSelected && isOccupied ? "bg-[#FF82B6]/10" : ""} ${isSelected && !isOccupied ? "bg-[#0AC0AB]/10" : ""} ${isOccupied && !isSelected ? "opacity-60" : "hover:bg-gray-50"} ${isOccupied ? "cursor-not-allowed" : "cursor-pointer"}`}>
                    <span className={`font-medium ${isSelected && !isOccupied ? "text-[#0AC0AB]" : isOccupied ? "text-[#d45c8b]" : "text-gray-700"}`}>{room}</span>
                    <span className={`text-xs font-medium ${isOccupied ? "text-[#d45c8b]" : "text-[#0AC0AB]"}`}>
                      {isOccupied ? "Ocupado / Bloqueado" : "Disponible"}
                    </span>
                  </button>
                );
              })}
            </div>
            {conflict && (
              <p className="text-xs text-[#FF82B6] mt-1.5 flex items-center gap-1">
                <AlertTriangle size={10} /> Hay conflicto en este horario. Verifique la asignación.
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button
            disabled={selectedAction === "aprobado" && !selectedRoom}
            onClick={() => {
              if (selectedAction === currentSlot.status && selectedRoom === currentSlot.room) { onClose(); return; }
              onChangeStatus(selectedAction, selectedAction === "aprobado" ? selectedRoom : null);
            }}
            className="flex-1 py-2 bg-[#006FC1] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
