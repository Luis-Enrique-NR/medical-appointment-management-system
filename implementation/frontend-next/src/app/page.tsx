"use client";

import { useState } from "react";
import { AuthProvider, useAuth } from "@/providers/AuthContext";
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
import type { Screen } from "@/lib/types";

const DEFAULT_SCREENS: Record<string, Screen> = {
  patient: "my-appointments",
  secretary: "appointment-scheduling",
  doctor: "my-agenda",
};

function HomeContent() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>("my-appointments");

  if (loading) return null;
  if (!user) return <LoginScreen />;

  const renderScreen = () => {
    switch (currentScreen) {
      case "book-appointment": return <BookAppointment userName={user.userName} />;
      case "my-appointments": return <MyAppointments />;
      case "appointment-detail": return <AppointmentDetail />;
      case "appointment-scheduling": return <AppointmentScheduling />;
      case "manage-appointments": return <ManageAppointments />;
      case "search-patient-appointments": return <SearchPatientAppointments />;
      case "manage-doctor-availability": return <ManageDoctorAvailability />;
      case "my-agenda": return <MyAgenda />;
      case "register-availability": return <RegisterAvailability />;
      case "availability-history": return <AvailabilityHistory />;
      case "profile": return <UserProfile role={user.role} />;
      default: return null;
    }
  };

  return (
    <Layout
      role={user.role}
      userName={user.userName}
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      onLogout={() => {
        localStorage.removeItem("token");
        window.location.reload();
      }}
    >
      {renderScreen()}
    </Layout>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
