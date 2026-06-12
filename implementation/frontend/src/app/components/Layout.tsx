import { useState } from "react";
import {
  Calendar, Clock, User, Search, LayoutList, ClipboardList,
  Stethoscope, Bell, ChevronDown, LogOut, X, CalendarCheck,
  CheckCircle, Info, XCircle, Menu
} from "lucide-react";
import { CliniferLogo } from "./ClinifeLogo";

export type Role = "patient" | "secretary" | "doctor";
export type Screen =
  | "book-appointment"
  | "my-appointments"
  | "profile"
  | "appointment-scheduling"
  | "manage-appointments"
  | "search-patient-appointments"
  | "manage-doctor-availability"
  | "my-agenda"
  | "register-availability";

interface NavItem {
  id: Screen;
  label: string;
  icon: React.ReactNode;
}

const navItems: Record<Role, NavItem[]> = {
  patient: [
    { id: "my-appointments", label: "Mis Citas", icon: <Calendar size={18} /> },
    { id: "book-appointment", label: "Disponibilidad de Médicos", icon: <Search size={18} /> },
    { id: "profile", label: "Mi Perfil", icon: <User size={18} /> },
  ],
  secretary: [
    { id: "appointment-scheduling", label: "Agendar Cita", icon: <CalendarCheck size={18} /> },
    { id: "manage-appointments", label: "Gestionar Citas", icon: <ClipboardList size={18} /> },
    { id: "search-patient-appointments", label: "Buscar Citas de Paciente", icon: <Search size={18} /> },
    { id: "manage-doctor-availability", label: "Disponibilidad de Médicos", icon: <LayoutList size={18} /> },
    { id: "profile", label: "Mi Perfil", icon: <User size={18} /> },
  ],
  doctor: [
    { id: "my-agenda", label: "Mi Agenda", icon: <Calendar size={18} /> },
    { id: "register-availability", label: "Registrar Disponibilidad", icon: <Clock size={18} /> },
    { id: "profile", label: "Mi Perfil", icon: <User size={18} /> },
  ],
};

const roleLabels: Record<Role, string> = {
  patient: "Paciente",
  secretary: "Secretaria Administrativa",
  doctor: "Médico Especialista",
};

const roleColors: Record<Role, string> = {
  patient: "bg-[#0AC0AB]",
  secretary: "bg-[#006FC1]",
  doctor: "bg-[#0F96CB]",
};

interface Notification {
  id: number;
  type: "appointment" | "info" | "warning";
  message: string;
  time: string;
  read: boolean;
}

const sampleNotifications: Notification[] = [
  { id: 1, type: "appointment", message: "Su cita del 10 de junio a las 10:00 AM ha sido confirmada.", time: "Hace 2 horas", read: false },
  { id: 2, type: "info", message: "La propuesta de disponibilidad del Dr. García ha sido aprobada.", time: "Hace 5 horas", read: false },
  { id: 3, type: "warning", message: "Su cita con la Dra. López ha sido reprogramada para el 15 de junio.", time: "Hace 1 día", read: true },
];

interface LayoutProps {
  role: Role;
  userName: string;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function Layout({ role, userName, currentScreen, onNavigate, onLogout, children }: LayoutProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const notifIcon = (type: string) => {
    if (type === "appointment") return <CalendarCheck size={16} className="text-[#0AC0AB]" />;
    if (type === "info") return <Info size={16} className="text-[#006FC1]" />;
    return <XCircle size={16} className="text-[#FF82B6]" />;
  };

  const items = navItems[role];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#05576D] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex flex-col items-center px-6 py-6 border-b border-white/10">
          <CliniferLogo height={36} className="brightness-0 invert" />
          <span className={`mt-3 px-3 py-0.5 rounded-full text-xs text-white ${roleColors[role]}`}>
            {roleLabels[role]}
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {items.map((item) => {
            const active = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                  active
                    ? "bg-[#006FC1] text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-[60px] bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <div className="flex-1" />

          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF82B6] text-white text-[10px] rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>

            {/* Notification panel */}
            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-[#05576D]" style={{ fontSize: 14 }}>Notificaciones</h3>
                  <div className="flex items-center gap-2">
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-xs text-[#006FC1] hover:underline">
                        Marcar leídas
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-sm">Sin notificaciones</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-gray-50 ${!n.read ? "bg-blue-50/50" : ""}`}>
                        <div className="mt-0.5 flex-shrink-0">{notifIcon(n.type)}</div>
                        <div>
                          <p className="text-sm text-gray-700">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#006FC1] flex items-center justify-center text-white text-sm font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{userName}</p>
              <p className="text-xs text-gray-500">{roleLabels[role]}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
