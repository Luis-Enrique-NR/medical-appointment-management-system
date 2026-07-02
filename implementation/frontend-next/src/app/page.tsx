"use client";

import { useState } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { Layout } from "@/components/Layout";
import { BookAppointment } from "@/components/patient/BookAppointment";
import { MyAppointments } from "@/components/patient/MyAppointments";
import { AppointmentDetail } from "@/components/patient/AppointmentDetail";
import { AppointmentScheduling } from "@/components/secretary/AppointmentScheduling";
import { ManageAppointments } from "@/components/secretary/ManageAppointments";
import { SearchPatientAppointments } from "@/components/secretary/SearchPatientAppointments";
import { ManageDoctorAvailability } from "@/components/secretary/ManageDoctorAvailability";
import { MyAgenda } from "@/components/doctor/MyAgenda";
import { RegisterAvailability } from "@/components/doctor/RegisterAvailability";
import { AvailabilityHistory } from "@/components/doctor/AvailabilityHistory";
import { UserProfile } from "@/components/shared/UserProfile";
import type { Role, Screen } from "@/lib/types";

const DEFAULT_SCREENS: Record<Role, Screen> = {
  patient: "my-appointments",
  secretary: "appointment-scheduling",
  doctor: "my-agenda",
};

interface AuthState {
  role: Role;
  userName: string;
}

export default function Home() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("my-appointments");

  const handleLogin = (role: Role, userName: string) => {
    setAuth({ role, userName });
    setCurrentScreen(DEFAULT_SCREENS[role]);
  };

  const handleLogout = () => {
    setAuth(null);
    setCurrentScreen("my-appointments");
  };

  if (!auth) return <LoginScreen onLogin={handleLogin} />;

  const renderScreen = () => {
    switch (currentScreen) {
      case "book-appointment": return <BookAppointment userName={auth.userName} />;
      case "my-appointments": return <MyAppointments />;
      case "appointment-detail": return <AppointmentDetail />;
      case "appointment-scheduling": return <AppointmentScheduling />;
      case "manage-appointments": return <ManageAppointments />;
      case "search-patient-appointments": return <SearchPatientAppointments />;
      case "manage-doctor-availability": return <ManageDoctorAvailability />;
      case "my-agenda": return <MyAgenda />;
      case "register-availability": return <RegisterAvailability />;
      case "availability-history": return <AvailabilityHistory />;
      case "profile": return <UserProfile role={auth.role} />;
      default: return null;
    }
  };

  return (
    <Layout
      role={auth.role}
      userName={auth.userName}
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      onLogout={handleLogout}
    >
      {renderScreen()}
    </Layout>
  );
}
