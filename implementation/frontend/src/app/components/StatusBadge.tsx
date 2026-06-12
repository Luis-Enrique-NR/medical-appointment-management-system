export type AppointmentStatus =
  | "Agendada"
  | "Cancelada"
  | "Atendida"
  | "Reprogramada"
  | "Pendiente"
  | "Rechazado"
  | "Disponible"
  | "Ocupado";

const statusConfig: Record<AppointmentStatus, { bg: string; text: string; border: string }> = {
  Agendada:     { bg: "bg-[#0AC0AB]/15", text: "text-[#0AC0AB]", border: "border-[#0AC0AB]/30" },
  Cancelada:    { bg: "bg-[#FF82B6]/15", text: "text-[#d45c8b]", border: "border-[#FF82B6]/30" },
  Atendida:     { bg: "bg-[#0F96CB]/15", text: "text-[#0F96CB]", border: "border-[#0F96CB]/30" },
  Reprogramada: { bg: "bg-[#006FC1]/15", text: "text-[#006FC1]", border: "border-[#006FC1]/30" },
  Pendiente:    { bg: "bg-gray-100",      text: "text-gray-600",  border: "border-gray-200" },
  Rechazado:    { bg: "bg-gray-200",      text: "text-gray-700",  border: "border-gray-300" },
  Disponible:   { bg: "bg-[#0AC0AB]/15", text: "text-[#0AC0AB]", border: "border-[#0AC0AB]/30" },
  Ocupado:      { bg: "bg-[#FF82B6]/15", text: "text-[#d45c8b]", border: "border-[#FF82B6]/30" },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {status}
    </span>
  );
}
